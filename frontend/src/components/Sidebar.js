import { useAuth } from "../context/AuthContext";

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, isLoggedIn, logout } = useAuth();

  const navItems = [
    { id: 'home',     label: 'Home',     icon: '⌂' },
    { id: 'discover', label: 'Discover', icon: '◎' },
    { id: 'playlists',label: 'Library',  icon: '≡' },
  ];

  return (
    <div style={styles.sidebar}>

      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoText}>Cinemax</span>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              ...styles.navItem,
              backgroundColor: currentPage === item.id
                ? 'rgba(255,255,255,0.1)'
                : 'transparent',
              color: currentPage === item.id
                ? 'white'
                : 'rgba(255,255,255,0.5)',
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom - user section */}
      <div style={styles.bottom}>
        {isLoggedIn ? (
          <div style={styles.userSection}>
            <div style={styles.avatar}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <p style={styles.username}>{user.username}</p>
              <button onClick={logout} style={styles.logoutBtn}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('auth')}
            style={styles.loginBtn}
          >
            Sign In
          </button>
        )}
      </div>

    </div>
  );
}

const styles = {
  sidebar: {
    width: '220px',
    height: '100vh',
    backgroundColor: '#111111',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '24px',          // ← top padding only
    flexShrink: 0,
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  bottom: {
    marginTop: 'auto',
    padding: '16px',             // ← add bottom padding
    paddingBottom: '24px',       // ← extra bottom space
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 20px 32px',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '-0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0 12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  navIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    margin: '0 0 2px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0,
  },
  loginBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'white',
    color: '#111111',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};