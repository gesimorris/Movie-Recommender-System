import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";

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
      const response = await authFetch(`${API_BASE_URL}/recommendations/hybrid`, {
        method: 'POST',
        body: JSON.stringify({ 
          top_n: 10,
          genres: ["Action", "Drama"] 
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
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          {isLoggedIn
            ? `Welcome back, ${user?.username || 'Movie Buff'} 👋`
            : 'Your personal\nmovie guide.'
          }
        </h1>
        <p style={styles.heroSubtitle}>
          {isLoggedIn 
            ? "Ready to find your next favorite film?" 
            : "Discover hidden gems and organize your cinema journey."}
        </p>
        <button
          onClick={() => onNavigate('discover')}
          style={styles.heroBtn}
        >
          Start Discovering
        </button>
      </div>

      {/* Main Content Area */}
      {isLoggedIn ? (
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
                  <div style={styles.posterContainer}>
                    <img 
                      src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
                      alt={movie.title} 
                      style={styles.poster}
                    />
                  </div>
                  <p style={styles.movieTitle}>{movie.title}</p>
                </div>
              ))
            ) : (
              <p style={styles.statusText}>Start saving movies to get personalized picks!</p>
            )}
          </div>
        </div>
      ) : (
        /* Guest Information Section */
        <div style={styles.guestSection}>
          <h2 style={styles.sectionTitle}>How it works</h2>
          <div style={styles.featureGrid}>
            <div style={styles.card} onClick={() => onNavigate('discover')}>
              <span style={styles.cardIcon}>🔍</span>
              <h3 style={styles.cardTitle}>Smart Discovery</h3>
              <p style={styles.cardText}>Filter by genre and era. Our hybrid engine suggests movies based on what you like.</p>
            </div>
            <div style={styles.card} onClick={() => onNavigate('auth')}>
              <span style={styles.cardIcon}>📁</span>
              <h3 style={styles.cardTitle}>Custom Playlists</h3>
              <p style={styles.cardText}>Sign in to create unlimited playlists. Organize your watch history and future favorites.</p>
            </div>
            <div style={styles.card} onClick={() => onNavigate('discover')}>
              <span style={styles.cardIcon}>📊</span>
              <h3 style={styles.cardTitle}>Data-Driven Picks</h3>
              <p style={styles.cardText}>We analyze thousands of ratings to ensure your recommendations are top-tier.</p>
            </div>
          </div>
          <div style={styles.authPrompt}>
            <p style={styles.authText}>Want to see your personalized movie feed?</p>
            <button onClick={() => onNavigate('auth')} style={styles.authBtn}>Sign in now</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '60px 48px', maxWidth: '1200px', margin: '0 auto' },
  hero: { marginBottom: '80px', textAlign: 'left' },
  heroTitle: { fontSize: '64px', fontWeight: '800', color: 'white', margin: '0 0 16px', lineHeight: 1, whiteSpace: 'pre-line', letterSpacing: '-2px' },
  heroSubtitle: { fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px', maxWidth: '500px' },
  heroBtn: { padding: '16px 32px', backgroundColor: 'white', color: '#111111', border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  
  recSection: { marginBottom: '64px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  sectionTitle: { fontSize: '24px', fontWeight: '700', color: 'white', margin: 0, letterSpacing: '-0.5px' },
  seeAll: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  
  movieGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(5, 1fr)', 
    gap: '24px',
    width: '100%'
  },
  movieCard: { 
    textAlign: 'left',
    width: '100%',
    minWidth: '0'
  },
  posterContainer: { 
    width: '100%', 
    aspectRatio: '2/3', 
    borderRadius: '12px', 
    overflow: 'hidden', 
    backgroundColor: '#1c1c1e', 
    marginBottom: '12px', 
    border: '1px solid rgba(255,255,255,0.05)' 
  },
  poster: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover'
  },
  movieTitle: { 
    fontSize: '14px', 
    color: 'white', 
    fontWeight: '600', 
    margin: 0, 
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis'
  },

  guestSection: { marginTop: '40px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '24px' },
  card: { backgroundColor: '#1c1c1e', borderRadius: '20px', padding: '32px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' },
  cardIcon: { fontSize: '32px', marginBottom: '20px', display: 'block' },
  cardTitle: { margin: '0 0 12px', fontSize: '20px', fontWeight: '700', color: 'white' },
  cardText: { margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 },
  
  authPrompt: { marginTop: '64px', textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' },
  authText: { color: 'white', fontSize: '16px', marginBottom: '20px', fontWeight: '500' },
  authBtn: { padding: '12px 24px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '100px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  statusText: { color: 'rgba(255,255,255,0.3)', fontSize: '14px', gridColumn: '1 / -1' }
};