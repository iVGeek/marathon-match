import { useState } from 'react';

export default function ManualInput({ onRunSubmit }) {
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [elevation, setElevation] = useState('');
  const [temperature, setTemperature] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const d = parseFloat(distance);
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const elev = parseFloat(elevation) || 0;
    const temp = temperature !== '' ? parseFloat(temperature) : null;

    if (!d || d <= 0) { setError('Enter a valid distance'); return; }
    if (d > 100) { setError('Max distance is 100 km'); return; }
    const totalSec = h * 3600 + m * 60 + s;
    if (totalSec <= 0) { setError('Enter a valid time'); return; }
    if (totalSec > 86400) { setError('Time must be under 24 hours'); return; }

    const activity = {
      id: 'manual-' + Date.now(),
      name: `${d.toFixed(1)} km Run`,
      distanceKm: d,
      movingTimeSec: totalSec,
      elapsedTimeSec: totalSec,
      elevationGain: elev,
      startDate: new Date().toISOString(),
      averageSpeed: d / (totalSec / 3600),
      averageTemp: temp,
      isManual: true,
    };

    onRunSubmit(activity);
  }

  return (
    <div className="manual-input-card">
      <h3 className="manual-title">Manual Entry</h3>
      <p className="manual-subtitle">Enter a run manually to see course projections without Strava.</p>
      <form onSubmit={handleSubmit} className="manual-form">
        <div className="manual-row">
          <div className="manual-field">
            <label>Distance (km)</label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="100"
              placeholder="e.g. 10.5"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
        <div className="manual-field">
          <label>Elevation (m)</label>
          <input
            type="number"
            step="1"
            min="0"
            placeholder="e.g. 50"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
          />
        </div>
        <div className="manual-field">
          <label>Temperature (°C) — optional</label>
          <input
            type="number"
            step="1"
            placeholder="e.g. 15"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />
        </div>
        </div>
        <div className="manual-field">
          <label>Time</label>
          <div className="time-inputs">
            <input
              type="number"
              min="0"
              max="23"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            <span className="time-sep">:</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="Min"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
            <span className="time-sep">:</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="Sec"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="manual-error">{error}</p>}
        <button type="submit" className="manual-submit">Calculate Projections</button>
      </form>
    </div>
  );
}
