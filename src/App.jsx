import { useState, useEffect, useCallback } from 'react';
import { getStoredToken, storeToken, clearToken, isTokenExpired, getAuthUrl } from './utils/strava';
import { fetchConfig } from './config';
import { ThemeProvider } from './utils/theme';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function AppContent() {
  const [token, setToken] = useState(null);
  const [athlete, setAthlete] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(null);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await fetchConfig();
        setConfig(cfg);
      } catch (err) {
        setConfigError(err.message);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const expiresAt = params.get('expires_at');
      const athleteData = params.get('athlete');

      if (accessToken && refreshToken && expiresAt) {
        let parsedAthlete = null;
        try {
          parsedAthlete = athleteData ? JSON.parse(athleteData) : null;
        } catch {
          console.warn('Failed to parse athlete data from URL');
        }
        const data = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: parseInt(expiresAt),
          athlete: parsedAthlete,
        };
        storeToken(data);
        window.history.replaceState({}, '', '/');
        setToken(data);
        setAthlete(parsedAthlete);
      } else {
        const stored = getStoredToken();
        if (stored) {
          setToken(stored);
          setAthlete(stored.athlete);
        }
      }
    } catch (err) {
      console.error('Init error:', err);
      setInitError(err.message);
    }
    setLoading(false);
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    setToken(null);
    setAthlete(null);
  }, []);

  if (initError) {
    return (
      <div className="login-page">
        <div className="login-card setup-notice">
          <h2>Something went wrong</h2>
          <p>{initError}</p>
          <button className="strava-btn" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (configError || (config && !config.stravaClientId)) {
    return (
      <div className="login-page">
        <div className="login-card setup-notice">
          <h2>Backend Not Running</h2>
          <p>Can't reach the backend server. Make sure it's running on port 3001.</p>
          <p>Configure <code>server/.env</code> with your Strava credentials and run:</p>
          <code>npm run start</code>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!token) {
    const authUrl = getAuthUrl(config.stravaClientId, config.stravaRedirectUri);
    return <Login authUrl={authUrl} />;
  }

  return (
    <Dashboard
      token={token}
      athlete={athlete}
      onLogout={handleLogout}
      config={config}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
