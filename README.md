# CineMax

CineMax is a personal discovery platform built to solve a specific problem: finding high-quality "retro" cinema and niche gems that often get buried in mainstream streaming catalogs. It moves beyond simple keyword searching by using a mathematical approach to suggest movies based on deep user patterns and specific eras.

## The Core Tech

I chose a **Hybrid Engine** because single-algorithm systems usually fail the "cold start" problem or get repetitive. By combining collaborative filtering with content-based metadata, the system provides more balanced results.

### 1. The Recommendation Logic (SVD)
I implemented **Singular Value Decomposition** using `scipy.sparse.linalg.svds`. This identifies "latent features"—hidden connections between users and movies—allowing the system to predict ratings for films a user hasn't seen yet.

```python
# The Engine: Matrix Factorization for Latent Features
from scipy.sparse.linalg import svds

def get_predictions(user_id, ratings_matrix, k=50):
    # Decompose the sparse matrix into U, Sigma, and Vt
    u, sigma, vt = svds(ratings_matrix, k=k)
    sigma = np.diag(sigma)
    
    # Reconstruct the matrix to get predicted ratings
    all_user_predicted_ratings = np.dot(np.dot(u, sigma), vt)
    return all_user_predicted_ratings[user_id]
```
### 2. Content-Based Boosting
To handle the "retro" requirement, I built a secondary layer that weights results based on metadata like Release Era and Genre.

```python
# Metadata Processing: Extracting the 'Era' from movie titles
movies_df['year'] = movies_df['title'].str.extract('(\(\d{4}\))', expand=False)
movies_df['era'] = movies_df['year'].apply(
    lambda x: f"{x[1:3]}0s" if pd.notnull(x) else "Unknown"
)

# Filter logic for the "Retro" discovery feature
retro_gems = movies_df[movies_df['era'].isin(['70s', '80s', '90s'])]
```
### 3. The API Layer (Flask)
I used Flask for its lightweight control over the data science stack and JWT for secure user sessions.

```python
@app.route('/api/recommend', methods=['GET'])
@jwt_required()
def recommend():
    current_user = get_jwt_identity()
    # Fetch hybrid results combining SVD predictions and user-saved preferences
    recommendations = engine.get_hybrid_list(current_user)
    return jsonify(recommendations)
```

## Features

- Era-Specific Discovery: Tailor recommendations to specific decades of cinema.
- JWT Authentication: Secure user sessions and personalized library saving.
- Scalable Data Pipeline: Efficiently processes the MovieLens 100k dataset using Pandas.
- Interactive UI: A modern, dark-themed React interface for a seamless "streaming" feel.

## Tech Stack
Backend: Python (Flask), SQLAlchemy, JWT
Data Science: NumPy, Pandas, SciPy (SVD)
Frontend: React.js, Vite, Context API
Database: PostgreSQL (Production) / SQLite (Dev)
