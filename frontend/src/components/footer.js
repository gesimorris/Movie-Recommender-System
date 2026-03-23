import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.left}>
          <p style={styles.trademark}>
            © {new Date().getFullYear()} — Built by <span style={styles.name}>Gesi Ray Morris-Odubo</span>
          </p>
          <p style={styles.trademark}>
            Data provided by Group Lens Research
          </p>
          <a href="https://grouplens.org/datasets/movielens/" target="_blank" rel="noreferrer" style= {styles.link}>MovieLens Dataset</a>
          <p style={styles.stack}>React · Flask · Python SVD</p>
        </div>
        
        <div style={styles.right}>
          <a href="https://github.com/gesimorris" target="_blank" rel="noreferrer" style= {styles.link}>GitHub</a>
          <span style={styles.dot}>·</span>
          <a href="https://linkedin.com/in/gesimorris" target="_blank" rel="noreferrer" style={styles.link}>LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    width: '100%',
    padding: '40px 0 60px',
    backgroundColor: '#111111',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    marginTop: 'auto', // Pushes footer to bottom if content is short
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 48px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trademark: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    margin: 0,
    fontWeight: '500',
  },
  name: {
    color: 'white',
    fontWeight: '600',
  },
  stack: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    margin: '4px 0 0',
  },
  right: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  link: {
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  dot: {
    color: 'rgba(255,255,255,0.1)',
  }
};