import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'marathon_match_prs';

function loadPRs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePRs(prs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prs));
}

const TRACKED_DISTANCES = [
  { id: '5k', name: '5K', km: 5 },
  { id: '10k', name: '10K', km: 10 },
  { id: 'half', name: 'Half Marathon', km: 21.0975 },
  { id: 'marathon', name: 'Marathon', km: 42.195 },
  { id: '50k', name: '50K', km: 50 },
  { id: '50mi', name: '50 Miles', km: 80.467 },
  { id: '100k', name: '100K', km: 100 },
  { id: '100mi', name: '100 Miles', km: 160.934 },
];

function timeDisplay(s) {
  if (!s || s <= 0) return '--:--';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.round(s % 60);
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

function paceDisplay(secPerKm) {
  if (!secPerKm || !isFinite(secPerKm)) return '--:-- /km';
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')} /km`;
}

export default function PRTracker({ activity }) {
  const [prs, setPRs] = useState(loadPRs);
  const [openDist, setOpenDist] = useState(null);

  useEffect(() => {
    savePRs(prs);
  }, [prs]);

  const hasActivity = activity && activity.movingTimeSec > 0;

  const setPR = useCallback((distId, timeSec, date) => {
    setPRs(prev => ({
      ...prev,
      [distId]: { timeSec, date: date || new Date().toISOString().slice(0, 10) },
    }));
  }, []);

  const clearPR = useCallback((distId) => {
    setPRs(prev => {
      const next = { ...prev };
      delete next[distId];
      return next;
    });
  }, []);

  return (
    <div className="section">
      <h2 className="section-title">Personal Records</h2>
      <p className="section-subtitle">
        Save your best times. Tap to edit or set from current run.
      </p>
      <div className="equiv-grid">
        {TRACKED_DISTANCES.map((d) => {
          const pr = prs[d.id];
          const equalOrBetter = hasActivity && Math.abs(activity.distanceKm - d.km) / d.km < 0.1
            && activity.movingTimeSec <= (pr?.timeSec || Infinity);
          return (
            <div key={d.id} className="equiv-card">
              <div className="equiv-badge" style={{ background: pr ? '#22c55e' : '#555' }}>
                {pr ? 'PR' : '—'}
              </div>
              <div className="equiv-dist">{d.name}</div>
              {pr ? (
                <>
                  <div className="equiv-time">{timeDisplay(pr.timeSec)}</div>
                  <div className="equiv-pace">{paceDisplay(pr.timeSec / d.km)}</div>
                  {pr.date && <div className="equiv-comp current">{pr.date}</div>}
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {equalOrBetter && (
                      <button className="pr-update-btn" onClick={() => setPR(d.id, activity.movingTimeSec, activity.startDate)}>
                        Update
                      </button>
                    )}
                    <button className="pr-clear-btn" onClick={() => clearPR(d.id)}>
                      Clear
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="equiv-time" style={{ color: 'var(--text-muted)' }}>No PR set</div>
                  <div className="equiv-pace" style={{ color: 'var(--text-muted)' }}>—</div>
                  {equalOrBetter && (
                    <button
                      className="equiv-comp positive"
                      style={{ cursor: 'pointer', background: 'transparent', border: 'none', font: 'inherit', marginTop: 8 }}
                      onClick={() => setPR(d.id, activity.movingTimeSec, activity.startDate)}
                    >
                      Set from this run
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
