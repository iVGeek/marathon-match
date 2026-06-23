import { useState, useEffect, useCallback } from 'react';
import { getStoredToken, storeToken, clearToken, isTokenExpired, getAuthUrl } from './utils/strava';
import { fetchConfig } from './config';
import { ThemeProvider } from './utils/theme';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [token, setToken] = useState(null);
  const [athlete, setAthlete] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await fetchConfig();
        setConfig(cfg);
      } catch (err) {
        setConfigError(err.message);
      }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresAt = params.get('expires_at');
    const athleteData = params.get('athlete');

    if (accessToken && refreshToken && expiresAt) {
      const data = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: parseInt(expiresAt),
        athlete: athleteData ? JSON.parse(athleteData) : null,
      };
      storeToken(data);
      window.history.replaceState({}, '', '/');
      setToken(data);
      setAthlete(data.athlete);
    } else {
      const stored = getStoredToken();
      if (stored) {
        setToken(stored);
        setAthlete(stored.athlete);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    setToken(null);
    setAthlete(null);
  }, []);

  if (loading || !config) {
    return (
      <ThemeProvider>
        <div className="app-loading">
          <div className="spinner" />
        </div>
      </ThemeProvider>
    );
  }

  if (configError || !config.stravaClientId) {
    return (
      <ThemeProvider>
        <div className="login-page">
          <div className="login-card setup-notice">
            <h2>Backend Not Running</h2>
            <p>Can't reach the backend server. Make sure it's running on port 3001.</p>
            <p>Configure <code>server/.env</code> with your Strava credentials and run:</p>
            <code>npm run start</code>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!token) {
    const authUrl = getAuthUrl(config.stravaClientId, config.stravaRedirectUri);
    return (
      <ThemeProvider>
        <Login authUrl={authUrl} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Dashboard
        token={token}
        athlete={athlete}
        onLogout={handleLogout}
        config={config}
      />
    </ThemeProvider>
  );
}
