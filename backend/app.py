# The Flask backend where routes are defined

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
import numpy as np
import pandas as pd
import requests
import os
import re
import pickle
from datetime import timedelta
from dotenv import load_dotenv
from flask import Response

load_dotenv()

app = Flask(__name__)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = Response()
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return res

db_url = os.getenv('DATABASE_URL')
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)


CORS(app)

db = SQLAlchemy(app)
jwt = JWTManager(app)

TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

genre_list = ['Action', 'Adventure', 'Animation', 'Childrens', 'Comedy', 
              'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film_Noir', 
              'Horror', 'Musical', 'Mystery', 'Romance', 'Sci_Fi', 
              'Thriller', 'War', 'Western']

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

class Playlist(db.Model):
    __tablename__ = 'playlists'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movies = db.Column(db.JSON, default=list)

with app.app_context():
    db.create_all()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

movie_metadata = pd.read_pickle(os.path.join(BASE_DIR, 'movie_metadata.pkl'))
X_pred = np.load(os.path.join(BASE_DIR, 'X_pred.npy'))
n_users, n_items = X_pred.shape

movie_titles = pd.read_csv(os.path.join(BASE_DIR, "Movie_Id_Titles"))
movies_df = pd.read_csv(os.path.join(BASE_DIR, 'u.item'), sep='|', encoding='latin-1', header=None)
movies_df.columns = [
    'item_id','title','release_date','video_release','imdb_url',
    'unknown','Action','Adventure','Animation','Childrens','Comedy','Crime',
    'Documentary','Drama','Fantasy','Film_Noir','Horror','Musical','Mystery',
    'Romance','Sci_Fi','Thriller','War','Western'
]

def extract_year(title):
    match = re.search(r'\((\d{4})\)', str(title))
    return int(match.group(1)) if match else 0

movie_metadata['release_year'] = movie_metadata['title'].apply(extract_year)

# --- HEALTH CHECK ROUTE ---
@app.route('/health', methods=['GET'])
def health_check():
    try:
        db.session.execute('SELECT 1')
        return jsonify({
            "status": "online",
            "database": "connected",
            "message": "Backend is live in the cloud!"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }), 500
    
# --- AUTH ROUTES ---
@app.route('/signup', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    new_user = User(username=username, email=email, password_hash=password)
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(new_user.id))
    
    return jsonify({
        "token": access_token,
        "user": {"username": username, "email": email}
    }), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    
    if user and user.password_hash == password:
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "token": access_token,
            "user": {"username": user.username, "email": user.email}
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

# --- RECOMMENDATION ROUTE ---
def get_poster(title):
    clean_title = re.sub(r"\(\d{4}\)", "", title).strip()
    try:
        res = requests.get(f'{TMDB_BASE_URL}/search/movie', params={'api_key': TMDB_API_KEY, 'query': clean_title}, timeout=3)
        data = res.json()
        if data.get('results'):
            path = data['results'][0].get('poster_path')
            return f'https://image.tmdb.org/t/p/w200{path}' if path else None
    except: return None

