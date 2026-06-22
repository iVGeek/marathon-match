import { paceDisplay, timeDisplay } from '../utils/projections';

export default function MarathonDetail({ projection, onBack }) {
  const p = projection;
  const paceRatio = p.projectedPaceSec / p.userPaceSec;
  const isFaster = paceRatio < 1;
  const pctDiff = Math.abs((paceRatio - 1) * 100);

  const bars = [
    { label: 'Distance', user: p.userDistance, proj: p.distanceKm, unit: ' km', precision: 2 },
    { label: 'Pace', user: p.userPaceSec, proj: p.projectedPaceSec, unit: '/km', formatted: true, inverse: true },
    { label: 'Time', user: p.userDuration, proj: p.projectedTimeSec, unit: '', formatted: true, inverse: true },
    { label: 'Elevation', user: p.userElevation, proj: p.elevationGain, unit: 'm', precision: 0 },
  ];

  const maxVal = Math.max(...bars.map((b) => {
    const uv = b.formatted ? (b.inverse ? b.user : b.user) : b.user;
    const pv = b.formatted ? (b.inverse ? b.proj : b.proj) : b.proj;
    return Math.max(uv, pv);
  }), 1);

  return (
    <div className="section">
      <button className="back-btn" onClick={onBack}>
        ← Back to all projections
      </button>

      <div className="detail-header" style={{ borderBottomColor: p.color }}>
        <div className="detail-title-row">
          <span className="course-dot large" style={{ background: p.color }} />
          <div>
            <h2 className="detail-title">{p.courseName}</h2>
            <p className="detail-location">{p.location}</p>
          </div>
        </div>
        <div className="detail-summary">
          <div className="summary-card highlight">
            <div className="summary-label">Projected Time</div>
            <div className="summary-value">{p.projectedTime}</div>
          </div>
          <div className="summary-card highlight">
            <div className="summary-label">Projected Pace</div>
            <div className="summary-value">{paceDisplay(p.projectedPaceSec)}</div>
          </div>
          <div className={`summary-card ${isFaster ? 'positive' : 'negative'}`}>
            <div className="summary-label">vs Your Run</div>
            <div className="summary-value">
              {isFaster ? `${pctDiff.toFixed(1)}% faster` : `${pctDiff.toFixed(1)}% slower`}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-description">
          <p>{p.description}</p>
          <div className="detail-tags">
            <span className="tag">{p.surface}</span>
            <span className="tag">Difficulty: {p.difficulty.toFixed(2)}x</span>
            <span className="tag">{p.distanceKm} km</span>
          </div>
        </div>

        <div className="detail-comparison">
          <h3 className="detail-section-title">How You Compare</h3>
          <p className="detail-section-subtitle">
            Your run vs what we project on this course
          </p>

          <div className="comparison-bars">
            {bars.map((bar) => {
              const userVal = bar.formatted
                ? (bar.inverse ? bar.user : bar.user)
                : bar.user;
              const projVal = bar.formatted
                ? (bar.inverse ? bar.proj : bar.proj)
                : bar.proj;
              const userPct = (userVal / maxVal) * 100;
              const projPct = (projVal / maxVal) * 100;

              return (
                <div key={bar.label} className="comparison-row">
                  <div className="comparison-label">{bar.label}</div>
                  <div className="comparison-bars-container">
                    <div className="bar-group">
                      <div className="bar-label">Your Run</div>
                      <div className="bar-track">
                        <div
                          className="bar-fill user-bar"
                          style={{ width: `${userPct}%` }}
                        />
                      </div>
                      <div className="bar-value">
                        {bar.formatted
                          ? (bar.label === 'Pace' ? paceDisplay(bar.user) : timeDisplay(bar.user))
                          : bar.user.toFixed(bar.precision)}
                        {bar.unit}
                      </div>
                    </div>
                    <div className="bar-group">
                      <div className="bar-label">Projected</div>
                      <div className="bar-track">
                        <div
                          className="bar-fill proj-bar"
                          style={{ width: `${projPct}%`, background: p.color }}
                        />
                      </div>
                      <div className="bar-value">
                        {bar.formatted
                          ? (bar.label === 'Pace' ? paceDisplay(bar.proj) : timeDisplay(bar.proj))
                          : bar.proj.toFixed(bar.precision)}
                        {bar.unit}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
