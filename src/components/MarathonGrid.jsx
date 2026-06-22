import { useState, useMemo } from 'react';
import { paceDisplay } from '../utils/projections';
import { countryFlag } from '../utils/countryData';
import { estimateRank } from '../utils/raceResults';

function relevanceBadge(relevance) {
  const styles = {
    high: { cls: 'rel-high', label: '★ Very relevant' },
    medium: { cls: 'rel-medium', label: '● Relevant' },
    low: { cls: 'rel-low', label: '◐ Approximate' },
    estimate: { cls: 'rel-estimate', label: '○ Rough estimate' },
  };
  const s = styles[relevance.level] || styles.estimate;
  return <span className={`rel-badge ${s.cls}`}>{s.label}</span>;
}

const SEGMENTS = [
  { key: 'half', label: 'Half', icon: '½', dist: 21.0975, eps: 0.01 },
  { key: 'full', label: 'Full', icon: '42', dist: 42.195, eps: 0.01 },
  { key: 'ultra', label: 'Ultra', icon: '∞', dist: null, eps: null },
];

export default function MarathonGrid({ projections, onSelect }) {
  const [segment, setSegment] = useState('full');
  const [sort, setSort] = useState('time');
  const [hoveredId, setHoveredId] = useState(null);

  const counts = useMemo(() => ({
    half: projections.filter(p => Math.abs(p.distanceKm - 21.0975) < 0.01).length,
    full: projections.filter(p => Math.abs(p.distanceKm - 42.195) < 0.01).length,
    ultra: projections.filter(p => p.distanceKm > 45).length,
  }), [projections]);

  const filtered = projections.filter((p) => {
    if (segment === 'half') return Math.abs(p.distanceKm - 21.0975) < 0.01;
    if (segment === 'full') return Math.abs(p.distanceKm - 42.195) < 0.01;
    if (segment === 'ultra') return p.distanceKm > 45;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'time') return a.projectedTimeSec - b.projectedTimeSec;
    if (sort === 'pace') return a.projectedPaceSec - b.projectedPaceSec;
    if (sort === 'difficulty') return b.difficulty - a.difficulty;
    if (sort === 'name') return a.courseName.localeCompare(b.courseName);
    if (sort === 'relevance') return b.relevance.score - a.relevance.score || a.projectedTimeSec - b.projectedTimeSec;
    return 0;
  });

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'time', label: 'Fastest Time' },
    { value: 'pace', label: 'Fastest Pace' },
    { value: 'difficulty', label: 'Hardest First' },
    { value: 'name', label: 'Name A-Z' },
  ];

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Course Projections</h2>
        <select className="control-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="segment-tabs">
        {SEGMENTS.map(s => (
          <button
            key={s.key}
            className={`segment-tab ${segment === s.key ? 'active' : ''}`}
            onClick={() => setSegment(s.key)}
          >
            <span className="segment-icon">{s.icon}</span>
            <span className="segment-label">{s.label}</span>
            <span className="segment-count">{counts[s.key]}</span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted" style={{ padding: '20px 12px' }}>No courses in this category.</p>
      ) : (
        <>
          <div className="grid-header">
            <span className="grid-cell course">Course</span>
            <span className="grid-cell dist">Distance</span>
            <span className="grid-cell time">Projected Time</span>
            <span className="grid-cell pace">Pace</span>
            <span className="grid-cell rank">Rank</span>
            <span className="grid-cell relev">Relevance</span>
            <span className="grid-cell diff">Difficulty</span>
            <span className="grid-cell adj">vs Your Pace</span>
            <span className="grid-cell winner">M/F Winners</span>
          </div>

          <div className="grid-body">
            {sorted.slice(0, 50).map((p) => {
              const paceRatio = p.projectedPaceSec / p.userPaceSec;
              const isFaster = paceRatio < 1;
              const pctDiff = Math.abs((paceRatio - 1) * 100);
              const rank = estimateRank(p.projectedTimeSec, p.courseId);

              return (
                <button
                  key={p.courseId}
                  className={`grid-row ${hoveredId === p.courseId ? 'hovered' : ''}`}
                  style={{ borderLeftColor: p.color }}
                  onMouseEnter={() => setHoveredId(p.courseId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelect(p)}
                >
                  <span className="grid-cell course">
                    <span className="course-dot" style={{ background: p.color }} />
                    <span className="course-name">{p.courseName}</span>
                    {p.country ? <img src={countryFlag(p.country)} alt="" className="course-flag" onError={(e) => { e.target.style.display='none' }} /> : null}
                  </span>
                  <span className="grid-cell dist">{p.distanceKm} km</span>
                  <span className="grid-cell time">{p.projectedTime}</span>
                  <span className="grid-cell pace">{paceDisplay(p.projectedPaceSec)}</span>
                  <span className="grid-cell rank">
                    {rank ? (() => {
                      const rankColor = rank.topPct <= 5 ? '#27ae60' : rank.topPct <= 10 ? '#2ecc71' : rank.topPct <= 25 ? 'var(--accent)' : '#888';
                      const rankLabel = rank.topPct <= 1 ? 'ELITE' : rank.topPct <= 5 ? `Top ${rank.topPct.toFixed(1)}%` : `#${rank.position.toLocaleString()}`;
                      return <span className="rank-badge" style={{ color: rankColor, borderColor: rankColor }}>{rankLabel}</span>;
                    })() : null}
                  </span>
                  <span className="grid-cell relev">{relevanceBadge(p.relevance)}</span>
                  <span className="grid-cell diff">
                    <span className={`diff-badge ${p.diffVsRun === 'More' ? 'hard' : p.diffVsRun === 'Less' ? 'easy' : 'moderate'}`}>
                      {p.diffVsRun === 'Less' ? `Less (${p.diffVsRunPct.toFixed(0)}% easier)` : p.diffVsRun === 'More' ? `More (${p.diffVsRunPct.toFixed(0)}% harder)` : 'Similar'}
                    </span>
                  </span>
                  <span className={`grid-cell adj ${isFaster ? 'faster' : 'slower'}`}>
                    {isFaster ? `${pctDiff.toFixed(1)}% faster` : `${pctDiff.toFixed(1)}% slower`}
                  </span>
                  <span className="grid-cell winner">
                    {rank ? <span className="winner-pace">M {paceDisplay(rank.winnerTimeSec / p.distanceKm)} F {paceDisplay(rank.winnerWomenTimeSec / p.distanceKm)}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
