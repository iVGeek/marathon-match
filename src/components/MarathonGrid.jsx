import { useState, useMemo, memo } from 'react';
import { paceDisplay } from '../utils/projections';
import { countryFlag } from '../utils/countryData';
import { estimateRank } from '../utils/raceResults';

const RelBadge = memo(function RelBadge({ relevance }) {
  const map = {
    high: ['rel-high', 'Very relevant'],
    medium: ['rel-medium', 'Relevant'],
    low: ['rel-low', 'Approximate'],
    estimate: ['rel-estimate', 'Rough estimate'],
  };
  const [cls, label] = map[relevance.level] || map.estimate;
  return <span className={`rel-badge ${cls}`}>{label}</span>;
});

function formatRank(rank) {
  if (!rank) return null;
  if (rank.topPct <= 1) return { value: `#${rank.position}`, sub: 'ELITE!' };
  if (rank.topPct <= 5) return { value: `Top ${rank.topPct.toFixed(1)}%`, sub: `of ${rank.totalFinishers.toLocaleString()}` };
  return { value: `#${rank.position.toLocaleString()}`, sub: `of ${rank.totalFinishers.toLocaleString()}` };
}

function rankColor(rank) {
  if (!rank) return '#888';
  if (rank.topPct <= 5) return '#27ae60';
  if (rank.topPct <= 10) return '#2ecc71';
  if (rank.topPct <= 25) return 'var(--accent)';
  return '#888';
}

const CourseCard = memo(function CourseCard({ p, onSelect }) {
  const rank = useMemo(() => estimateRank(p.projectedTimeSec, p.courseId), [p.projectedTimeSec, p.courseId]);
  const r = formatRank(rank);
  const rc = rankColor(rank);
  const paceRatio = p.projectedPaceSec / p.userPaceSec;
  const faster = paceRatio < 1;
  const pct = Math.abs((paceRatio - 1) * 100);
  const diffLabel = p.diffVsRun === 'Less' ? `${p.diffVsRunPct.toFixed(0)}% easier`
    : p.diffVsRun === 'More' ? `${p.diffVsRunPct.toFixed(0)}% harder` : 'Similar difficulty';

  return (
    <button className="course-card" style={{ '--accent-color': p.color }} onClick={() => onSelect(p)}>
      <div className="cc-rank" style={{ color: rc }}>
        <span className="cc-rank-val">{r?.value}</span>
        <span className="cc-rank-sub">{r?.sub}</span>
      </div>
      <div className="cc-main">
        <div className="cc-name-row">
          <span className="cc-dot" />
          <span className="cc-name">{p.courseName}</span>
          {p.country && <img src={countryFlag(p.country)} alt="" className="cc-flag" onError={e => e.target.style.display = 'none'} />}
          <RelBadge relevance={p.relevance} />
        </div>
        <div className="cc-stats">
          <div className="cc-stat">
            <span className="cc-stat-val">{p.projectedTime}</span>
            <span className="cc-stat-lbl">time</span>
          </div>
          <div className="cc-stat">
            <span className="cc-stat-val">{paceDisplay(p.projectedPaceSec)}</span>
            <span className="cc-stat-lbl">pace</span>
          </div>
          <div className="cc-stat">
            <span className={`cc-stat-val ${p.diffVsRun === 'More' ? 'cc-hard' : p.diffVsRun === 'Less' ? 'cc-easy' : ''}`}>{diffLabel}</span>
            <span className="cc-stat-lbl">{faster ? `${pct.toFixed(1)}% ahead` : `${pct.toFixed(1)}% behind`}</span>
          </div>
          <div className="cc-stat cc-winners">
            {rank ? (
              <>
                <span className="cc-stat-val">M {paceDisplay(rank.winnerTimeSec / p.distanceKm, true)}/km</span>
                <span className="cc-stat-lbl">F {paceDisplay(rank.winnerWomenTimeSec / p.distanceKm, true)}/km</span>
              </>
            ) : <span className="cc-stat-val cc-no-data">—</span>}
          </div>
        </div>
      </div>
      <div className="cc-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </button>
  );
});

const SEGMENTS = [
  { key: 'half', label: 'Half', icon: '½', dist: 21.0975, eps: 0.01 },
  { key: 'full', label: 'Full', icon: '42', dist: 42.195, eps: 0.01 },
  { key: 'ultra', label: 'Ultra', icon: '∞', dist: null, eps: null },
];

const MarathonGrid = memo(function MarathonGrid({ projections, onSelect }) {
  const [segment, setSegment] = useState('full');
  const [sort, setSort] = useState('time');

  const counts = useMemo(() => ({
    half: projections.filter(p => Math.abs(p.distanceKm - 21.0975) < 0.01).length,
    full: projections.filter(p => Math.abs(p.distanceKm - 42.195) < 0.01).length,
    ultra: projections.filter(p => p.distanceKm > 45).length,
  }), [projections]);

  const filtered = useMemo(() => projections.filter(p => {
    if (segment === 'half') return Math.abs(p.distanceKm - 21.0975) < 0.01;
    if (segment === 'full') return Math.abs(p.distanceKm - 42.195) < 0.01;
    if (segment === 'ultra') return p.distanceKm > 45;
    return true;
  }), [projections, segment]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sort === 'time') return a.projectedTimeSec - b.projectedTimeSec;
    if (sort === 'pace') return a.projectedPaceSec - b.projectedPaceSec;
    if (sort === 'difficulty') return b.difficulty - a.difficulty;
    if (sort === 'name') return a.courseName.localeCompare(b.courseName);
    if (sort === 'relevance') return b.relevance.score - a.relevance.score || a.projectedTimeSec - b.projectedTimeSec;
    return 0;
  }), [filtered, sort]);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'time', label: 'Fastest Time' },
    { value: 'pace', label: 'Fastest Pace' },
    { value: 'difficulty', label: 'Hardest' },
    { value: 'name', label: 'A–Z' },
  ];

  return (
    <div className="section marathon-grid-section">
      <div className="section-header">
        <h2 className="section-title">Course Projections</h2>
        <select className="control-select" value={sort} onChange={e => setSort(e.target.value)}>
          {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
        <p className="text-muted" style={{ padding: '20px 0' }}>No courses in this category.</p>
      ) : (
        <div className="course-list">
          {sorted.slice(0, 50).map(p => (
            <CourseCard key={p.courseId} p={p} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
});

export default MarathonGrid;
