import { paceDisplay } from '../utils/projections';

function splitChart(splits, avgPace, color) {
  if (!splits || splits.length === 0) return null;
  const maxPace = Math.max(...splits.map(s => s.moving_time / s.distance * 1.15), avgPace * 1.2);
  const minPace = Math.min(...splits.map(s => s.moving_time / s.distance * 0.85), avgPace * 0.8);
  const range = maxPace - minPace || 1;

  return splits.slice(0, 40).map((s, i) => {
    const pace = s.moving_time / s.distance;
    const pct = 10 + ((maxPace - pace) / range) * 80;
    const isFaster = pace <= avgPace;
    return (
      <div key={i} className="split-bar-group" title={`${i + 1}km: ${paceDisplay(pace)}`}>
        <div
          className="split-bar"
          style={{
            height: `${Math.max(pct, 10)}%`,
            background: isFaster ? 'var(--positive)' : color,
            opacity: Math.abs(pace - avgPace) / range > 0.3 ? 0.9 : 0.6,
          }}
        />
      </div>
    );
  });
}

export default function PaceAnalysis({ analysis }) {
  if (!analysis) return null;

  const a = analysis;
  const gapDiff = a.avgGAPSec ? ((a.avgPaceSec - a.avgGAPSec) / a.avgPaceSec) * 100 : 0;

  return (
    <div className="section">
      <h2 className="section-title">Pace Analysis</h2>
      <p className="section-subtitle">Detailed breakdown of your run from Strava split data.</p>

      <div className="pa-grid">
        <div className="pa-card">
          <div className="pa-label">Average Pace</div>
          <div className="pa-value">{a.avgPaceDisplay}</div>
        </div>

        {a.avgGAPSec && (
          <div className="pa-card highlight">
            <div className="pa-label">Grade Adjusted Pace</div>
            <div className="pa-value">{a.avgGAPDisplay}</div>
            <div className="pa-note">{gapDiff > 0 ? `${gapDiff.toFixed(1)}% faster than raw pace` : 'Same as raw pace'}</div>
          </div>
        )}

        <div className="pa-card">
          <div className="pa-label">Pacing</div>
          <div className="pa-value" style={{ color: a.paceFadePct > 5 ? 'var(--negative)' : a.paceFadePct < -1 ? 'var(--positive)' : 'var(--text)' }}>
            {a.paceFadeLabel}
          </div>
          <div className="pa-note">
            1st half: {a.firstHalfAvgPace} &rarr; 2nd half: {a.secondHalfAvgPace}
          </div>
        </div>

        <div className="pa-card">
          <div className="pa-label">Consistency</div>
          <div className="pa-value">{a.consistencyLabel}</div>
          <div className="pa-note">CV: {a.consistencyCV.toFixed(1)}%</div>
        </div>

        {a.avgHR && (
          <div className="pa-card">
            <div className="pa-label">Heart Rate</div>
            <div className="pa-value">{a.avgHR.toFixed(0)} bpm</div>
            {a.hrZones.zone && <div className="pa-note">{a.hrZones.zone} ({a.hrZones.pctMax}% max)</div>}
          </div>
        )}

        {a.avgCadence && (
          <div className="pa-card">
            <div className="pa-label">Cadence</div>
            <div className="pa-value">{a.avgCadenceRounded} spm</div>
          </div>
        )}

        {a.avgGAPSec && (
          <div className="pa-card">
            <div className="pa-label">GAP Impact</div>
            <div className="pa-value" style={{ color: gapDiff > 2 ? 'var(--accent)' : 'var(--text-muted)' }}>
              {gapDiff > 2 ? `${gapDiff.toFixed(1)}% hill penalty` : 'Mostly flat run'}
            </div>
            <div className="pa-note">Run had elevation, GAP normalizes it</div>
          </div>
        )}
      </div>

      {a.splitCount > 1 && (
        <div className="split-chart-container">
          <div className="split-chart-header">
            <span>Pace per km</span>
            <span className="split-chart-avg-line" style={{ borderColor: 'var(--text-muted)' }}>
              Avg: {a.avgPaceDisplay}
            </span>
          </div>
          <div className="split-chart">
            <div className="split-bars">
              {splitChart(
                a._rawSplits || [],
                a.avgPaceSec,
                'var(--accent)'
              )}
            </div>
            <div className="split-labels">
              {a._rawSplits && a._rawSplits.slice(0, 40).map((_, i) => (
                <span key={i} className="split-label">{i + 1}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
