function ln(x) { return Math.log(x); }

function phi(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function logNormalCDF(x, mu, sigma) {
  if (x <= 0) return 0;
  return phi((ln(x) - mu) / sigma);
}

const courses = {
  marathon: {
    berlin:   { year: 2025, mu: 9.62, sigma: 0.38, finishers: 54280, winnerName: 'Milkesa Mengesha', winnerTimeSec: 11940 },
    london:   { year: 2025, mu: 9.64, sigma: 0.40, finishers: 53259, winnerName: 'Sabastian Sawe', winnerTimeSec: 11885 },
    boston:   { year: 2025, mu: 9.72, sigma: 0.42, finishers: 26169, winnerName: 'John Korir', winnerTimeSec: 12492 },
    chicago:  { year: 2025, mu: 9.60, sigma: 0.38, finishers: 47869, winnerName: 'John Korir', winnerTimeSec: 12207 },
    nyc:      { year: 2025, mu: 9.75, sigma: 0.40, finishers: 52966, winnerName: 'Abdi Nageeye', winnerTimeSec: 12934 },
    tokyo:    { year: 2025, mu: 9.65, sigma: 0.39, finishers: 37595, winnerName: 'Tadese Takele', winnerTimeSec: 11972 },
    bigsur:   { year: 2024, mu: 9.85, sigma: 0.35, finishers: 4515, winnerName: 'Zachary Stetler', winnerTimeSec: 16592 },
    paris:    { year: 2025, mu: 9.66, sigma: 0.40, finishers: 54099, winnerName: 'Enock Onchari', winnerTimeSec: 12138 },
    amsterdam:{ year: 2024, mu: 9.63, sigma: 0.38, finishers: 21343, winnerName: 'Tsegaye Getachew', winnerTimeSec: 12239 },
    rome:     { year: 2025, mu: 9.74, sigma: 0.38, finishers: 19943, winnerName: 'Adel Beri', winnerTimeSec: 12765 },
    valencia: { year: 2025, mu: 9.58, sigma: 0.37, finishers: 32751, winnerName: 'Jacob Kiplimo', winnerTimeSec: 11799 },
    prague:   { year: 2025, mu: 9.71, sigma: 0.38, finishers: 17073, winnerName: 'Geofry Toroitich', winnerTimeSec: 12537 },
    'marina-bay': { year: 2024, mu: 9.76, sigma: 0.38, finishers: 15424, winnerName: 'Geoffrey Yegon', winnerTimeSec: 13194 },
    vienna:   { year: 2024, mu: 9.72, sigma: 0.37, finishers: 10806, winnerName: 'Hezron Mwangeka', winnerTimeSec: 12536 },
    copenhagen:{ year: 2024, mu: 9.70, sigma: 0.37, finishers: 17590, winnerName: 'Kelvin Kibet', winnerTimeSec: 12682 },
    geneva:   { year: 2024, mu: 9.78, sigma: 0.36, finishers: 8565, winnerName: 'Edwin Kipngetich', winnerTimeSec: 13563 },
    barcelona:{ year: 2025, mu: 9.73, sigma: 0.38, finishers: 19119, winnerName: 'Mukisa Kimutai', winnerTimeSec: 12768 },
    dublin:   { year: 2024, mu: 9.72, sigma: 0.37, finishers: 22261, winnerName: 'Simon Grønberge', winnerTimeSec: 13098 },
    marrakech:{ year: 2024, mu: 9.75, sigma: 0.36, finishers: 8562, winnerName: 'Berhanu Bekele', winnerTimeSec: 13185 },
    reykjavik:{ year: 2024, mu: 9.80, sigma: 0.35, finishers: 3804, winnerName: 'Donald Kibet', winnerTimeSec: 13715 },
    greek:    { year: 2024, mu: 9.78, sigma: 0.40, finishers: 18913, winnerName: 'Fikiru Merga', winnerTimeSec: 12960 },
  },
  half: {
    'berlin-half':   { year: 2025, mu: 8.82, sigma: 0.38, finishers: 36291, winnerName: 'Jimmy Gressier', winnerTimeSec: 3540 },
    'boston-half':   { year: 2024, mu: 8.88, sigma: 0.38, finishers: 9316, winnerName: 'Abbott Kiplagat', winnerTimeSec: 3655 },
    'nyc-half':      { year: 2025, mu: 8.86, sigma: 0.39, finishers: 24736, winnerName: 'Abdi Nageeye', winnerTimeSec: 3601 },
    'lisbon-half':   { year: 2024, mu: 8.80, sigma: 0.37, finishers: 13187, winnerName: 'Andamlak Bilih', winnerTimeSec: 3536 },
    'prague-half':   { year: 2024, mu: 8.85, sigma: 0.37, finishers: 9815, winnerName: 'Tsegay Misgina', winnerTimeSec: 3602 },
    'valencia-half': { year: 2024, mu: 8.78, sigma: 0.36, finishers: 13240, winnerName: 'Yomif Kejelcha', winnerTimeSec: 3507 },
    'golden-gate-half': { year: 2024, mu: 8.94, sigma: 0.35, finishers: 5650, winnerName: 'Sammy Fell', winnerTimeSec: 3850 },
  },
  ultra: {
    'comrades-down':   { year: 2024, mu: 10.58, sigma: 0.30, finishers: 16124, winnerName: 'Piet Wiersma', winnerTimeSec: 31290 },
    'comrades-up':     { year: 2025, mu: 10.64, sigma: 0.30, finishers: 15208, winnerName: 'Dan Carlsson', winnerTimeSec: 32611 },
    'two-oceans':      { year: 2025, mu: 10.12, sigma: 0.32, finishers: 11312, winnerName: 'Lungile Gongqa', winnerTimeSec: 19265 },
    ccc:               { year: 2024, mu: 10.77, sigma: 0.35, finishers: 2923, winnerName: 'Danny van der Kleij', winnerTimeSec: 35140 },
    utmb:              { year: 2025, mu: 11.37, sigma: 0.33, finishers: 2760, winnerName: 'Kilian Jornet', winnerTimeSec: 71000 },
    'western-states':  { year: 2024, mu: 11.15, sigma: 0.30, finishers: 386, winnerName: 'Chris Kelly', winnerTimeSec: 52101 },
    leadville:         { year: 2025, mu: 11.22, sigma: 0.30, finishers: 624, winnerName: 'Austin Gann', winnerTimeSec: 56320 },
    tarawera:          { year: 2025, mu: 10.59, sigma: 0.33, finishers: 1782, winnerName: 'Devon Portmann', winnerTimeSec: 30708 },
    'marathon-des-sables': { year: 2024, mu: 11.50, sigma: 0.28, finishers: 1287, winnerName: 'Rachid El Morabity', winnerTimeSec: 80640 },
  },
};

const byId = {};
for (const cat of [courses.marathon, courses.half, courses.ultra]) {
  for (const [id, data] of Object.entries(cat)) {
    byId[id] = data;
  }
}

export function getResults(courseId) {
  return byId[courseId] || null;
}

export function estimateRank(projectedTimeSec, courseId) {
  const c = byId[courseId];
  if (!c || !projectedTimeSec) return null;

  const percentile = Math.min(0.999, logNormalCDF(projectedTimeSec, c.mu, c.sigma));
  const position = Math.max(1, Math.round(percentile * c.finishers));

  const total = c.finishers;
  const pct = ((position / total) * 100).toFixed(1);

  return {
    position,
    totalFinishers: total,
    topPct: pct,
    percentile: (percentile * 100).toFixed(1),
    winnerName: c.winnerName,
    winnerTimeSec: c.winnerTimeSec,
  };
}
