from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import numpy as np
import pandas as pd
from scipy.sparse.linalg import svds
import requests
from dotenv import load_dotenv
import os
from datetime import timedelta
import re

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ── Config ─────────────────────────────
app.config['SQLALCHEMY_DATABASE_URI']        = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY']                 = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES']       = timedelta(days=7)

db  = SQLAlchemy(app)
jwt = JWTManager(app)

TMDB_API_KEY  = os.getenv('TMDB_API_KEY')
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

poster_cache = {}

# ── DATABASE MODELS ─────────────────────────────
class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80), unique=True, nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)


class Playlist(db.Model):
    __tablename__ = 'playlists'
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300))
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movies      = db.Column(db.JSON, default=list)

with app.app_context():
    db.create_all()

# ── LOAD DATA ─────────────────────────────
column_names = ['user_id', 'item_id', 'rating', 'timestamp']
df = pd.read_csv('u.data', sep='\t', names=column_names)
movie_titles = pd.read_csv("Movie_Id_Titles")

df = pd.merge(df, movie_titles, on='item_id')

# Filter sparse data
user_counts = df.groupby('user_id')['rating'].count()
movie_counts = df.groupby('item_id')['rating'].count()
df = df[df['user_id'].isin(user_counts[user_counts >= 50].index) &
        df['item_id'].isin(movie_counts[movie_counts >= 10].index)]

# Reindex
df['user_id'] = pd.Categorical(df['user_id']).codes + 1
df['item_id'] = pd.Categorical(df['item_id']).codes + 1

# Movie stats
movie_stats = df.groupby('item_id').agg(
    avg_rating=('rating', 'mean'),
    num_ratings=('rating', 'count')
).reset_index()
movie_stats = pd.merge(movie_stats, movie_titles, on='item_id')

# Genre data
movies_df = pd.read_csv('u.item', sep='|', encoding='latin-1', header=None)
movies_df.columns = [
    'item_id','title','release_date','video_release','imdb_url',
    'unknown','Action','Adventure','Animation','Childrens','Comedy','Crime',
    'Documentary','Drama','Fantasy','Film_Noir','Horror','Musical','Mystery',
    'Romance','Sci_Fi','Thriller','War','Western'
]

# ── BUILD SVD MODEL ─────────────────────────────
n_users = df['user_id'].nunique()
n_items = df['item_id'].nunique()
ratings_matrix = np.zeros((n_users, n_items))

for row in df.itertuples():
    ratings_matrix[row.user_id - 1, row.item_id - 1] = row.rating

u, s, vt = svds(ratings_matrix, k=20)
X_pred = np.dot(np.dot(u, np.diag(s)), vt)

print("✅ SVD Ready")

# ── HELPERS ─────────────────────────────
def get_poster(title):
    if title in poster_cache:
        return poster_cache[title]

    try:
        # ✅ REMOVE YEAR (e.g. "Toy Story (1995)" → "Toy Story")
        clean_title = re.sub(r"\(\d{4}\)", "", title).strip()

        response = requests.get(
            f'{TMDB_BASE_URL}/search/movie',
            params={
                'api_key': TMDB_API_KEY,
                'query': clean_title
            },
            timeout=5
        )

        data = response.json()

        poster = None
        if data.get('results'):
            path = data['results'][0].get('poster_path')
            if path:
                poster = f'https://image.tmdb.org/t/p/w200{path}'

        poster_cache[title] = poster
        return poster

    except Exception:
        return None


