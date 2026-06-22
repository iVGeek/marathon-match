import { useState } from 'react';
import { standardDistances } from '../utils/standardDistances';
import { paceDisplay, timeDisplay } from '../utils/projections';

export default function PaceBand() {
  const [mode, setMode] = useState('time');
  const [targetTimeSec, setTargetTimeSec] = useState(10800);
  const [targetPaceSec, setTargetPaceSec] = useState(300);

  const [h, setH] = useState('3');
  const [m, setM] = useState('0');
  const [s, setS] = useState('0');
  const [pMin, setPMin] = useState('5');
  const [pSec, setPSec] = useState('0');

  function updateFromTime() {
    const hh = parseInt(h) || 0;
    const mm = parseInt(m) || 0;
    const ss = parseInt(s) || 0;
    const total = hh * 3600 + mm * 60 + ss;
    if (total > 0) setTargetTimeSec(total);
  }

  function updateFromPace() {
    const min = parseInt(pMin) || 0;
    const sec = parseInt(pSec) || 0;
    const total = min * 60 + sec;
    if (total > 0) setTargetPaceSec(total);
  }

  const selectedDistances = mode === 'time'
    ? standardDistances.filter(d => d.distanceKm >= 21.0975)
    : standardDistances;

  return (
    <div className="section">
      <h2 className="section-title">Pace Band Calculator</h2>
      <p className="section-subtitle">Set a target finish time or pace and see what you need across all distances.</p>

      <div className="paceband-tabs">
        <button className={`paceband-tab ${mode === 'time' ? 'active' : ''}`} onClick={() => setMode('time')}>
          Target Finish Time
        </button>
        <button className={`paceband-tab ${mode === 'pace' ? 'active' : ''}`} onClick={() => setMode('pace')}>
          Target Pace
        </button>
      </div>

      {mode === 'time' ? (
        <div className="paceband-inputs">
          <div className="paceband-field">
            <label>Target Marathon Time</label>
            <div className="time-inputs">
              <input type="number" min="0" max="23" placeholder="H" value={h} onChange={(e) => setH(e.target.value)} />
              <span className="time-sep">:</span>
              <input type="number" min="0" max="59" placeholder="M" value={m} onChange={(e) => setM(e.target.value)} />
              <span className="time-sep">:</span>
              <input type="number" min="0" max="59" placeholder="S" value={s} onChange={(e) => setS(e.target.value)} />
            </div>
            <button className="paceband-btn" onClick={updateFromTime}>Calculate</button>
          </div>

          <div className="paceband-results">
            <div className="paceband-result-card highlight">
              <div className="pr-label">Required Pace</div>
              <div className="pr-value">{paceDisplay(targetTimeSec / 42.195)}</div>
            </div>
            <div className="paceband-result-card">
              <div className="pr-label">Half Marathon Split</div>
              <div className="pr-value">{timeDisplay(targetTimeSec / 2)}</div>
            </div>
            <div className="paceband-result-card">
              <div className="pr-label">10K Split</div>
              <div className="pr-value">{timeDisplay((10 / 42.195) * targetTimeSec)}</div>
            </div>
          </div>

          <div className="paceband-table">
            <div className="pb-header">
              <span>Distance</span>
              <span>Finish Time</span>
              <span>Pace /km</span>
            </div>
            {selectedDistances.map(d => {
              const dTime = (d.distanceKm / 42.195) * targetTimeSec;
              const dPace = dTime / d.distanceKm;
              return (
                <div key={d.id} className="pb-row">
                  <span className="pb-label">{d.name}</span>
                  <span className="pb-value">{timeDisplay(dTime)}</span>
                  <span className="pb-value">{paceDisplay(dPace)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="paceband-inputs">
          <div className="paceband-field">
            <label>Target Pace (/km)</label>
            <div className="time-inputs">
              <input type="number" min="0" max="59" placeholder="Min" value={pMin} onChange={(e) => setPMin(e.target.value)} />
              <span className="time-sep">:</span>
              <input type="number" min="0" max="59" placeholder="Sec" value={pSec} onChange={(e) => setPSec(e.target.value)} />
            </div>
            <button className="paceband-btn" onClick={updateFromPace}>Calculate</button>
          </div>

          <div className="paceband-results">
            <div className="paceband-result-card highlight">
              <div className="pr-label">Marathon Time</div>
              <div className="pr-value">{timeDisplay(targetPaceSec * 42.195)}</div>
            </div>
            <div className="paceband-result-card">
              <div className="pr-label">Half Marathon</div>
              <div className="pr-value">{timeDisplay(targetPaceSec * 21.0975)}</div>
            </div>
            <div className="paceband-result-card">
              <div className="pr-label">10K</div>
              <div className="pr-value">{timeDisplay(targetPaceSec * 10)}</div>
            </div>
          </div>

          <div className="paceband-table">
            <div className="pb-header">
              <span>Distance</span>
              <span>Finish Time</span>
              <span>Pace /km</span>
            </div>
            {selectedDistances.map(d => {
              const dTime = targetPaceSec * d.distanceKm;
              return (
                <div key={d.id} className="pb-row">
                  <span className="pb-label">{d.name}</span>
                  <span className="pb-value">{timeDisplay(dTime)}</span>
                  <span className="pb-value">{paceDisplay(targetPaceSec)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
