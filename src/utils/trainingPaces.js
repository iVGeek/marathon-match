const VDOT_TABLES = [
  { vdot: 30, easy: 380, marathon: 325, threshold: 295, interval: 272, rep: 250 },
  { vdot: 32, easy: 365, marathon: 312, threshold: 284, interval: 262, rep: 240 },
  { vdot: 34, easy: 352, marathon: 300, threshold: 273, interval: 252, rep: 231 },
  { vdot: 36, easy: 339, marathon: 289, threshold: 264, interval: 244, rep: 223 },
  { vdot: 38, easy: 328, marathon: 279, threshold: 255, interval: 236, rep: 215 },
  { vdot: 40, easy: 317, marathon: 270, threshold: 247, interval: 228, rep: 208 },
  { vdot: 42, easy: 307, marathon: 261, threshold: 240, interval: 221, rep: 202 },
  { vdot: 44, easy: 298, marathon: 253, threshold: 233, interval: 215, rep: 196 },
  { vdot: 46, easy: 289, marathon: 246, threshold: 226, interval: 209, rep: 190 },
  { vdot: 48, easy: 281, marathon: 239, threshold: 220, interval: 203, rep: 185 },
  { vdot: 50, easy: 274, marathon: 232, threshold: 214, interval: 198, rep: 180 },
  { vdot: 52, easy: 267, marathon: 226, threshold: 209, interval: 193, rep: 175 },
  { vdot: 54, easy: 260, marathon: 221, threshold: 204, interval: 188, rep: 171 },
  { vdot: 56, easy: 254, marathon: 215, threshold: 199, interval: 184, rep: 167 },
  { vdot: 58, easy: 248, marathon: 210, threshold: 194, interval: 180, rep: 163 },
  { vdot: 60, easy: 243, marathon: 206, threshold: 190, interval: 176, rep: 159 },
  { vdot: 62, easy: 238, marathon: 201, threshold: 186, interval: 172, rep: 156 },
  { vdot: 64, easy: 233, marathon: 197, threshold: 182, interval: 168, rep: 153 },
  { vdot: 66, easy: 228, marathon: 193, threshold: 179, interval: 165, rep: 150 },
  { vdot: 68, easy: 224, marathon: 190, threshold: 175, interval: 162, rep: 147 },
  { vdot: 70, easy: 220, marathon: 186, threshold: 172, interval: 159, rep: 144 },
  { vdot: 72, easy: 216, marathon: 183, threshold: 169, interval: 156, rep: 141 },
  { vdot: 74, easy: 212, marathon: 180, threshold: 166, interval: 153, rep: 139 },
  { vdot: 76, easy: 209, marathon: 177, threshold: 163, interval: 151, rep: 136 },
  { vdot: 78, easy: 205, marathon: 174, threshold: 161, interval: 148, rep: 134 },
  { vdot: 80, easy: 202, marathon: 171, threshold: 158, interval: 146, rep: 132 },
  { vdot: 82, easy: 199, marathon: 169, threshold: 156, interval: 144, rep: 130 },
  { vdot: 84, easy: 196, marathon: 166, threshold: 153, interval: 142, rep: 128 },
  { vdot: 85, easy: 194, marathon: 165, threshold: 152, interval: 140, rep: 127 },
];

function estimateVDOT(distanceKm, timeSec) {
  const pace = timeSec / distanceKm;
  let best = VDOT_TABLES[0];
  let minDiff = Infinity;
  for (const entry of VDOT_TABLES) {
    const diff = Math.abs(entry.marathon - pace);
    if (diff < minDiff) {
      minDiff = diff;
      best = entry;
    }
  }
  return best;
}

function paceDisplay(secPerKm) {
  if (!secPerKm || !isFinite(secPerKm)) return '--:-- /km';
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')} /km`;
}

export function computeTrainingPaces(distanceKm, timeSec) {
  const pace = timeSec / distanceKm;
  const vdotEntry = estimateVDOT(distanceKm, timeSec);
  const factor = pace / vdotEntry.marathon;
  return {
    vdot: vdotEntry.vdot,
    zones: [
      { key: 'easy', name: 'Easy / Recovery', paceSec: vdotEntry.easy * factor, pct: '65-79%', feel: 'Conversational' },
      { key: 'marathon', name: 'Marathon Pace', paceSec: vdotEntry.marathon * factor, pct: '80-87%', feel: 'Comfortably hard' },
      { key: 'threshold', name: 'Threshold / Tempo', paceSec: vdotEntry.threshold * factor, pct: '88-92%', feel: 'Hard but sustainable' },
      { key: 'interval', name: 'Interval (VO2max)', paceSec: vdotEntry.interval * factor, pct: '95-100%', feel: 'Very hard, 5-8 min' },
      { key: 'rep', name: 'Repetition (Speed)', paceSec: vdotEntry.rep * factor, pct: '105%+', feel: 'Sprinting, 400-800m' },
    ].map(z => ({ ...z, paceDisplay: paceDisplay(z.paceSec) })),
    inputPace: paceDisplay(pace),
    inputPaceSec: pace,
  };
}
