import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Auth({ onClose, onSuccess }) {
  const { login, signup }     = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    username: '', email: '', password: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup(form.username, form.email, form.password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Close */}
        <button onClick={onClose} style={styles.closeBtn}>✕</button>

        {/* Title */}
        <h2 style={styles.title}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={styles.subtitle}>
          {isLogin
            ? 'Sign in to access your playlists'
            : 'Start building your movie library'
          }
        </p>

        {/* Toggle */}
        <div style={styles.toggle}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              ...styles.toggleBtn,
              borderBottom: isLogin
                ? '2px solid white'
                : '2px solid transparent',
              color: isLogin
                ? 'white'
                : 'rgba(255,255,255,0.4)',
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              ...styles.toggleBtn,
              borderBottom: !isLogin
                ? '2px solid white'
                : '2px solid transparent',
              color: !isLogin
                ? 'white'
                : 'rgba(255,255,255,0.4)',
            }}
          >
            Sign up
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>⚠️ {error}</div>
        )}

        {/* Form */}
        {!isLogin && (
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={styles.input}
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
        </button>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
  },
  modal: {
    backgroundColor: '#1c1c1e',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '380px',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
  },
  subtitle: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
  },
  toggle: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    padding: '0 0 12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  input: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '15px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    outline: 'none',
    color: 'white',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'white',
    color: '#111111',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
  },
};