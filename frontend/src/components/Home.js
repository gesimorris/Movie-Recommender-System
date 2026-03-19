import { useAuth } from "../context/AuthContext";

export default function Home({ onNavigate }) {
  const { isLoggedIn, user } = useAuth();

  return (
    <div style={styles.container}>

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          {isLoggedIn
            ? `Welcome, ${user.username} 👋`
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

      {/* Feature cards */}
      <div style={styles.cards}>
        <div style={styles.card} onClick={() => onNavigate('discover')}>
          <div style={styles.cardIcon}>◎</div>
          <h3 style={styles.cardTitle}>Discover</h3>
          <p style={styles.cardText}>
            Find movies by genre and era.
          </p>
        </div>
        <div style={styles.card} onClick={() => onNavigate('playlists')}>
          <div style={styles.cardIcon}>≡</div>
          <h3 style={styles.cardTitle}>Library</h3>
          <p style={styles.cardText}>
            Build and manage your personal movie collections
          </p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>⭐</div>
          <h3 style={styles.cardTitle}>Rated</h3>
          <p style={styles.cardText}>
            1000+ Movies ranked by real user ratings from the MovieLens dataset
          </p>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: '60px 48px',
    maxWidth: '900px',
  },
  hero: {
    marginBottom: '64px',
  },
  heroTitle: {
    fontSize: '53px',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 16px',
    lineHeight: 1.1,
    whiteSpace: 'pre-line',
    letterSpacing: '1px',
  },
  heroBtn: {
    padding: '14px 28px',
    backgroundColor: 'white',
    color: '#111111',
    border: 'none',
    borderRadius: '100px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.2s',
  },
  cardIcon: {
    fontSize: '28px',
    marginBottom: '16px',
    color: 'rgba(255,255,255,0.6)',
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: '17px',
    fontWeight: '600',
    color: 'white',
  },
  cardText: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 1.5,
  },
};