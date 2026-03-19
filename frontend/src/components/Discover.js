// src/components/Discover.js
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const GENRES = [
  "Action", "Adventure", "Animation", "Childrens",
  "Comedy", "Crime", "Documentary", "Drama", "Fantasy",
  "Film_Noir", "Horror", "Musical", "Mystery", "Romance",
  "Sci_Fi", "Thriller", "War", "Western"
];

const ERAS = [
  { label: "Classics",   value: { start: 1900, end: 1979 } },
  { label: "80s",        value: { start: 1980, end: 1989 } },
  { label: "Early 90s",  value: { start: 1990, end: 1993 } },
  { label: "Mid 90s",    value: { start: 1994, end: 1996 } },
  { label: "Late 90s",   value: { start: 1997, end: 1998 } },
];

export default function Discover({ onSaveMovie }) {
  const { isLoggedIn, authFetch } = useAuth();
  const [selectedGenres, setGenres] = useState([]);
  const [selectedEra, setEra] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSavedMovies, setUserSavedMovies] = useState([]); // New state for user's saved movies


  const toggleGenre = (genre) => {
    setGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleEra = (era) => {
    setEra(prev => prev === era ? null : era);
  };

  const payload = {
    genres: selectedGenres,
    era: selectedEra,
    top_n: 100,
    user_ratings: userSavedMovies.map(m => ({item_id: m.id, rating: m.rating})) // Pass user's saved movies for personalized recommendations
  };

  const getRecommendations = async () => {
    if (selectedGenres.length === 0) return;
    setLoading(true);
    try {
      const response = await authFetch('http://127.0.0.1:5000/recommendations/hybrid', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMovies(data.movies);
      } else {
        console.error('Failed to fetch recommendations', data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>

      {/* Left - filters */}
      <div style={styles.filters}>
        <h2 style={styles.sectionTitle}>Genres</h2>
        <div style={styles.genreGrid}>
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              style={{
                ...styles.chip,
                backgroundColor: selectedGenres.includes(genre) ? 'white' : 'rgba(255,255,255,0.07)',
                color: selectedGenres.includes(genre) ? '#111111' : 'rgba(255,255,255,0.7)',
              }}
            >
              {genre}
            </button>
          ))}
        </div>

        <h2 style={{ ...styles.sectionTitle, marginTop: '32px' }}>
          Era <span style={styles.optional}>optional</span>
        </h2>
        <div style={styles.eraGrid}>
          {ERAS.map(era => (
            <button
              key={era.label}
              onClick={() => toggleEra(era.value)}
              style={{
                ...styles.chip,
                backgroundColor: selectedEra === era.value ? 'white' : 'rgba(255,255,255,0.07)',
                color: selectedEra === era.value ? '#111111' : 'rgba(255,255,255,0.7)',
              }}
            >
              {era.label}
            </button>
          ))}
        </div>

        <button
          onClick={getRecommendations}
          disabled={selectedGenres.length === 0 || loading}
          style={{
            ...styles.searchBtn,
            opacity: selectedGenres.length === 0 ? 0.4 : 1
          }}
        >
          {loading ? 'Finding...' : 'Find Movies'}
        </button>
      </div>

      {/* Right - results */}
      <div style={styles.results}>
        {movies.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>◎</p>
            <p style={styles.emptyTitle}>Pick genres to get started</p>
            <p style={styles.emptyText}>Select what you're in the mood for</p>
          </div>
        ) : (
          <>
            <h2 style={styles.resultsTitle}>
              Top picks for {selectedGenres.join(', ')}
            </h2>
            <div style={styles.movieGrid}>
              {movies.map(movie => (
                <div key={movie.item_id} style={styles.movieCard}>
                  <div style={styles.posterWrapper}>
                    <img
                      src={movie.poster || 'https://dummyimage.com/200x300/1c1c1e/666&text=No+Poster'}
                      alt={movie.title}
                      style={styles.poster}
                    />
                    <div style={styles.overlay}>
                      <button
                        onClick={() => onSaveMovie(movie)}
                        style={styles.saveBtn}
                      >
                        {isLoggedIn ? '+ Save' : '🔒 Login'}
                      </button>
                    </div>
                  </div>
                  <p style={styles.movieTitle}>{movie.title}</p>
                  <p style={styles.movieMeta}>
                    ⭐ {movie.avg_rating} <span style={styles.dot}>·</span> {movie.num_ratings} ratings
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

const styles = {
  container: { display: 'flex', gap: '40px', padding: '40px 48px', minHeight: '100vh' },
  filters: { width: '220px', flexShrink: 0 },
  sectionTitle: { fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px' },
  optional: { fontSize: '11px', fontWeight: 'normal', textTransform: 'none', letterSpacing: 0 },
  genreGrid: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  eraGrid: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  chip: { padding: '6px 12px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  searchBtn: { marginTop: '32px', width: '100%', padding: '12px', backgroundColor: 'white', color: '#111111', border: 'none', borderRadius: '100px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  results: { flex: 1 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' },
  emptyIcon: { fontSize: '48px', margin: '0 0 16px', color: 'rgba(255,255,255,0.2)' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' },
  emptyText: { fontSize: '14px', color: 'rgba(255,255,255,0.3)', margin: 0 },
  resultsTitle: { fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 24px', letterSpacing: '-0.5px' },
  movieGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' },
  movieCard: { cursor: 'pointer' },
  posterWrapper: { position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', aspectRatio: '2/3' },
  poster: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', ':hover': { opacity: 1 } },
  saveBtn: { padding: '8px 16px', backgroundColor: 'white', color: '#111111', border: 'none', borderRadius: '100px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  movieTitle: { margin: '0 0 4px', fontSize: '13px', fontWeight: '500', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  movieMeta: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  dot: { margin: '0 4px' },
};