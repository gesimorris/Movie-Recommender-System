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
<img width="1159" height="801" alt="Screenshot 2026-06-12 at 12 16 51 PM" src="https://github.com/user-attachments/assets/b5915674-7c26-4762-b35c-9febbdd97c0f" />
<img width="1209" height="830" alt="Screenshot 2026-06-12 at 12 17 09 PM" src="https://github.com/user-attachments/assets/e9429bcb-78e7-4081-b426-69762527ff75" />
<img width="1445" height="835" alt="Screenshot 2026-06-12 at 12 17 53 PM" src="https://github.com/user-attachments/assets/15ec1a88-3db8-40b7-88be-a679855d336e" />


