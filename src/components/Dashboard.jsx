import { useState, useEffect, useCallback } from 'react';
import { fetchActivities, isRunningActivity, parseActivityStats, isTokenExpired, refreshAccessToken } from '../utils/strava';
import { storeToken } from '../utils/strava';
import config from '../config';
import ActivitySelector from './ActivitySelector';
import MarathonGrid from './MarathonGrid';
import MarathonDetail from './MarathonDetail';
import { projectRun } from '../utils/projections';
import { allCourses } from '../utils/marathonData';

export default function Dashboard({ token, athlete, onLogout }) {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [projections, setProjections] = useState([]);
  const [selectedProjection, setSelectedProjection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentToken, setCurrentToken] = useState(token);

  const ensureValidToken = useCallback(async (tok) => {
    if (!isTokenExpired(tok)) return tok.accessToken;
    try {
      const data = await refreshAccessToken(tok.refreshToken, config.strava.clientId, config.strava.clientSecret);
      const newToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
        athlete: tok.athlete,
      };
      storeToken({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        athlete: tok.athlete,
      });
      setCurrentToken(newToken);
      return data.access_token;
    } catch {
      onLogout();
      return null;
    }
  }, [onLogout]);

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await ensureValidToken(currentToken);
        if (!accessToken) return;
        const data = await fetchActivities(accessToken);
        const runs = data.filter(isRunningActivity).map(parseActivityStats);
        setActivities(runs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentToken, ensureValidToken]);

  const handleSelectActivity = useCallback((activity) => {
    setSelectedActivity(activity);
    setSelectedProjection(null);
    const results = allCourses.map((course) =>
      projectRun(activity.distanceKm, activity.movingTimeSec, activity.elevationGain, course)
    );
    results.sort((a, b) => a.projectedTimeSec - b.projectedTimeSec);
    setProjections(results);
  }, []);

  const handleSelectProjection = useCallback((proj) => {
    setSelectedProjection(proj);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedProjection(null);
  }, []);

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-banner">
          <span>Error loading activities: {error}</span>
          <button onClick={onLogout}>Reconnect Strava</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="header-title">Marathon Match</h1>
          {athlete && (
            <span className="header-athlete">
              {athlete.firstname} {athlete.lastname}
            </span>
          )}
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Disconnect
        </button>
      </header>

      {selectedProjection ? (
        <MarathonDetail projection={selectedProjection} onBack={handleBack} />
      ) : (
        <>
          <ActivitySelector
            activities={activities}
            loading={loading}
            selectedId={selectedActivity?.id}
            onSelect={handleSelectActivity}
          />

          {selectedActivity && projections.length > 0 && (
            <MarathonGrid
              projections={projections}
              onSelect={handleSelectProjection}
            />
          )}
        </>
      )}
    </div>
  );
}
