// src/components/Home.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Home({ onNavigate }) {
  const { isLoggedIn, user, authFetch } = useAuth();
  const [recMovies, setRecMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHomeRecs();
    }
  }, [isLoggedIn]);

  const fetchHomeRecs = async () => {
    setLoading(true);
    try {
      const response = await authFetch('http://127.0.0.1:5000/recommendations/hybrid', {
        method: 'POST',
        body: JSON.stringify({ 
          top_n: 10,
          genres: ["Action", "Drama"] // Default starter genres for the home feed
        })
      });
      const data = await response.json();
      if (data.movies) {
        setRecMovies(data.movies);
      }
    } catch (err) {
      console.error("Home rec fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          {isLoggedIn
            ? `Welcome, ${user?.username || 'Guest'} 👋`
            : 'Your personal\nmovie guide'
          }
        </h1>
        <button
          onClick={() => onNavigate('discover')}
          style={styles.heroBtn}
        >
          Start Discovering
        </button>
      </div>

      {/* Recommended Section (Only shows if logged in) */}
      {isLoggedIn && (
        <div style={styles.recSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Picked for you</h2>
            <button onClick={() => onNavigate('discover')} style={styles.seeAll}>See more →</button>
          </div>
          
          <div style={styles.movieGrid}>
            {loading ? (
              <p style={styles.statusText}>Curating your feed...</p>
            ) : recMovies.length > 0 ? (
              recMovies.map(movie => (
                <div key={movie.item_id} style={styles.movieCard}>
                  <img 
                    src={movie.poster || 'https://via.placeholder.com/150x225'} 
                    alt={movie.title} 
                    style={styles.poster}
                  />
                  <p style={styles.movieTitle}>{movie.title}</p>
                </div>
              ))
            ) : (
              <p style={styles.statusText}>Rate some movies to get better picks!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '60px 48px', maxWidth: '1200px' },
  hero: { marginBottom: '64px' },
  heroTitle: { fontSize: '53px', fontWeight: '700', color: 'white', margin: '0 0 16px', lineHeight: 1.1, whiteSpace: 'pre-line', letterSpacing: '-1px' },
  heroBtn: { padding: '14px 28px', backgroundColor: 'white', color: '#111111', border: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  
  recSection: { marginBottom: '64px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' },
  sectionTitle: { fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 },
  seeAll: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px' },
  
  movieGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' },
  movieCard: { textAlign: 'center' },
  poster: { width: '100%', borderRadius: '12px', aspectRatio: '2/3', objectFit: 'cover', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)' },
  movieTitle: { fontSize: '13px', color: 'white', fontWeight: '500', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  statusText: { color: 'rgba(255,255,255,0.3)', fontSize: '14px' },

  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  card: { backgroundColor: '#1c1c1e', borderRadius: '16px', padding: '24px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' },
  cardIcon: { fontSize: '28px', marginBottom: '16px', color: 'rgba(255,255,255,0.6)' },
  cardTitle: { margin: '0 0 8px', fontSize: '17px', fontWeight: '600', color: 'white' },
  cardText: { margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 },
};