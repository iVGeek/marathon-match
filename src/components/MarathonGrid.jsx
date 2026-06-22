import { useState } from 'react';
import { paceDisplay } from '../utils/projections';

const FILTERS = {
  all: 'All Courses',
  marathon: 'Marathons (42.2k)',
  half: 'Half Marathons (21.1k)',
  flat: 'Flat (difficulty < 1.0)',
  hilly: 'Hilly (difficulty ≥ 1.1)',
};

export default function MarathonGrid({ projections, onSelect }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('time');
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = projections.filter((p) => {
    if (filter === 'marathon') return Math.abs(p.distanceKm - 42.195) < 0.01;
    if (filter === 'half') return Math.abs(p.distanceKm - 21.0975) < 0.01;
    if (filter === 'flat') return p.difficulty < 1.0;
    if (filter === 'hilly') return p.difficulty >= 1.1;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'time') return a.projectedTimeSec - b.projectedTimeSec;
    if (sort === 'pace') return a.projectedPaceSec - b.projectedPaceSec;
    if (sort === 'difficulty') return b.difficulty - a.difficulty;
    if (sort === 'name') return a.courseName.localeCompare(b.courseName);
    return 0;
  });

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Marathon Projections</h2>
        <div className="controls">
          <select
            className="control-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {Object.entries(FILTERS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            className="control-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="time">Fastest Time</option>
            <option value="pace">Fastest Pace</option>
            <option value="difficulty">Hardest First</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="grid-header">
        <span className="grid-cell course">Course</span>
        <span className="grid-cell dist">Distance</span>
        <span className="grid-cell time">Projected Time</span>
        <span className="grid-cell pace">Pace</span>
        <span className="grid-cell elev">Elevation</span>
        <span className="grid-cell diff">Difficulty</span>
        <span className="grid-cell adj">vs Your Pace</span>
      </div>

      <div className="grid-body">
        {sorted.slice(0, 50).map((p) => {
          const paceRatio = p.projectedPaceSec / p.userPaceSec;
          const isFaster = paceRatio < 1;
          const pctDiff = Math.abs((paceRatio - 1) * 100);
          const isHovered = hoveredId === p.courseId;

          return (
            <button
              key={p.courseId}
              className={`grid-row ${isHovered ? 'hovered' : ''}`}
              style={{ borderLeftColor: p.color }}
              onMouseEnter={() => setHoveredId(p.courseId)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(p)}
            >
              <span className="grid-cell course">
                <span className="course-dot" style={{ background: p.color }} />
                <span className="course-name">{p.courseName}</span>
              </span>
              <span className="grid-cell dist">{p.distanceKm} km</span>
              <span className="grid-cell time">{p.projectedTime}</span>
              <span className="grid-cell pace">{paceDisplay(p.projectedPaceSec)}</span>
              <span className="grid-cell elev">{p.elevationGain}m</span>
              <span className="grid-cell diff">
                <span className={`diff-badge ${p.difficulty >= 1.2 ? 'hard' : p.difficulty >= 1.05 ? 'moderate' : 'easy'}`}>
                  {p.difficulty.toFixed(2)}x
                </span>
              </span>
              <span className={`grid-cell adj ${isFaster ? 'faster' : 'slower'}`}>
                {isFaster ? `${pctDiff.toFixed(1)}% faster` : `${pctDiff.toFixed(1)}% slower`}
              </span>
            </button>
          );
        })}
      </div>

      <p className="grid-note">
        Click any row to see detailed comparison. Projections use the Riegel formula adjusted for course elevation and difficulty.
      </p>
    </div>
  );
}