def hybrid_recommendations(user_id, user_ratings=None, genres=None, era=None, top_n=20):
    user_index = int(user_id) - 1
    user_scores = X_pred[user_index]

    df_scores = pd.DataFrame({
        'item_id': range(1, n_items + 1),
        'svd_score': user_scores
    })

    merged = pd.merge(df_scores, movie_stats, on='item_id')
    merged = pd.merge(merged, movies_df, on='item_id', suffixes=('_stats', '_meta'))

    # ── Boost based on user ratings ──
    if user_ratings:
        watched_ids = []
        for r in user_ratings:
            item_id = r['item_id']
            rating = r.get('rating', 0)
            merged.loc[merged['item_id'] == item_id, 'svd_score'] += rating / 5.0
            watched_ids.append(item_id)
        # Optional: remove watched movies
        merged = merged[~merged['item_id'].isin(watched_ids)]

    # ── Genre filter ──
    if genres:
        valid = [g for g in genres if g in merged.columns]
        if valid:
            merged = merged[merged[valid].sum(axis=1) > 0]

    # ── Era filter ──
    if era:
        merged['year'] = pd.to_datetime(merged['release_date'], errors='coerce').dt.year
        merged = merged[(merged['year'] >= era['start']) & (merged['year'] <= era['end'])]

    # ── Normalize and final score ──
    merged['norm_rating'] = merged['avg_rating'] / 5.0
    merged['final_score'] = 0.7 * merged['svd_score'] + 0.3 * merged['norm_rating']

    results = []
    for _, row in merged.sort_values('final_score', ascending=False).head(top_n).iterrows():
        results.append({
            'item_id': int(row['item_id']),
            'title': row['title_stats'],
            'score': round(float(row['final_score']), 2),
            'poster': get_poster(row['title_stats']),
            'avg_rating': round(float(row['avg_rating']), 2),
            'num_ratings': int(row['num_ratings'])
        })

    return results

# ── ROUTES ─────────────────────────────
@app.route('/')
def home():
    return jsonify({'message': 'API running'})

@app.route('/recommendations/hybrid', methods=['POST'])
@jwt_required()
def hybrid_route():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        results = hybrid_recommendations(
            user_id=user_id,
            user_ratings=data.get('user_ratings', []),
            genres=data.get('genres'),
            era=data.get('era'),
            top_n=data.get('top_n', 20)
        )
        return jsonify({
            'status': 'success',
            'type': 'hybrid',
            'count': len(results),
            'movies': results
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/playlists', methods=['GET'])
@jwt_required()
def playlist_route():
        try:
            user_id = get_jwt_identity()
            playlists = Playlist.query.filter_by(user_id=user_id).all()
            results = []
            for pl in playlists:
                results.append({
                    'id': pl.id,
                    'name': pl.name,
                    'description': pl.description,
                    'movies': pl.movies
                })
            return jsonify({'status': 'success', 'playlists': results})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
        
@app.route('/playlists', methods=['POST'])
@jwt_required()
def create_playlist():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')

        if not name:
            return jsonify({'status': 'error', 'message': 'Name is required'}), 400

        new_playlist = Playlist(name=name, description=description, user_id=user_id)
        db.session.add(new_playlist)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'playlist': {
                'id': new_playlist.id,
                'name': new_playlist.name,
                'description': new_playlist.description,
                'movies': new_playlist.movies
            }
        }), 201

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
@app.route("/playlists/<int:playlist_id>/movies/<int:movie_id>", methods=["POST", "DELETE", "PUT"])
@jwt_required()
def modify_playlist_movie(playlist_id, movie_id):
    try:
        user_id = get_jwt_identity()
        playlist = Playlist.query.filter_by(id=playlist_id, user_id=user_id).first()
        if not playlist:
            return jsonify({"status": "error", "message": "Playlist not found"}), 404

        if request.method == "POST":
            if not any(m.get("item_id") == movie_id for m in playlist.movies):
                playlist.movies.append({
                    "item_id": movie_id,
                    "title": request.json.get("title", "Unknown")
                })
                db.session.commit()
            return jsonify({"status": "success", "message": "Movie added to playlist"})

        elif request.method == "DELETE":
            playlist.movies = [m for m in playlist.movies if m.get("item_id") != movie_id]
            db.session.commit()
            return jsonify({"status": "success", "message": "Movie removed from playlist"})

        elif request.method == "PUT":
            # Example: update title or metadata
            for m in playlist.movies:
                if m.get("item_id") == movie_id:
                    m.update(request.json)
                    db.session.commit()
                    break
            return jsonify({"status": "success", "message": "Movie updated in playlist"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)