import { projectRun } from '../utils/projections';
import { standardDistances } from '../utils/standardDistances';
import { paceDisplay, timeDisplay } from '../utils/projections';

function makeFlatCourse(dist) {
  return {
    id: dist.id,
    name: dist.name,
    location: '',
    distanceKm: dist.distanceKm,
    elevationGain: 0,
    difficulty: 1.0,
    color: '#60a5fa',
    surface: 'Road',
    description: '',
  };
}

export default function EquivTimes({ activity }) {
  const equivs = standardDistances.map((dist) => {
    const course = makeFlatCourse(dist);
    const result = projectRun(activity.distanceKm, activity.movingTimeSec, activity.elevationGain, course);
    return result;
  });

  const userPace = activity.movingTimeSec / activity.distanceKm;

  return (
    <div className="section">
      <h2 className="section-title">Equivalent Race Times</h2>
      <p className="section-subtitle">
        What your run translates to at standard race distances (flat course, adjusted for endurance).
      </p>
      <div className="equiv-grid">
        {equivs.map((e) => {
          const paceRatio = e.projectedPaceSec / userPace;
          const isFaster = paceRatio < 1;
          const pct = Math.abs((paceRatio - 1) * 100);
          const isCurrent = Math.abs(e.distanceKm - activity.distanceKm) < 0.1;

          return (
            <div key={e.courseId} className={`equiv-card ${isCurrent ? 'current' : ''}`}>
              <div className="equiv-badge" style={{ background: e.color }}>{e.courseName}</div>
              <div className="equiv-dist">{e.distanceKm.toFixed(1)} km</div>
              <div className="equiv-time">{e.projectedTime}</div>
              <div className="equiv-pace">{paceDisplay(e.projectedPaceSec)}</div>
              {!isCurrent && (
                <div className={`equiv-comp ${isFaster ? 'positive' : 'negative'}`}>
                  {isFaster
                    ? `${pct.toFixed(0)}% faster pace`
                    : `${pct.toFixed(0)}% slower pace`}
                </div>
              )}
              {isCurrent && (
                <div className="equiv-comp current">Your run</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
