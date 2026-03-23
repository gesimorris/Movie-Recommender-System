import pickle

file = 'movie_metadata.pkl';

with open(file, 'rb') as f:
    data = pickle.load(f)
    
print(data.head())

