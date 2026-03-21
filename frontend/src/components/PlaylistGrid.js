import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function PlaylistGrid({ onSelectPlaylist, onNavigate }) {
  const { authFetch, isLoggedIn }     = useAuth();
  const [playlists, setPlaylists]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState({ name: '', description: '' });

  useEffect(() => {
    if (isLoggedIn) fetchPlaylists();
  }, [isLoggedIn]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await authFetch('http://127.0.0.1:5000/playlists');
      const data     = await response.json();
      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const createPlaylist = async () => {
    if (!form.name.trim()) return;
    try {
      const response = await authFetch('http://127.0.0.1:5000/playlists', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await response.json();
      
      // If backend returns { playlist: {id, name...} }
      if (data.playlist) {
        setPlaylists(prev => [...prev, data.playlist]);
        setForm({ name: '', description: '' });
        setShowCreate(false);
      }
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const deletePlaylist = async (e, playlistId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await authFetch(
        `http://127.0.0.1:5000/playlists/${playlistId}`,
        { method: 'DELETE' }
      );
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch (err) {
      console.error(err);
    }
  };

  // Get cover from first movie poster
  const getCover = (playlist) => {
    if (playlist.movies?.length > 0 && playlist.movies[0].poster) {
      return playlist.movies[0].poster;
    }
    return null;
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.lockedState}>
          <p style={styles.lockedIcon}>🔒</p>
          <h2 style={styles.lockedTitle}>Sign in to view your library</h2>
          <p style={styles.lockedText}>
            Create playlists and save your favourite movies
          </p>
          <button
            onClick={() => onNavigate('auth')}
            style={styles.signInBtn}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>My Library</h1>
        <button
          onClick={() => setShowCreate(true)}
          style={styles.createBtn}
        >
          + New Playlist
        </button>
      </div>

      {/* Create playlist modal */}
      {showCreate && (
        <div style={styles.createModal}>
          <div style={styles.createCard}>
            <h3 style={styles.createTitle}>New Playlist</h3>
            <input
              placeholder="Playlist name"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              style={styles.input}
              autoFocus
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              style={styles.input}
            />
            <div style={styles.createActions}>
              <button
                onClick={() => setShowCreate(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={createPlaylist}
                style={styles.confirmBtn}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p style={styles.loadingText}>Loading...</p>
      )}

      {/* Empty state */}
      {!loading && playlists.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyIcon}>≡</p>
          <h3 style={styles.emptyTitle}>No playlists yet</h3>
          <p style={styles.emptyText}>
            Create a playlist to start saving movies
          </p>
        </div>
      )}

      {/* Playlist grid */}
      <div style={styles.grid}>
        {playlists.map(playlist => (
          <div
            key={playlist.id}
            style={styles.playlistCard}
            onClick={() => onSelectPlaylist(playlist)}
          >
            {/* Cover */}
            <div style={styles.cover}>
              {getCover(playlist) ? (
                <img
                  src={getCover(playlist)}
                  alt={playlist.name}
                  style={styles.coverImg}
                />
              ) : (
                <div style={styles.coverPlaceholder}>
                  <span style={styles.coverIcon}>🎬</span>
                </div>
              )}
              {/* Delete button */}
              <button
                onClick={(e) => deletePlaylist(e, playlist.id)}
                style={styles.deleteBtn}
              >
                ✕
              </button>
            </div>
            {/* Info */}
            <p style={styles.playlistName}>{playlist.name}</p>
            <p style={styles.playlistMeta}>
              {playlist.movies?.length || 0} movies
              {playlist.description && ` · ${playlist.description}`}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: '40px 48px',
  },
  lockedState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    textAlign: 'center',
  },
  lockedIcon: {
    fontSize: '48px',
    margin: '0 0 16px',
  },
  lockedTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 8px',
  },
  lockedText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.4)',
    margin: '0 0 24px',
  },
  signInBtn: {
    padding: '12px 28px',
    backgroundColor: 'white',
    color: '#111111',
    border: 'none',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  createBtn: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  createModal: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
  },
  createCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '360px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  createTitle: {
    margin: '0 0 20px',
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'white',
    marginBottom: '12px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  createActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.7)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'white',
    color: '#111111',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyIcon: {
    fontSize: '48px',
    color: 'rgba(255,255,255,0.2)',
    margin: '0 0 16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px',
  },
  playlistCard: {
    cursor: 'pointer',
  },
  cover: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '12px',
    backgroundColor: '#2c2c2e',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1c1c1e, #2c2c2e)',
  },
  coverIcon: {
    fontSize: '40px',
    opacity: 0.4,
  },
  deleteBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8, // Make it visible so you can actually click it!
    transition: 'transform 0.2s',
  },
  playlistName: {
    margin: '0 0 4px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  playlistMeta: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};