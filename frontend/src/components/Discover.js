import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";

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
  const [hoveredId, setHoveredId] = useState(null);

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

  const getRecommendations = async () => {
    if (selectedGenres.length === 0) return;
    setLoading(true);
    
    const payload = {
      genres: selectedGenres,
      eras: selectedEra ? [selectedEra] : [], 
      top_n: 50
    };

    try {
      const response = await authFetch(`${API_BASE_URL}/recommendations/hybrid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.movies) {
        setMovies(data.movies);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
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
                backgroundColor: JSON.stringify(selectedEra) === JSON.stringify(era.value) ? 'white' : 'rgba(255,255,255,0.07)',
                color: JSON.stringify(selectedEra) === JSON.stringify(era.value) ? '#111111' : 'rgba(255,255,255,0.7)',
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
            opacity: selectedGenres.length === 0 ? 0.4 : 1,
            cursor: loading ? 'wait' : 'pointer'
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
                <div 
                  key={movie.item_id} 
                  style={styles.movieCard}
                  onMouseEnter={() => setHoveredId(movie.item_id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div style={styles.posterWrapper}>
                    <img
                      src={movie.poster || 'https://via.placeholder.com/200x300?text=No+Poster'}
                      alt={movie.title}
                      style={styles.poster}
                    />
                    <div style={{
                      ...styles.overlay,
                      opacity: hoveredId === movie.item_id ? 1 : 0
                    }}>
                      <button
                        onClick={() => onSaveMovie(movie)}
                        style={styles.saveBtn}
                      >
                        {isLoggedIn ? '+ Save' : '🔒 Login'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Updated Title and Ratings Section */}
                  <div style={styles.movieInfo}>
                    <p style={styles.movieTitle}>{movie.title}</p>
                    <div style={styles.ratingRow}>
                      <span style={styles.star}>⭐</span>
                      <span style={styles.ratingText}>
                        {movie.avg_rating ? movie.avg_rating.toFixed(1) : "N/A"}
                      </span>
                      <span style={styles.dot}>·</span>
                      <span style={styles.countText}>
                        {movie.num_ratings || 0} reviews
                      </span>
                    </div>
                  </div>
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
  container: { display: 'flex', gap: '40px', padding: '40px 48px', minHeight: '100vh', backgroundColor: '#111111' },
  filters: { width: '220px', flexShrink: 0 },
  sectionTitle: { fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' },
  optional: { fontSize: '10px', opacity: 0.6, textTransform: 'none' },
  genreGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  eraGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' },
  searchBtn: { marginTop: '32px', width: '100%', padding: '14px', backgroundColor: 'white', color: '#111111', border: 'none', borderRadius: '30px', fontSize: '14px', fontWeight: '700' },
  results: { flex: 1 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  emptyIcon: { fontSize: '40px', color: 'rgba(255,255,255,0.1)', marginBottom: '10px' },
  emptyTitle: { fontSize: '18px', color: 'rgba(255,255,255,0.5)' },
  emptyText: { fontSize: '14px', color: 'rgba(255,255,255,0.3)' },
  resultsTitle: { fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '30px' },
  movieGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '24px' },
  movieCard: { position: 'relative' },
  posterWrapper: { position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '2/3', backgroundColor: '#1c1c1e' },
  poster: { width: '100%', height: '100%', objectFit: 'cover' },
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' },
  saveBtn: { padding: '10px 20px', backgroundColor: 'white', color: '#111111', border: 'none', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' },
  
  // New Styles for Info section
  movieInfo: { marginTop: '12px' },
  movieTitle: { margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '4px' },
  star: { fontSize: '12px' },
  ratingText: { fontSize: '13px', color: 'white', fontWeight: '500' },
  dot: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 2px' },
  countText: { fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
};