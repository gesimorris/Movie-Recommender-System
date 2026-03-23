# This file is where the movie metadata is saved in a .pkl file

import pandas as pd
import numpy as np
from scipy.sparse.linalg import svds

df = pd.read_csv('u.data', sep='\t', names=['user_id', 'item_id', 'rating', 'timestamp'])

item_cols = ['item_id', 'title', 'release_date', 'video_release_date', 'IMDb_URL', 
             'unknown', 'Action', 'Adventure', 'Animation', 'Childrens', 'Comedy', 
             'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film_Noir', 'Horror', 
             'Musical', 'Mystery', 'Romance', 'Sci_Fi', 'Thriller', 'War', 'Western']

movie_metadata = pd.read_csv('u.item', sep='|', names=item_cols, encoding='latin-1')


movie_stats = df.groupby('item_id')['rating'].agg(['mean', 'count']).reset_index()
movie_stats.columns = ['item_id', 'avg_rating', 'num_ratings']

movie_metadata = pd.merge(movie_metadata, movie_stats, on='item_id', how='left')

movie_metadata['avg_rating'] = movie_metadata['avg_rating'].fillna(0).round(1)
movie_metadata['num_ratings'] = movie_metadata['num_ratings'].fillna(0).astype(int)

genres_to_keep = item_cols[5:] 
movie_metadata = movie_metadata[['item_id', 'title', 'avg_rating', 'num_ratings'] + genres_to_keep]

movie_metadata.to_pickle('movie_metadata.pkl')
print("movie_metadata.pkl saved with ratings!")