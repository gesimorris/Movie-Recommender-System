import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function PlaylistDetail({ playlist, onBack, onUpdate }) {
  const { authFetch }           = useAuth();
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({
    name:        playlist.name,
    description: playlist.description
  });
  const [movies, setMovies]     = useState(playlist.movies || []);

  const saveEdits = async () => {
    try {
      const response = await authFetch(
        `http://127.0.0.1:5000/playlists/${playlist.id}/movies/${movies.length > 0 ? movies[0].item_id : '0'}`,
        {
          method: 'PUT',
          body: JSON.stringify(form)
        }
      );
      const data = await response.json();
      onUpdate(data.playlist);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const removeMovie = async (movieId) => {
    try {
      await authFetch(
        `http://127.0.0.1:5000/playlists/${playlist.id}/movies/${movieId}`,
        { method: 'DELETE' }
      );
      const updated = movies.filter(m => m.item_id !== movieId);
      setMovies(updated);
      onUpdate({ ...playlist, movies: updated });
    } catch (err) {
      console.error(err);
    }
  };

  // Cover = first movie poster or gradient
  const cover = movies.length > 0 && movies[0].poster
    ? movies[0].poster
    : null;

  return (
    <div style={styles.container}>

      {/* Back button */}
      <button onClick={onBack} style={styles.backBtn}>
        ← Library
      </button>

      {/* Hero section */}
      <div style={styles.hero}>
        <div style={styles.cover}>
          {cover ? (
            <img src={cover} alt={playlist.name} style={styles.coverImg} />
          ) : (
            <div style={styles.coverPlaceholder}>
              <span style={styles.coverIcon}>🎬</span>
            </div>
          )}
        </div>

        <div style={styles.heroInfo}>
          {editing ? (
            <>
              <input
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                style={styles.editInput}
                placeholder="Playlist name"
              />
              <input
                value={form.description}
                onChange={(e) => setForm(p => ({
                  ...p, description: e.target.value
                }))}
                style={{ ...styles.editInput, fontSize: '14px' }}
                placeholder="Description"
              />
              <div style={styles.editActions}>
                <button onClick={saveEdits} style={styles.saveBtn}>
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={styles.playlistLabel}>Playlist</p>
              <h1 style={styles.playlistName}>{playlist.name}</h1>
              {playlist.description && (
                <p style={styles.description}>{playlist.description}</p>
              )}
              <p style={styles.movieCount}>
                {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
              </p>
              <button
                onClick={() => setEditing(true)}
                style={styles.editBtn}
              >
                Modify
              </button>
            </>
          )}
        </div>
      </div>

      {/* Movies list */}
      <div style={styles.movieList}>
        {movies.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              No movies yet — go to Discover to add some
            </p>
          </div>
        ) : (
          movies.map((movie, index) => (
            <div key={movie.item_id} style={styles.movieRow}>
              <span style={styles.index}>{index + 1}</span>
              <img
                src={movie.poster ||
                  'https://via.placeholder.com/48x72/1c1c1e/666?text=?'}
                alt={movie.title}
                style={styles.poster}
              />
              <div style={styles.movieInfo}>
                <p style={styles.movieTitle}>{movie.title}</p>
                <p style={styles.movieMeta}>
                  ⭐ {movie.avg_rating}
                  <span style={styles.dot}>·</span>
                  {movie.num_ratings} ratings
                </p>
              </div>
              <button
                onClick={() => removeMovie(movie.item_id)}
                style={styles.removeBtn}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: '24px 48px 48px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0 0 24px',
    fontWeight: '500',
  },
  hero: {
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-end',
    marginBottom: '40px',
    padding: '32px',
    background: 'linear-gradient(180deg, #2c2c2e 0%, transparent 100%)',
    borderRadius: '16px',
  },
  cover: {
    width: '180px',
    height: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
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
    background: 'linear-gradient(135deg, #1c1c1e, #3c3c3e)',
  },
  coverIcon: {
    fontSize: '48px',
    opacity: 0.4,
  },
  heroInfo: {
    flex: 1,
  },
  playlistLabel: {
    margin: '0 0 8px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  playlistName: {
    margin: '0 0 8px',
    fontSize: '40px',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '-1px',
    lineHeight: 1,
  },
  description: {
    margin: '0 0 8px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
  },
  movieCount: {
    margin: '0 0 16px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
  },
  editBtn: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '100px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  editInput: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    fontSize: '22px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '10px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  editActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  saveBtn: {
    padding: '8px 20px',
    backgroundColor: 'white',
    color: '#111111',
    border: 'none',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 20px',
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    border: 'none',
    borderRadius: '100px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  movieList: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '8px',
  },
  emptyState: {
    padding: '40px 0',
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
  },
  movieRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 16px',
    borderRadius: '8px',
    transition: 'background 0.15s',
  },
  index: {
    width: '20px',
    textAlign: 'right',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  poster: {
    width: '48px',
    height: '72px',
    objectFit: 'cover',
    borderRadius: '6px',
    flexShrink: 0,
  },
  movieInfo: {
    flex: 1,
    minWidth: 0,
  },
  movieTitle: {
    margin: '0 0 4px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  movieMeta: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  dot: {
    margin: '0 4px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 8px',
    flexShrink: 0,
  },
};