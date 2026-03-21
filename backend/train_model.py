import pandas as pd
import numpy as np
from scipy.sparse.linalg import svds

# 1. Load Ratings
df = pd.read_csv('u.data', sep='\t', names=['user_id', 'item_id', 'rating', 'timestamp'])

# 2. Load Movie Metadata (u.item has the genres!)
item_cols = ['item_id', 'title', 'release_date', 'video_release_date', 'IMDb_URL', 
             'unknown', 'Action', 'Adventure', 'Animation', 'Childrens', 'Comedy', 
             'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film_Noir', 'Horror', 
             'Musical', 'Mystery', 'Romance', 'Sci_Fi', 'Thriller', 'War', 'Western']

# Load u.item (using latin-1 because of special characters in movie titles)
movie_metadata = pd.read_csv('u.item', sep='|', names=item_cols, encoding='latin-1')

# Keep only ID, Title, and the 19 Genre columns
genres_to_keep = item_cols[5:] # Action through Western
movie_metadata = movie_metadata[['item_id', 'title'] + genres_to_keep]

# Save metadata for the Flask app
movie_metadata.to_pickle('movie_metadata.pkl')
print("✅ movie_metadata.pkl saved!")

# 3. Pivot and SVD
n_users = df['user_id'].nunique()
n_items = movie_metadata['item_id'].max() # Use max ID to ensure alignment
ratings_matrix = np.zeros((n_users, n_items))

for row in df.itertuples():
    ratings_matrix[row.user_id - 1, row.item_id - 1] = row.rating

# k=20 is a good balance for this dataset size
u, s, vt = svds(ratings_matrix, k=20)
X_pred = np.dot(np.dot(u, np.diag(s)), vt)

# Save the matrix
np.save('X_pred.npy', X_pred)
print("✅ X_pred.npy saved!")