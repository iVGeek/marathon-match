import { useState } from 'react';
import { paceDisplay, timeDisplay } from '../utils/projections';
import { checkBQ } from '../utils/standardDistances';
import ElevationChart from './ElevationChart';

function relevanceBadge(relevance) {
  const styles = {
    high: { cls: 'rel-high', label: 'Very relevant' },
    medium: { cls: 'rel-medium', label: 'Relevant' },
    low: { cls: 'rel-low', label: 'Approximate' },
    estimate: { cls: 'rel-estimate', label: 'Rough estimate' },
  };
  const s = styles[relevance.level] || styles.estimate;
  return (
    <div className={`relevance-card ${s.cls}`}>
      <strong>Projection confidence:</strong> {s.label}
    </div>
  );
}

export default function MarathonDetail({ projection, onBack }) {
  const p = projection;
  const paceRatio = p.projectedPaceSec / p.userPaceSec;
  const isFaster = paceRatio < 1;
  const pctDiff = Math.abs((paceRatio - 1) * 100);
  const isMarathon = Math.abs(p.distanceKm - 42.195) < 0.01;

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const bqResult = (age >= 18 && isMarathon) ? checkBQ(p.projectedTimeSec, parseInt(age), gender) : null;

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

  const numSplits = Math.ceil(p.distanceKm / 5);
  const splits = Array.from({ length: numSplits }, (_, i) => {
    const splitDist = Math.min((i + 1) * 5, p.distanceKm);
    const splitTime = (splitDist / p.distanceKm) * p.projectedTimeSec;
    const splitPace = splitTime / splitDist;
    return {
      label: `${splitDist} km`,
      cumulativeTime: timeDisplay(splitTime),
      avgPace: paceDisplay(splitPace),
      pctComplete: ((splitDist / p.distanceKm) * 100).toFixed(0),
    };
  });

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
          {relevanceBadge(p.relevance)}
          <p>{p.description}</p>
          <div className="detail-tags">
            <span className="tag">{p.surface}</span>
            <span className="tag">Difficulty: {p.difficulty.toFixed(2)}x</span>
            <span className="tag">{p.distanceKm} km</span>
            {p.endurancePenalty > 1 && <span className="tag">+{((p.endurancePenalty - 1) * 100).toFixed(0)}% endurance adj</span>}
          </div>

          <ElevationChart courseId={p.courseId} distanceKm={p.distanceKm} color={p.color} />

          {p.endurancePenalty > 1 && (
            <div className="endurance-note">
              <strong>Endurance penalty applied:</strong> {((p.endurancePenalty - 1) * 100).toFixed(0)}%
              added because your run ({p.userDistance.toFixed(1)} km) is shorter than this course
              ({p.distanceKm} km).
            </div>
          )}

          {isMarathon && (
            <div className="bq-section">
              <h3 className="detail-section-title">Boston Qualifier Check</h3>
              <div className="bq-inputs">
                <div className="bq-field">
                  <label>Age</label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    placeholder="Your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="bq-field">
                  <label>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              {bqResult && (
                <div className={`bq-result ${bqResult.qualifies ? 'qualifies' : 'no'}`}>
                  {bqResult.qualifies ? (
                    <>
                      <strong>✓ You'd qualify!</strong>
                      <span>{bqResult.bufferDisplay} — BQ standard is {bqResult.bqTimeDisplay}</span>
                    </>
                  ) : (
                    <>
                      <strong>✗ Doesn't qualify</strong>
                      <span>BQ standard for your age/gender: {bqResult.bqTimeDisplay} ({bqResult.bufferDisplay})</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
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
                        <div className="bar-fill user-bar" style={{ width: `${userPct}%` }} />
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
                        <div className="bar-fill proj-bar" style={{ width: `${projPct}%`, background: p.color }} />
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

          {numSplits > 1 && (
            <div className="splits-section">
              <h3 className="detail-section-title">Pacing Strategy</h3>
              <p className="detail-section-subtitle">
                Projected {p.distanceKm} km splits at even pace
              </p>
              <div className="splits-header">
                <span>Split</span>
                <span>Split Time</span>
                <span>Avg Pace</span>
              </div>
              <div className="splits-body">
                {splits.map((split) => (
                  <div key={split.label} className="split-row">
                    <span className="split-label">{split.label}</span>
                    <span className="split-value">{split.cumulativeTime}</span>
                    <span className="split-value">{split.avgPace}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
