# CineMax

A retro movie discovery platform that recommends hidden cinema gems using a 
hybrid recommendation engine combining collaborative filtering and content-based metadata.

<p align="center">
  <img src="https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000" />
  <img src="https://img.shields.io/badge/Flask-000?logo=flask&logoColor=fff" />
  <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

## How It Works
Uses a hybrid recommendation engine combining:
- **SVD (Singular Value Decomposition)** — identifies hidden patterns between users and movies to predict ratings for unseen films
- **Content-Based Filtering** — weights results by release era and genre to surface retro gems from the 70s, 80s, and 90s

## Features
- Era-specific discovery — filter by decade of cinema
- JWT authentication with personalized movie libraries and playlists
- Hybrid recommendation engine solving the cold start problem
- Processes MovieLens 100k dataset via Pandas data pipeline

## Live Demo
Link: https://cinemax-blond-ten.vercel.app/
Demo account: demo@test.com / password123

## Run Locally
```bash
cd backend
pip install flask numpy pandas scipy sqlalchemy
python app.py

cd frontend
npm install && npm run dev
```
## Screenshots
