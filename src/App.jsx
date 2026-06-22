import { useState, useEffect, useCallback } from 'react';
import { getStoredToken, storeToken, clearToken, isTokenExpired, getAuthUrl } from './utils/strava';
import config from './config';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [token, setToken] = useState(null);
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!token) {
    if (!config.strava.clientId) {
      return (
        <div className="login-page">
          <div className="login-card setup-notice">
            <h2>Strava API Setup Required</h2>
            <p>To use Marathon Match, you need to create a Strava API application.</p>
            <p>1. Go to <a href="https://www.strava.com/settings/api" target="_blank" rel="noreferrer">strava.com/settings/api</a></p>
            <p>2. Create an application, set the callback domain to <code>localhost</code></p>
            <p>3. Copy your Client ID and Client Secret</p>
            <p>4. Rename <code>server/.env.example</code> to <code>server/.env</code> and fill in the values</p>
            <p>5. Also create a <code>.env</code> file at the root with:</p>
            <code>VITE_STRAVA_CLIENT_ID=your_client_id<br/>VITE_STRAVA_REDIRECT_URI=http://localhost:3001/api/auth/callback</code>
          </div>
        </div>
      );
    }
    const authUrl = getAuthUrl(config.strava.clientId, config.strava.redirectUri);
    return <Login authUrl={authUrl} />;
  }

  return (
    <Dashboard
      token={token}
      athlete={athlete}
      onLogout={handleLogout}
    />
  );
}
