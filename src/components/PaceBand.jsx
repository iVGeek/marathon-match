import { useState } from 'react';
import { standardDistances } from '../utils/standardDistances';
import { paceDisplay, timeDisplay, riegelProjection } from '../utils/projections';

const RIEGEL_EXP = 1.06;

export default function PaceBand() {
  const [h, setH] = useState('3');
  const [m, setM] = useState('0');
  const [s, setS] = useState('0');
  const [pMin, setPMin] = useState('5');
  const [pSec, setPSec] = useState('0');
  const [baseDist, setBaseDist] = useState('42.195');
  const [results, setResults] = useState(null);
  const [mode, setMode] = useState('marathon');

  const baseDistObj = standardDistances.find(d => d.distanceKm === parseFloat(baseDist)) || standardDistances[0];

  function calcFromMarathon() {
    const hh = parseInt(h) || 0;
    const mm = parseInt(m) || 0;
    const ss = parseInt(s) || 0;
    const marathonSec = hh * 3600 + mm * 60 + ss;
    if (marathonSec <= 0) return;
    const rows = standardDistances.map(d => {
      const t = riegelProjection(marathonSec, 42.195, d.distanceKm);
      return { ...d, timeSec: t, paceSec: d.distanceKm > 0 ? t / d.distanceKm : 0 };
    });
    rows.sort((a, b) => a.distanceKm - b.distanceKm);
    setResults({ baseName: 'Marathon', baseTime: marathonSec, baseDistKm: 42.195, rows });
  }

  function calcFromPace() {
    const min = parseInt(pMin) || 0;
    const sec = parseInt(pSec) || 0;
    const paceSec = min * 60 + sec;
    if (paceSec <= 0) return;
    const distKm = parseFloat(baseDist) || 42.195;
    const baseTime = paceSec * distKm;
    const rows = standardDistances.map(d => {
      const t = riegelProjection(baseTime, distKm, d.distanceKm);
      return { ...d, timeSec: t, paceSec: d.distanceKm > 0 ? t / d.distanceKm : 0 };
    });
    rows.sort((a, b) => a.distanceKm - b.distanceKm);
    setResults({ baseName: baseDistObj.name, baseTime, baseDistKm: distKm, paceSec, rows });
  }

  return (
    <div className="section">
      <h2 className="section-title">Pace Band Calculator</h2>
      <p className="section-subtitle">Uses Riegel formula (t₂ = t₁ × (d₂/d₁)^1.06) — realistic projections showing pace fade over longer distances.</p>

      <div className="paceband-tabs">
        <button className={`paceband-tab ${mode === 'marathon' ? 'active' : ''}`} onClick={() => setMode('marathon')}>
          Target Marathon Time
        </button>
        <button className={`paceband-tab ${mode === 'pace' ? 'active' : ''}`} onClick={() => setMode('pace')}>
          Target Pace
        </button>
      </div>

      {mode === 'marathon' ? (
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
            <button className="paceband-btn" onClick={calcFromMarathon}>Calculate</button>
          </div>
        </div>
      ) : (
        <div className="paceband-inputs">
          <div className="paceband-field">
            <label>Target Pace (/km) for</label>
            <div className="time-inputs">
              <input type="number" min="0" max="59" placeholder="Min" value={pMin} onChange={(e) => setPMin(e.target.value)} />
              <span className="time-sep">:</span>
              <input type="number" min="0" max="59" placeholder="Sec" value={pSec} onChange={(e) => setPSec(e.target.value)} />
              <select className="paceband-dist-select" value={baseDist} onChange={(e) => setBaseDist(e.target.value)}>
                {standardDistances.filter(d => d.distanceKm <= 42.195).map(d => (
                  <option key={d.id} value={d.distanceKm}>{d.name}</option>
                ))}
              </select>
            </div>
            <button className="paceband-btn" onClick={calcFromPace}>Calculate</button>
          </div>
        </div>
      )}

      {results && (
        <>
          <div className="paceband-results">
            <div className="paceband-result-card highlight">
              <div className="pr-label">{results.baseName} Pace</div>
              <div className="pr-value">{paceDisplay(results.baseTime / results.baseDistKm)}</div>
            </div>
            {results.rows.filter(d => d.distanceKm < 42.195).slice(-2).map(d => (
              <div key={d.id} className="paceband-result-card">
                <div className="pr-label">{d.name} Split</div>
                <div className="pr-value">{timeDisplay(d.timeSec)}</div>
              </div>
            ))}
          </div>

          <div className="paceband-table">
            <div className="pb-header">
              <span>Distance</span>
              <span>Finish Time</span>
              <span>Pace /km</span>
              <span>vs Base Pace</span>
            </div>
            {results.rows.map(d => {
              const basePace = results.baseTime / results.baseDistKm;
              const diff = ((d.paceSec / basePace) - 1) * 100;
              const isBase = Math.abs(d.distanceKm - results.baseDistKm) < 0.01;
              return (
                <div key={d.id} className="pb-row">
                  <span className="pb-label">{d.name}</span>
                  <span className="pb-value">{timeDisplay(d.timeSec)}</span>
                  <span className="pb-value">{paceDisplay(d.paceSec)}</span>
                  <span className="pb-value" style={{ color: diff > 3 ? 'var(--negative)' : diff < -1 ? 'var(--positive)' : 'var(--text-muted)', fontSize: 12 }}>
                    {isBase ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="paceband-note">
            Based on Riegel formula with exponent {RIEGEL_EXP}. Longer distances show pace fade automatically.
            A {results.baseName} time of {timeDisplay(results.baseTime)} at {paceDisplay(results.baseTime / results.baseDistKm)} gives a ~{paceDisplay(results.rows.find(d => d.distanceKm >= 100)?.paceSec || 0)} pace at 100K.
          </p>
        </>
      )}
    </div>
  );
}
