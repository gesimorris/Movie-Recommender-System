import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Auth from "./components/Auth";
import Home from "./components/Home";
import Discover from "./components/Discover";
import PlaylistGrid from "./components/PlaylistGrid";
import PlaylistDetail from "./components/PlaylistDetail";
import Footer from "./components/footer";
import API_BASE_URL from "./config";

export default function App() {
  const { loading, isLoggedIn, authFetch } = useAuth();

  const [page, setPage]                   = useState('home');
  const [showAuth, setShowAuth]           = useState(false);
  const [selectedPlaylist, setPlaylist]   = useState(null);
  const [movieToAdd, setMovieToAdd]       = useState(null);
  const [playlists, setPlaylists]         = useState([]);
  const [showAddTo, setShowAddTo]         = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      authFetch(`${API_BASE_URL}/playlists`)
        .then(res => res.json())
        .then(data => setPlaylists(data.playlists || []))
        .catch(err => console.error(err));
    }
  }, [isLoggedIn]);

  if (loading) return (
    <div style={styles.loading}>
      <span style={styles.loadingText}>🎬</span>
    </div>
  );

  const navigate = (destination) => {
    if (destination === 'auth') {
      setShowAuth(true);
      return;
    }
    setPage(destination);
    setPlaylist(null);
  };

  const handleSaveMovie = async (movie) => {
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }
    try {
      const list = await authFetch(`${API_BASE_URL}/playlists`, {
        method: 'GET'
      });
      const data = await list.json();
      if (data.playlists) {
        setPlaylists(data.playlists);
      }
      setMovieToAdd(movie); 
      setShowAddTo(true);    
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
      alert("Could not load playlists. Please try again.");
    }
  };

  const addToPlaylist = async (playlistId) => {
    if (!playlistId || !movieToAdd) return;
    try {
      const response = await authFetch(`${API_BASE_URL}/playlists/${playlistId}/movies`, {
        method: 'POST',
        body: JSON.stringify({
          item_id: movieToAdd.item_id,
          title: movieToAdd.title,
          poster: movieToAdd.poster,
          avg_rating: movieToAdd.avg_rating,
          num_ratings: movieToAdd.num_ratings,
        })
      });

      if (response.ok) {
        alert(`Saved ${movieToAdd.title}!`);
        setShowAddTo(false);
        setMovieToAdd(null);
        const res = await authFetch(`${API_BASE_URL}/playlists`);
        const plData = await res.json();
        setPlaylists(plData.playlists);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div style={styles.app}>
      {/* Sidebar - Fixed to the left */}
      <Sidebar currentPage={page} onNavigate={navigate} />

      {/* Main content - Scrollable area */}
      <div style={styles.main}>
        <div style={styles.contentArea}>
          {page === 'home' && (
            <Home onNavigate={navigate} />
          )}
          {page === 'discover' && (
            <Discover onSaveMovie={handleSaveMovie} />
          )}
          {page === 'playlists' && !selectedPlaylist && (
            <PlaylistGrid
              onSelectPlaylist={(p) => {
                setPlaylist(p);
                setPage('playlists');
              }}
              onNavigate={navigate}
            />
          )}
          {page === 'playlists' && selectedPlaylist && (
            <PlaylistDetail
              playlist={selectedPlaylist}
              onBack={() => setPlaylist(null)}
              onUpdate={(updated) => setPlaylist(updated)}
            />
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Auth Modal Overlay */}
      {showAuth && (
        <Auth
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAddTo(false)}
        />
      )}

      {/* Add to playlist picker overlay */}
      {showAddTo && movieToAdd && (
        <div style={styles.overlay}>
          <div style={styles.picker}>
            <div style={styles.pickerHeader}>
              <h3 style={styles.pickerTitle}>Add to playlist</h3>
              <button
                onClick={() => {
                  setShowAddTo(false);
                  setMovieToAdd(null);
                }}
                style={styles.pickerClose}
              >✕</button>
            </div>
            <p style={styles.pickerMovie}>{movieToAdd.title}</p>

            {playlists.length === 0 ? (
              <p style={styles.noPlaylists}>No playlists yet — go to Library to create one</p>
            ) : (
              <div style={styles.pickerList}>
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => addToPlaylist(playlist.id)}
                    style={styles.pickerItem}
                  >
                    <div style={styles.miniCover}>
                      {playlist.movies?.[0]?.poster ? (
                        <img src={playlist.movies[0].poster} alt="" style={styles.miniCoverImg} />
                      ) : (
                        <span style={{ fontSize: '16px' }}>🎬</span>
                      )}
                    </div>
                    <div style={styles.pickerInfo}>
                      <p style={styles.pickerName}>{playlist.name}</p>
                      <p style={styles.pickerCount}>{playlist.movies?.length || 0} movies</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#111111',
  },
  loadingText: {
    fontSize: '48px',
  },
  app: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#111111',
    position: 'fixed',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  main: {
    marginLeft: '220px',
    flex: 1,
    height: '100vh',
    overflowY: 'auto',
    backgroundColor: '#111111',
    display: 'flex',       // Added to help Footer placement
    flexDirection: 'column' // Added to help Footer placement
  },
  contentArea: {
    flex: 1, // This pushes the footer down
    minHeight: 'fit-content'
  },
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
  picker: {
    backgroundColor: '#1c1c1e',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '360px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  pickerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  pickerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: 'white',
  },
  pickerClose: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '12px',
  },
  pickerMovie: {
    margin: '0 0 20px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  noPlaylists: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '13px',
    textAlign: 'center',
    padding: '20px 0',
  },
  pickerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pickerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background 0.15s',
  },
  miniCover: {
    width: '44px',
    height: '44px',
    borderRadius: '6px',
    backgroundColor: '#2c2c2e',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  miniCoverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  pickerInfo: {
    flex: 1,
    minWidth: 0,
  },
  pickerName: {
    margin: '0 0 2px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pickerCount: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
};