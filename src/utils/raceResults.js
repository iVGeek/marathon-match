const courseResults = {
  berlin:       { year: 2025, winnerTimeSec: 11940, finishers: 54280, winnerName: 'Milkesa Mengesha', menField: 35920, womenField: 18360 },
  boston:       { year: 2025, winnerTimeSec: 12492, finishers: 26169, winnerName: 'John Korir', menField: 14760, womenField: 11409 },
  london:       { year: 2025, winnerTimeSec: 11885, finishers: 53259, winnerName: 'Sabastian Sawe', menField: 33128, womenField: 20131 },
  chicago:      { year: 2025, winnerTimeSec: 12207, finishers: 47869, winnerName: 'John Korir', menField: 26152, womenField: 21717 },
  nyc:          { year: 2025, winnerTimeSec: 12934, finishers: 52966, winnerName: 'Abdi Nageeye', menField: 30314, womenField: 22652 },
  tokyo:        { year: 2025, winnerTimeSec: 11972, finishers: 37595, winnerName: 'Tadese Takele', menField: 27543, womenField: 10052 },
  bigsur:       { year: 2024, winnerTimeSec: 16592, finishers: 4515, winnerName: 'Zachary Stetler', menField: 2409, womenField: 2106 },
  paris:        { year: 2025, winnerTimeSec: 12138, finishers: 54099, winnerName: 'Enock Onchari', menField: 38798, womenField: 15301 },
  amsterdam:    { year: 2024, winnerTimeSec: 12239, finishers: 21343, winnerName: 'Tsegaye Getachew', menField: 17346, womenField: 3997 },
  rome:         { year: 2025, winnerTimeSec: 12765, finishers: 19943, winnerName: 'Adel Beri', menField: 15397, womenField: 4546 },
  valencia:     { year: 2025, winnerTimeSec: 11799, finishers: 32751, winnerName: 'Jacob Kiplimo', menField: 27981, womenField: 4770 },
  prague:       { year: 2025, winnerTimeSec: 12537, finishers: 17073, winnerName: 'Geofry Toroitich', menField: 13658, womenField: 3415 },
  'marina-bay': { year: 2024, winnerTimeSec: 13194, finishers: 15424, winnerName: 'Geoffrey Yegon', menField: 11568, womenField: 3856 },
  vienna:       { year: 2024, winnerTimeSec: 12536, finishers: 10806, winnerName: 'Hezron Mwangeka', menField: 9008, womenField: 1798 },
  copenhagen:   { year: 2024, winnerTimeSec: 12682, finishers: 17590, winnerName: 'Kelvin Kibet', menField: 12753, womenField: 4837 },
  geneva:       { year: 2024, winnerTimeSec: 13563, finishers: 8565, winnerName: 'Edwin Kipngetich', menField: 6889, womenField: 1676 },
  barcelona:    { year: 2025, winnerTimeSec: 12768, finishers: 19119, winnerName: 'Mukisa Kimutai', menField: 15271, womenField: 3848 },
  dublin:       { year: 2024, winnerTimeSec: 13098, finishers: 22261, winnerName: 'Simon Grønberge', menField: 15533, womenField: 6728 },
  marrakech:    { year: 2024, winnerTimeSec: 13185, finishers: 8562, winnerName: 'Berhanu Bekele', menField: 6943, womenField: 1619 },
  reykjavik:    { year: 2024, winnerTimeSec: 13715, finishers: 3804, winnerName: 'Donald Kibet', menField: 2712, womenField: 1092 },
  greek:        { year: 2024, winnerTimeSec: 12960, finishers: 18913, winnerName: 'Fikiru Merga', menField: 15029, womenField: 3884 },
  'berlin-half':   { year: 2025, winnerTimeSec: 3540, finishers: 36291, winnerName: 'Jimmy Gressier', menField: 23069, womenField: 13222 },
  'boston-half':   { year: 2024, winnerTimeSec: 3655, finishers: 9316, winnerName: 'Abbott Kiplagat', menField: 5002, womenField: 4314 },
  'nyc-half':      { year: 2025, winnerTimeSec: 3601, finishers: 24736, winnerName: 'Abdi Nageeye', menField: 12264, womenField: 12472 },
  'lisbon-half':   { year: 2024, winnerTimeSec: 3536, finishers: 13187, winnerName: 'Andamlak Bilih', menField: 9765, womenField: 3422 },
  'prague-half':   { year: 2024, winnerTimeSec: 3602, finishers: 9815, winnerName: 'Tsegay Misgina', menField: 7034, womenField: 2781 },
  'valencia-half': { year: 2024, winnerTimeSec: 3507, finishers: 13240, winnerName: 'Yomif Kejelcha', menField: 10963, womenField: 2277 },
  'golden-gate-half': { year: 2024, winnerTimeSec: 3850, finishers: 5650, winnerName: 'Sammy Fell', menField: 2825, womenField: 2825 },
  'comrades-down': { year: 2024, winnerTimeSec: 31290, finishers: 16124, winnerName: 'Piet Wiersma', menField: 12899, womenField: 3225 },
  'comrades-up':   { year: 2025, winnerTimeSec: 32611, finishers: 15208, winnerName: 'Dan Carlsson', menField: 12166, womenField: 3042 },
  'two-oceans':    { year: 2025, winnerTimeSec: 19265, finishers: 11312, winnerName: 'Lungile Gongqa', menField: 7921, womenField: 3391 },
  ccc:             { year: 2024, winnerTimeSec: 35140, finishers: 2923, winnerName: 'Danny van der Kleij', menField: 2270, womenField: 653 },
  utmb:            { year: 2025, winnerTimeSec: 71000, finishers: 2760, winnerName: 'Kilian Jornet', menField: 2210, womenField: 550 },
  'western-states': { year: 2024, winnerTimeSec: 52101, finishers: 386, winnerName: 'Chris Kelly', menField: 297, womenField: 89 },
  leadville:       { year: 2025, winnerTimeSec: 56320, finishers: 624, winnerName: 'Austin Gann', menField: 502, womenField: 122 },
  tarawera:        { year: 2025, winnerTimeSec: 30708, finishers: 1782, winnerName: 'Devon Portmann', menField: 1212, womenField: 570 },
  'marathon-des-sables': { year: 2024, winnerTimeSec: 80640, finishers: 1287, winnerName: 'Rachid El Morabity', menField: 1094, womenField: 193 },
};

export function getResults(courseId) {
  return courseResults[courseId] || null;
}

export function estimateRank(projectedTimeSec, courseId) {
  const results = courseResults[courseId];
  if (!results || !projectedTimeSec) return null;
  const fasterFraction = Math.max(0, Math.min(1, 1 - (projectedTimeSec - results.winnerTimeSec) / (results.finishers * 0.1)));
  const estimatedPosition = Math.round(results.finishers * fasterFraction);
  return {
    position: Math.max(1, estimatedPosition),
    totalFinishers: results.finishers,
    topPct: ((Math.max(1, estimatedPosition) / results.finishers) * 100).toFixed(1),
    winnerName: results.winnerName,
    winnerTimeSec: results.winnerTimeSec,
  };
}
