import { useState, useEffect, useCallback } from 'react';
import { fetchActivities, fetchActivityDetail, isRunningActivity, parseActivityStats, parseActivityDetail, isTokenExpired, refreshAccessToken, storeToken } from '../utils/strava';
import { analyzeSplits } from '../utils/paceAnalysis';
import ActivitySelector from './ActivitySelector';
import ManualInput from './ManualInput';
import PaceAnalysis from './PaceAnalysis';
import EquivTimes from './EquivTimes';
import MarathonGrid from './MarathonGrid';
import MarathonDetail from './MarathonDetail';
import PaceBand from './PaceBand';
import { projectRun } from '../utils/projections';
import { allCourses } from '../utils/marathonData';

export default function Dashboard({ token, athlete, onLogout, config }) {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [paceAnalysis, setPaceAnalysis] = useState(null);
  const [projections, setProjections] = useState([]);
  const [selectedProjection, setSelectedProjection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const normalizeToken = (t) => {
    if (!t) return null;
    return {
      accessToken: t.accessToken || t.access_token,
      refreshToken: t.refreshToken || t.refresh_token,
      expiresAt: t.expiresAt || t.expires_at,
      athlete: t.athlete || null,
    };
  };
  const [currentToken, setCurrentToken] = useState(() => normalizeToken(token));
  const [inputMode, setInputMode] = useState('strava');

  const ensureValidToken = useCallback(async (tok) => {
    if (!isTokenExpired(tok)) return tok.accessToken;
    try {
      const data = await refreshAccessToken(tok.refreshToken);
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

  const handleSelectActivity = useCallback(async (activity) => {
    setSelectedActivity(activity);
    setSelectedProjection(null);
    setPaceAnalysis(null);
    setProjections([]);

    let effectiveActivity = activity;
    let analysis = null;

    if (!activity.isManual) {
      setDetailLoading(true);
      try {
        const accessToken = await ensureValidToken(currentToken);
        if (accessToken) {
          const detail = await fetchActivityDetail(accessToken, activity.id);
          const parsed = parseActivityDetail(detail);
          effectiveActivity = parsed;

          if (parsed.splits && parsed.splits.length > 0) {
            analysis = analyzeSplits(parsed.splits, parsed.averageHeartrate, parsed.maxHeartrate);
            if (analysis && parsed.splits) {
              analysis._rawSplits = parsed.splits;
            }
          } else if (parsed.splits) {
            console.warn('Activity has splits array but it is empty:', activity.id);
          }
        }
      } catch (err) {
        console.error('Activity detail fetch failed:', err?.message || err);
      } finally {
        setDetailLoading(false);
      }
    }

    setPaceAnalysis(analysis);
    setSelectedActivity(effectiveActivity);

    const userTemp = effectiveActivity.averageTemp || null;
    const results = allCourses.map((course) =>
      projectRun(
        effectiveActivity.distanceKm,
        effectiveActivity.movingTimeSec,
        effectiveActivity.elevationGain,
        course,
        userTemp,
        analysis
      )
    );
    results.sort((a, b) => a.projectedTimeSec - b.projectedTimeSec);
    setProjections(results);
  }, [currentToken, ensureValidToken]);

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
            <div className="header-athlete">
              {athlete.profile && <img src={athlete.profile} alt="" className="athlete-avatar" />}
              <span>{athlete.firstname} {athlete.lastname}</span>
            </div>
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
          <div className="input-tabs">
            <button
              className={`input-tab ${inputMode === 'strava' ? 'active' : ''}`}
              onClick={() => setInputMode('strava')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-3.526l-2.89-5.725H0l5.88 11.573 4.238-8.348m4.544 3.029l-2.89-5.725h-5.38l4.679 9.222 4.239-8.348z"/></svg>
              Strava Activities
            </button>
            <button
              className={`input-tab ${inputMode === 'manual' ? 'active' : ''}`}
              onClick={() => setInputMode('manual')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              Manual Entry
            </button>
          </div>

          {inputMode === 'strava' ? (
            <ActivitySelector
              activities={activities}
              loading={loading}
              selectedId={selectedActivity?.id}
              onSelect={handleSelectActivity}
            />
          ) : (
            <ManualInput onRunSubmit={handleSelectActivity} />
          )}

          {selectedActivity && (
            <>
              {detailLoading && (
                <div className="section">
                  <div className="loading-activities">
                    <div className="spinner" />
                    <span>Loading detailed splits and analysis...</span>
                  </div>
                </div>
              )}

              {paceAnalysis && <PaceAnalysis analysis={paceAnalysis} />}
              {!detailLoading && selectedActivity && !selectedActivity.isManual && !paceAnalysis && (
                <div className="section"><p className="text-muted">No split data available for this activity (may need GPS data or longer run). Showing projections based on average pace.</p></div>
              )}

              <EquivTimes activity={selectedActivity} analysis={paceAnalysis} />
              {projections.length > 0 && (
                <MarathonGrid
                  projections={projections}
                  onSelect={handleSelectProjection}
                />
              )}
            </>
          )}

          <PaceBand />
        </>
      )}
    </div>
  );
}
