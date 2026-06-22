import { useState } from 'react';
import { paceDisplay, timeDisplay } from '../utils/projections';
import { checkBQ } from '../utils/standardDistances';
import { countryFlag, countryName } from '../utils/countryData';
import { getResults, estimateRank } from '../utils/raceResults';
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

  const results = getResults(p.courseId);
  const rank = estimateRank(p.projectedTimeSec, p.courseId);
  const rankYear = results?.year;

  const avgPaceSec = p.projectedTimeSec / p.distanceKm;
  const fadePct = p.paceFadePct || 6;
  const totalFade = Math.min(12, Math.max(3, fadePct * Math.min(1, p.distanceKm / p.userDistance || 1.5)));
  const segmentSize = 5;
  const numSegments = Math.ceil(p.distanceKm / segmentSize);
  const segDists = Array.from({ length: numSegments }, (_, i) => {
    const start = i * segmentSize;
    const end = Math.min((i + 1) * segmentSize, p.distanceKm);
    return { idx: i, dist: end - start, cumEnd: end };
  });

  const rawMultipliers = segDists.map(s => 1 + (totalFade / 100) * (s.cumEnd / p.distanceKm - 0.5));
  const avgMultiplier = rawMultipliers.reduce((sum, m, i) => sum + m * segDists[i].dist, 0) / p.distanceKm;
  const multipliers = rawMultipliers.map(m => m / avgMultiplier);

  let cumTime = 0;
  const splits = segDists.map((s, i) => {
    const segPace = avgPaceSec * multipliers[i];
    const segTime = segPace * s.dist;
    const prevCum = cumTime;
    cumTime += segTime;
    return {
      label: `${s.cumEnd} km`,
      segTime,
      segPace,
      cumTime,
      segPaceDisplay: paceDisplay(segPace),
      segTimeDisplay: timeDisplay(segTime),
      cumTimeDisplay: timeDisplay(cumTime),
      pctComplete: ((s.cumEnd / p.distanceKm) * 100).toFixed(0),
      isSlow: multipliers[i] > 1.02,
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
            <h2 className="detail-title">{p.courseName} {p.country ? <img src={countryFlag(p.country)} alt="" className="course-flag" onError={(e) => { e.target.style.display='none' }} /> : ''}</h2>
            <p className="detail-location">{p.country ? <img src={countryFlag(p.country)} alt="" className="course-flag" onError={(e) => { e.target.style.display='none' }} /> : ''} {p.location} {p.country ? '(' + countryName(p.country) + ')' : ''}</p>
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
            <span className="tag">{p.diffVsRun === 'Less' ? `Easier (${p.diffVsRunPct.toFixed(0)}% less)` : p.diffVsRun === 'More' ? `Harder (${p.diffVsRunPct.toFixed(0)}% more)` : 'Similar difficulty'}</span>
            <span className="tag">{p.distanceKm} km</span>
            {p.endurancePenalty > 1 && <span className="tag">+{((p.endurancePenalty - 1) * 100).toFixed(0)}% endurance adj</span>}
            {p.ageFactor && p.ageFactor > 1 && <span className="tag">+{((p.ageFactor - 1) * 100).toFixed(0)}% age adj</span>}
            {p.userWeight && <span className="tag">{p.userWeight} kg</span>}
          </div>

          <ElevationChart courseId={p.courseId} distanceKm={p.distanceKm} color={p.color} />

          {p.courseWeather && (
            <div className="weather-info">
              <div className="weather-header">
                <span className="weather-icon">{p.courseWeather.tempC >= 25 ? '☀️' : p.courseWeather.tempC <= 5 ? '🥶' : '🌤️'}</span>
                <span className="weather-title">Race Day Weather</span>
              </div>
              <div className="weather-details">
                <div className="weather-stat">
                  <span className="weather-label">Course temp</span>
                  <span className="weather-value">{p.courseWeather.tempC}°C</span>
                </div>
                <div className="weather-stat">
                  <span className="weather-label">Conditions</span>
                  <span className="weather-value">{p.courseWeather.condition}</span>
                </div>
                <div className="weather-stat">
                  <span className="weather-label">Race month</span>
                  <span className="weather-value">{p.courseWeather.month}</span>
                </div>
                {p.userTemperature != null && (
                  <div className="weather-stat">
                    <span className="weather-label">Your run temp</span>
                    <span className="weather-value">{p.userTemperature}°C</span>
                  </div>
                )}
              </div>
              {p.weatherFactor && p.weatherFactor !== 1 && (
                <div className="weather-note">
                  Weather adjustment: {p.weatherFactor > 1 ? '+' : ''}{((p.weatherFactor - 1) * 100).toFixed(1)}%
                  ({p.weatherFactor > 1 ? 'harder' : 'easier'} conditions than your run)
                </div>
              )}
            </div>
          )}

          {rank && (
            <div className="ranking-info">
              <div className="ranking-header">Race Ranking Estimate — {p.courseName} {p.country ? <img src={countryFlag(p.country)} alt="" className="course-flag" onError={(e) => { e.target.style.display='none' }} /> : ''}</div>
              <div className="ranking-details">
                <div className="ranking-stat">
                  <span className="ranking-label">Projected Position</span>
                  <span className="ranking-value" style={{ fontSize: 20, color: rank.topPct <= 10 ? 'var(--positive)' : rank.topPct <= 25 ? 'var(--accent)' : 'var(--text)' }}>
                    #{rank.position.toLocaleString()} / {rank.totalFinishers.toLocaleString()}
                  </span>
                </div>
                <div className="ranking-stat">
                  <span className="ranking-label">Faster Than</span>
                  <span className="ranking-value">{Math.max(0, 100 - parseFloat(rank.topPct)).toFixed(0)}% of finishers</span>
                </div>
                <div className="ranking-stat">
                  <span className="ranking-label">Men's Winner ({rankYear || '2025'})</span>
                  <span className="ranking-value">{rank.winnerName} — {timeDisplay(rank.winnerTimeSec)} <span className="winner-pace">({paceDisplay(rank.winnerTimeSec / p.distanceKm)}/km)</span></span>
                </div>
                <div className="ranking-stat">
                  <span className="ranking-label">Women's Winner ({rankYear || '2025'})</span>
                  <span className="ranking-value">{rank.winnerWomenName} — {timeDisplay(rank.winnerWomenTimeSec)} <span className="winner-pace">({paceDisplay(rank.winnerWomenTimeSec / p.distanceKm)}/km)</span></span>
                </div>
              </div>
            </div>
          )}

          {p.endurancePenalty > 1 && (
            <div className="endurance-note">
              <strong>Endurance penalty applied:</strong> {((p.endurancePenalty - 1) * 100).toFixed(0)}%
              added because your run ({p.userDistance.toFixed(1)} km) is shorter than this course
              ({p.distanceKm} km).
            </div>
          )}

          {p.ageFactor && p.ageFactor > 1 && (
            <div className="endurance-note">
              <strong>Age adjustment applied:</strong> {((p.ageFactor - 1) * 100).toFixed(0)}%
              added for age {p.userAge} (peak performance modeled at age 27, slower recovery and endurance decline beyond).
            </div>
          )}

          {p.userWeight && (
            <div className="endurance-note">
              <strong>Weight-based hill penalty:</strong> {p.userWeight} kg body weight factors into elevation adjustment
              — heavier runners lose more time on hilly courses.
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

          {numSegments > 1 && (
            <div className="splits-section">
              <h3 className="detail-section-title">Pacing Strategy</h3>
              <p className="detail-section-subtitle">
                Projected {p.distanceKm} km splits with realistic pace fade ({totalFade.toFixed(0)}% total fade)
              </p>
              <div className="splits-header">
                <span>Split</span>
                <span>Split Time</span>
                <span>Split Pace</span>
                <span>Cumulative</span>
              </div>
              <div className="splits-body">
                {splits.map((split) => (
                  <div key={split.label} className={`split-row ${split.isSlow ? 'fade' : ''}`}>
                    <span className="split-label">{split.label}</span>
                    <span className="split-value">{split.segTimeDisplay}</span>
                    <span className={`split-value ${split.isSlow ? 'slow' : 'fast'}`}>{split.segPaceDisplay}</span>
                    <span className="split-value cum">{split.cumTimeDisplay}</span>
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