@app.route('/recommendations/hybrid', methods=['POST'])
@jwt_required(optional=True)
def hybrid_route():
    user_id = get_jwt_identity() 
    data = request.get_json() or {}
    
    if user_id is not None:
        user_idx = (int(user_id) - 1) % n_users 
        user_scores = X_pred[user_idx]
    else:
        user_scores = np.mean(X_pred, axis=0)
    
    df_recs = movie_metadata.copy()
    df_recs['score'] = df_recs['item_id'].apply(
        lambda x: user_scores[x-1] if x <= n_items else 0
    )

    if user_id is not None:
        user_playlists = Playlist.query.filter_by(user_id=user_id).all()
        genre_counts = {}
        for pl in user_playlists:
            if pl.movies:
                for m in pl.movies:
                    m_id = m.get('item_id')
                    meta = movie_metadata[movie_metadata['item_id'] == m_id]
                    if not meta.empty:
                        for g in genre_list: 
                            if meta.iloc[0][g] == 1:
                                genre_counts[g] = genre_counts.get(g, 0) + 1

        if genre_counts:
            def apply_boost(row):
                boost = 1.0
                for g, count in genre_counts.items():
                    if row[g] == 1:
                        boost += (count * 0.1)
                return row['score'] * boost
            df_recs['score'] = df_recs.apply(apply_boost, axis=1)

    selected_genres = data.get('genres', [])
    if selected_genres:
        df_recs = df_recs[df_recs[selected_genres].any(axis=1)]
    
    selected_eras = data.get('eras', [])
    valid_eras = [e for e in selected_eras if e is not None]

    if valid_eras:
        era_masks = []
        for era_range in valid_eras:
            start = era_range.get('start')
            end = era_range.get('end')
            if start is not None and end is not None:
                era_masks.append(df_recs['release_year'].between(start, end))
        
        if era_masks:
            final_mask = era_masks[0]
            for mask in era_masks[1:]:
                final_mask |= mask
            df_recs = df_recs[final_mask]

    top_n = data.get('top_n', 20)
    top_movies = df_recs.sort_values('score', ascending=False).head(top_n)
    
    return jsonify({
        "movies": [
            {
                "item_id": int(r.item_id), 
                "title": r.title, 
                "poster": get_poster(r.title),
                "avg_rating": r.avg_rating,
                "num_ratings": r.num_ratings,
            } 
            for _, r in top_movies.iterrows()
        ]
    })

# --- PLAYLIST ROUTES ---
@app.route('/playlists', methods=['GET', 'POST'])
@jwt_required()
def handle_playlists():
    user_id = get_jwt_identity()
    
    if request.method == 'GET':
        pls = Playlist.query.filter_by(user_id=user_id).all()
        return jsonify({
            "playlists": [{"id": p.id, "name": p.name, "movies": p.movies or []} for p in pls]
        })
    
    if request.method == 'POST':
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({"error": "Name is required"}), 400
            
        new_pl = Playlist(
            name=data['name'], 
            user_id=user_id,
            movies=[]
        )
        db.session.add(new_pl)
        db.session.commit()
        
        return jsonify({
            "playlist": {
                "id": new_pl.id,
                "name": new_pl.name,
                "movies": []
            }
        }), 201
    
@app.route('/playlists/<int:playlist_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def handle_single_playlist(playlist_id):
    user_id = get_jwt_identity()
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=user_id).first()

    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    if request.method == 'DELETE':
        db.session.delete(playlist)
        db.session.commit()
        return jsonify({"success": True, "message": "Playlist deleted"}), 200

    if request.method == 'PUT':
        data = request.get_json()
        playlist.name = data.get('name', playlist.name)
        playlist.description = data.get('description', playlist.description)
        db.session.commit()
        
        return jsonify({
            "playlist": {
                "id": playlist.id,
                "name": playlist.name,
                "description": playlist.description,
                "movies": playlist.movies
            }
        }), 200
    
@app.route('/playlists/<int:playlist_id>/movies', methods=['POST'])
@jwt_required()
def add_to_playlist(playlist_id):
    user_id = get_jwt_identity()
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=user_id).first_or_404()
    
    movie_data = request.get_json()
    
    current_movies = list(playlist.movies) if playlist.movies else []
    current_movies.append(movie_data)
    
    playlist.movies = current_movies
    db.session.commit()
    
    return jsonify({"msg": "Movie added", "playlist": playlist.name}), 200

@app.route('/playlists/<int:playlist_id>/movies/<int:movie_id>', methods=['DELETE'])
@jwt_required()
def delete_from_playlist(playlist_id, movie_id):
    user_id = get_jwt_identity()
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=user_id).first_or_404()
    
    current_movies = list(playlist.movies) if playlist.movies else []
    updated_movies = [m for m in current_movies if m.get('item_id') != movie_id]
    
    playlist.movies = updated_movies
    db.session.commit()
    
    return jsonify({"msg": "Movie removed", "playlist": playlist.name}), 200

if __name__ == '__main__':
    # Listen on all interfaces and use the PORT provided by Render
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)