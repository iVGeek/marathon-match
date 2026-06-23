import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllActivities, fetchActivityDetail, isRunningActivity, parseActivityStats, parseActivityDetail, isTokenExpired, refreshAccessToken, storeToken } from '../utils/strava';
import { analyzeSplits } from '../utils/paceAnalysis';
import ActivitySelector from './ActivitySelector';
import ManualInput from './ManualInput';
import PaceAnalysis from './PaceAnalysis';
import EquivTimes from './EquivTimes';
import MarathonGrid from './MarathonGrid';
import MarathonDetail from './MarathonDetail';
import PaceBand from './PaceBand';
import TrainingPaces from './TrainingPaces';
import PRTracker from './PRTracker';
import { projectRun } from '../utils/projections';
import { allCourses } from '../utils/marathonData';
import { useTheme } from '../utils/theme';

export default function Dashboard({ token, athlete, onLogout, config }) {
  const { theme, toggle: toggleTheme } = useTheme();
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [paceAnalysis, setPaceAnalysis] = useState(null);
  const [selectedProjection, setSelectedProjection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(null);
  const [userAge, setUserAge] = useState(() => {
    const saved = localStorage.getItem('marathon_match_age');
    return saved ? parseInt(saved, 10) : null;
  });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFetchFailed, setDetailFetchFailed] = useState(false);
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

  const computedProjections = useMemo(() => {
    if (!selectedActivity) return [];
    const userTemp = selectedActivity.averageTemp || null;
    const athleteWithAge = { ...athlete, age: userAge };
    const results = allCourses.map((course) =>
      projectRun(
        selectedActivity.distanceKm,
        selectedActivity.movingTimeSec,
        selectedActivity.elevationGain,
        course,
        userTemp,
        paceAnalysis,
        athleteWithAge
      )
    );
    results.sort((a, b) => a.projectedTimeSec - b.projectedTimeSec);
    return results;
  }, [selectedActivity, paceAnalysis, athlete, userAge]);

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
      setLoading(true);
      setLoadProgress(null);
      try {
        const accessToken = await ensureValidToken(currentToken);
        if (!accessToken) return;
        const data = await fetchAllActivities(accessToken, (total, batchSize) => {
          setLoadProgress({ total, lastBatch: batchSize });
        });
        const runs = data.filter(isRunningActivity).map(parseActivityStats);
        setActivities(runs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadProgress(null);
      }
    })();
  }, [currentToken, ensureValidToken]);

  const handleSelectActivity = useCallback(async (activity) => {
    setSelectedActivity(activity);
    setSelectedProjection(null);
    setPaceAnalysis(null);
    setDetailFetchFailed(false);

    let effectiveActivity = activity;
    let analysis = null;
    let fetchFailed = false;

    if (!activity.isManual) {
      setDetailLoading(true);
      try {
        const accessToken = await ensureValidToken(currentToken);
        if (!accessToken) {
          fetchFailed = true;
        } else {
          const detail = await fetchActivityDetail(accessToken, activity.id);
          const parsed = parseActivityDetail(detail);
          effectiveActivity = parsed;

          if (parsed.splits && parsed.splits.length > 0) {
            analysis = analyzeSplits(parsed.splits, parsed.averageHeartrate, parsed.maxHeartrate);
            if (analysis && parsed.splits) {
              analysis._rawSplits = parsed.splits;
            }
          }
        }
      } catch (err) {
        console.error('Activity detail fetch failed:', err?.message || err);
        fetchFailed = true;
      } finally {
        setDetailLoading(false);
        if (fetchFailed) setDetailFetchFailed(true);
      }
    }

    setPaceAnalysis(analysis);
    setSelectedActivity(effectiveActivity);
  }, [currentToken, ensureValidToken, athlete]);

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
              <span className="athlete-name">{athlete.firstname} {athlete.lastname}</span>
              <span className="athlete-stats">
                {athlete.sex && <span className="athlete-stat">{athlete.sex === 'M' ? 'Male' : 'Female'}</span>}
                {athlete.weight && <span className="athlete-stat">{athlete.weight} kg</span>}
              </span>
              <span className="athlete-age-wrapper">
                <label className="athlete-age-label">Age:</label>
                <input
                  type="number"
                  className="athlete-age-input"
                  min={10}
                  max={120}
                  value={userAge ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                    setUserAge(v);
                    localStorage.setItem('marathon_match_age', v ?? '');
                  }}
                  placeholder="—"
                />
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Disconnect
          </button>
        </div>
      </header>

      {selectedProjection ? (
        <MarathonDetail projection={selectedProjection} onBack={handleBack} athlete={athlete} userAge={userAge} />
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
              loadProgress={loadProgress}
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
              {!detailLoading && !detailFetchFailed && !paceAnalysis && (
                <div className="section"><p className="text-muted">No per-km split data from Strava for this activity. Projections will use average pace.</p></div>
              )}

              <TrainingPaces activity={selectedActivity} />
              <EquivTimes activity={selectedActivity} analysis={paceAnalysis} />
              <PRTracker activity={selectedActivity} />
              {computedProjections.length > 0 && (
                <MarathonGrid
                  projections={computedProjections}
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
