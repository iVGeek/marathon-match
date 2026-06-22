import { useMemo } from 'react';
import { computeTrainingPaces } from '../utils/trainingPaces';

export default function TrainingPaces({ activity }) {
  const paces = useMemo(() => {
    if (!activity) return null;
    return computeTrainingPaces(activity.distanceKm, activity.movingTimeSec);
  }, [activity]);

  if (!paces) return null;

  return (
    <div className="section">
      <h2 className="section-title">Training Paces</h2>
      <p className="section-subtitle">
        VDOT {paces.vdot} — based on your {activity.distanceKm.toFixed(1)} km effort at {paces.inputPace}
      </p>
      <div className="pa-grid">
        {paces.zones.map((z) => (
          <div key={z.key} className={`pa-card ${z.key === 'marathon' ? 'highlight' : ''}`}>
            <div className="pa-label">{z.name}</div>
            <div className="pa-value">{z.paceDisplay}</div>
            <div className="pa-note">{z.pct} HR — {z.feel}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
