import { memo } from 'react';
import { paceDisplay, timeDisplay } from '../utils/projections';

const ActivityCard = memo(function ActivityCard({ act, selectedId, onSelect }) {
  const pace = paceDisplay(act.movingTimeSec / act.distanceKm);
  const time = timeDisplay(act.movingTimeSec);
  const isSelected = act.id === selectedId;
  return (
    <button
      className={`activity-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(act)}
    >
      <div className="activity-name">{act.name}</div>
      <div className="activity-stats">
        <span className="stat">{act.distanceKm.toFixed(2)} km</span>
        <span className="stat-divider">|</span>
        <span className="stat">{time}</span>
        <span className="stat-divider">|</span>
        <span className="stat">{pace}</span>
        {act.elevationGain > 0 && (
          <>
            <span className="stat-divider">|</span>
            <span className="stat">{act.elevationGain}m elev</span>
          </>
        )}
      </div>
      <div className="activity-date">
        {new Date(act.startDate).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })}
      </div>
    </button>
  );
});

export default function ActivitySelector({ activities, loading, loadProgress, selectedId, onSelect }) {
  if (loading) {
    return (
      <div className="section">
        <h2 className="section-title">Your Recent Runs</h2>
        <div className="loading-activities">
          <div className="spinner" />
          <span>
            {loadProgress
              ? `Loading activities... (${loadProgress.total} found)`
              : 'Loading your activities...'}
          </span>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="section">
        <h2 className="section-title">Your Recent Runs</h2>
        <p className="empty-state">
          No running activities found. Make sure you have runs on Strava.
        </p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">Your Recent Runs</h2>
      <p className="section-subtitle">
        Choose a recent activity to project against marathon courses.
      </p>
      <div className="activity-list">
        {activities.slice(0, 20).map((act) => (
          <ActivityCard
            key={act.id}
            act={act}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
