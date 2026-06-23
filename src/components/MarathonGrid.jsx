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
  return <span className={`mp-rel ${cls}`}>{label}</span>;
});

function formatRank(rank) {
  if (!rank) return null;
  if (rank.topPct <= 1) return { value: `#${rank.position}`, sub: 'ELITE' };
  if (rank.topPct <= 5) return { value: `Top ${rank.topPct.toFixed(1)}%`, sub: '' };
  return { value: `#${rank.position.toLocaleString()}`, sub: `/${rank.totalFinishers.toLocaleString()}` };
}

function rankTier(rank) {
  if (!rank) return 'none';
  if (rank.topPct <= 1) return 'elite';
  if (rank.topPct <= 5) return 'great';
  if (rank.topPct <= 15) return 'good';
  if (rank.topPct <= 30) return 'solid';
  return 'none';
}

const CourseCard = memo(function CourseCard({ p, onSelect }) {
  const rank = useMemo(() => estimateRank(p.projectedTimeSec, p.courseId), [p.projectedTimeSec, p.courseId]);
  const r = formatRank(rank);
  const tier = rankTier(rank);
  const paceRatio = p.projectedPaceSec / p.userPaceSec;
  const faster = paceRatio < 1;
  const pct = Math.abs((paceRatio - 1) * 100);
  const diffLabel = p.diffVsRun === 'Less' ? `${p.diffVsRunPct.toFixed(0)}% easier`
    : p.diffVsRun === 'More' ? `${p.diffVsRunPct.toFixed(0)}% harder` : 'Similar difficulty';
  const diffCls = p.diffVsRun === 'More' ? 'hard' : p.diffVsRun === 'Less' ? 'easy' : '';

  return (
    <button className={`mp-card ${tier}`} style={{ '--mp-color': p.color }} onClick={() => onSelect(p)}>
      <div className="mp-rank">
        <span className="mp-rank-num">{r?.value}</span>
        {r?.sub && <span className="mp-rank-sub">{r.sub}</span>}
      </div>
      <div className="mp-body">
        <div className="mp-top">
          <span className="mp-dot" />
          <span className="mp-name">{p.courseName}</span>
          {p.country && <img src={countryFlag(p.country)} alt="" className="mp-flag" onError={e => e.target.style.display = 'none'} />}
          <RelBadge relevance={p.relevance} />
        </div>
        <div className="mp-mid">
          <span className="mp-stat">{p.projectedTime}</span>
          <span className="mp-sep">·</span>
          <span className="mp-stat">{paceDisplay(p.projectedPaceSec)}</span>
          <span className="mp-sep">·</span>
          <span className={`mp-stat mp-diff ${diffCls}`}>{diffLabel}</span>
          <span className="mp-sep">·</span>
          <span className={`mp-stat ${faster ? 'green' : 'red'}`}>{faster ? `${pct.toFixed(1)}% faster` : `${pct.toFixed(1)}% slower`}</span>
        </div>
        {rank && (
          <div className="mp-bot">
            <span className="mp-winner">M {paceDisplay(rank.winnerTimeSec / p.distanceKm, true)}/km</span>
            <span className="mp-winner">F {paceDisplay(rank.winnerWomenTimeSec / p.distanceKm, true)}/km</span>
          </div>
        )}
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
    <div className="section">
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
        <div className="mp-list">
          {sorted.slice(0, 50).map(p => (
            <CourseCard key={p.courseId} p={p} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
});

export default MarathonGrid;
