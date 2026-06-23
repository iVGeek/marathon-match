import { useState, useMemo, memo } from 'react';
import { paceDisplay } from '../utils/projections';
import { countryFlag } from '../utils/countryData';
import { estimateRank } from '../utils/raceResults';

const RelBadge = memo(function RelBadge({ relevance }) {
  const map = {
    high: ['rel-high', '★ Very relevant'],
    medium: ['rel-medium', '● Relevant'],
    low: ['rel-low', '◐ Approximate'],
    estimate: ['rel-estimate', '○ Rough estimate'],
  };
  const [cls, label] = map[relevance.level] || map.estimate;
  return <span className={`rel-badge ${cls}`}>{label}</span>;
});

function formatRank(rank) {
  if (!rank) return null;
  if (rank.topPct <= 1) return { text: `#${rank.position}`, sub: 'ELITE!' };
  if (rank.topPct <= 5) return { text: `Top ${rank.topPct.toFixed(1)}%`, sub: '' };
  return { text: `#${rank.position.toLocaleString()}`, sub: `/${rank.totalFinishers.toLocaleString()}` };
}

function rankColor(rank) {
  if (!rank) return '#888';
  if (rank.topPct <= 1) return '#1a8a4a';
  if (rank.topPct <= 5) return '#27ae60';
  if (rank.topPct <= 10) return '#2ecc71';
  if (rank.topPct <= 25) return 'var(--accent)';
  return '#888';
}

function rankBg(rank) {
  if (!rank) return 'transparent';
  if (rank.topPct <= 1) return 'rgba(26, 138, 74, 0.12)';
  if (rank.topPct <= 5) return 'rgba(39, 174, 96, 0.1)';
  if (rank.topPct <= 10) return 'rgba(46, 204, 113, 0.08)';
  if (rank.topPct <= 25) return 'rgba(252, 76, 2, 0.08)';
  return 'transparent';
}

const GridRow = memo(function GridRow({ p, onSelect, style }) {
  const paceRatio = p.projectedPaceSec / p.userPaceSec;
  const isFaster = paceRatio < 1;
  const pctDiff = Math.abs((paceRatio - 1) * 100);
  const pctDir = isFaster ? '↓' : '↑';
  const rank = useMemo(() => estimateRank(p.projectedTimeSec, p.courseId), [p.projectedTimeSec, p.courseId]);
  const rc = rankColor(rank);
  const rb = rankBg(rank);
  const rf = formatRank(rank);

  return (
    <button className="grid-row" style={{ '--row-color': p.color, ...style }} onClick={() => onSelect(p)}>
      <span className="grid-cell course">
        <span className="course-dot" />
        <span className="course-name">{p.courseName}</span>
        <span className="course-meta">
          {p.country && <img src={countryFlag(p.country)} alt="" className="course-flag" onError={e => e.target.style.display = 'none'} />}
          <RelBadge relevance={p.relevance} />
        </span>
      </span>
      <span className="grid-cell dist">{p.distanceKm}<span className="unit">km</span></span>
      <span className="grid-cell time">{p.projectedTime}</span>
      <span className="grid-cell pace">{paceDisplay(p.projectedPaceSec)}</span>
      <span className="grid-cell rank">
        {rank && (
          <span className="rank-badge" style={{ color: rc, borderColor: rc, background: rb }}>
            <span className="rank-text">{rf.text}</span>
            {rf.sub && <span className="rank-sub">{rf.sub}</span>}
          </span>
        )}
      </span>
      <span className="grid-cell relev-mobile"><RelBadge relevance={p.relevance} /></span>
      <span className="grid-cell diff">
        <span className={`diff-badge ${p.diffVsRun === 'More' ? 'hard' : p.diffVsRun === 'Less' ? 'easy' : 'moderate'}`}>
          {p.diffVsRun === 'Less' ? `−${p.diffVsRunPct.toFixed(0)}%` : p.diffVsRun === 'More' ? `+${p.diffVsRunPct.toFixed(0)}%` : '~'}
          <span className="diff-label">{p.diffVsRun === 'Less' ? ' easier' : p.diffVsRun === 'More' ? ' harder' : ' similar'}</span>
        </span>
      </span>
      <span className={`grid-cell adj ${isFaster ? 'faster' : 'slower'}`}>
        <span className="adj-icon">{pctDir}</span>
        <span>{pctDiff.toFixed(1)}%</span>
      </span>
      <span className="grid-cell winner">
        {rank && (
          <span className="winner-pace">
            <span className="winner-sex">M</span> {paceDisplay(rank.winnerTimeSec / p.distanceKm, true)}/km
            <span className="winner-divider">|</span>
            <span className="winner-sex">F</span> {paceDisplay(rank.winnerWomenTimeSec / p.distanceKm, true)}/km
          </span>
        )}
      </span>
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
    <div className="section projections-section">
      <div className="section-header">
        <h2 className="section-title">
          <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Course Projections
        </h2>
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
        <p className="text-muted" style={{ padding: '20px 0', textAlign: 'center' }}>No courses in this category.</p>
      ) : (
        <div className="grid-wrapper">
          <div className="grid-header">
            <span className="grid-cell course">Course</span>
            <span className="grid-cell dist">Dist</span>
            <span className="grid-cell time">Projected</span>
            <span className="grid-cell pace">Pace</span>
            <span className="grid-cell rank">Your Rank</span>
            <span className="grid-cell relev-desktop">Match</span>
            <span className="grid-cell diff">Diff</span>
            <span className="grid-cell adj">vs Pace</span>
            <span className="grid-cell winner">Winners</span>
          </div>

          <div className="grid-body">
            {sorted.slice(0, 50).map((p, i) => (
              <GridRow key={p.courseId} p={p} onSelect={onSelect} style={{ animationDelay: `${i * 20}ms` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default MarathonGrid;
