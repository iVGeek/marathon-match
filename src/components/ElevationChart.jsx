import { getProfile } from '../utils/elevations';

export default function ElevationChart({ courseId, distanceKm, color }) {
  const profile = getProfile(courseId);
  if (!profile) return null;

  const pts = profile.points;
  const width = 600;
  const height = 120;
  const padding = { top: 15, right: 15, bottom: 20, left: 40 };

  const minElev = Math.min(...pts.map(p => p[1])) - 10;
  const maxElev = Math.max(...pts.map(p => p[1])) + 10;
  const elevRange = maxElev - minElev || 1;

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const pointStr = pts.map(([km, elev]) => {
    const x = padding.left + (km / distanceKm) * chartW;
    const y = padding.top + ((maxElev - elev) / elevRange) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const fillStr = pointStr + ` ${padding.left + chartW},${padding.top + chartH} ${padding.left},${padding.top + chartH}`;

  const yTicks = 4;
  const yTicksArr = Array.from({ length: yTicks + 1 }, (_, i) => {
    const elev = minElev + (elevRange * i) / yTicks;
    const y = padding.top + ((maxElev - elev) / elevRange) * chartH;
    return { y, label: Math.round(elev) };
  });

  const landmarks = profile.landmarks || [];

  return (
    <div className="elevation-chart">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <linearGradient id={`grad-${courseId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {yTicksArr.map((t, i) => (
          <line key={i} x1={padding.left} y1={t.y} x2={padding.left + chartW} y2={t.y} stroke="#2a2d3a" strokeWidth="1" />
        ))}

        <polygon points={fillStr} fill={`url(#grad-${courseId})`} />

        <polyline points={pointStr} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {yTicksArr.map((t, i) => (
          <text key={i} x={padding.left - 6} y={t.y + 4} textAnchor="end" fill="#8b8fa3" fontSize="10">
            {t.label}m
          </text>
        ))}

        <text x={padding.left} y={height - 2} textAnchor="start" fill="#8b8fa3" fontSize="10">0</text>
        <text x={padding.left + chartW} y={height - 2} textAnchor="end" fill="#8b8fa3" fontSize="10">{distanceKm}km</text>

        {landmarks.map(([km, name], i) => {
          const x = padding.left + (km / distanceKm) * chartW;
          return (
            <g key={i}>
              <line x1={x} y1={padding.top} x2={x} y2={padding.top + chartH} stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
              <text x={x} y={padding.top - 4} textAnchor="middle" fill={color} fontSize="9" fontWeight="600">
                {name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
