const standardDistances = [
  { id: '5k', name: '5K', distanceKm: 5 },
  { id: '10k', name: '10K', distanceKm: 10 },
  { id: '15k', name: '15K', distanceKm: 15 },
  { id: '20k', name: '20K', distanceKm: 20 },
  { id: 'half', name: 'Half Marathon', distanceKm: 21.0975 },
  { id: '25k', name: '25K', distanceKm: 25 },
  { id: '30k', name: '30K', distanceKm: 30 },
  { id: 'marathon', name: 'Marathon', distanceKm: 42.195 },
  { id: '50k', name: '50K (Ultra)', distanceKm: 50 },
  { id: '50mi', name: '50 Miles', distanceKm: 80.467 },
  { id: '100k', name: '100K', distanceKm: 100 },
  { id: '100mi', name: '100 Miles', distanceKm: 160.934 },
  { id: '250k', name: '250K (Multi-stage)', distanceKm: 250 },
];

const bqStandards = {
  male: {
    34: 10800, 39: 11100, 44: 11400, 49: 12000,
    54: 12300, 59: 12900, 64: 13500, 69: 14100,
    74: 15000, 79: 15900, 99: 16800,
  },
  female: {
    34: 12600, 39: 12900, 44: 13200, 49: 13800,
    54: 14100, 59: 14700, 64: 15300, 69: 15900,
    74: 16800, 79: 17700, 99: 18600,
  },
};

function getBQStandard(age, gender) {
  const standards = bqStandards[gender] || bqStandards.male;
  const ages = Object.keys(standards).map(Number).sort((a, b) => a - b);
  for (const ageLimit of ages) {
    if (age <= ageLimit) return standards[ageLimit];
  }
  return standards[ages[ages.length - 1]];
}

function tDisplay(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.round(s % 60);
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

function checkBQ(projectedTimeSec, age, gender) {
  if (!age || !gender) return null;
  const bqTime = getBQStandard(age, gender);
  const buffer = bqTime - projectedTimeSec;
  return {
    qualifies: buffer >= 0,
    bqTime,
    bqTimeDisplay: tDisplay(bqTime),
    bufferSec: buffer,
    bufferDisplay: buffer >= 0
      ? `${Math.floor(buffer / 60)}m ${Math.round(buffer % 60)}s under`
      : `${Math.floor(Math.abs(buffer) / 60)}m ${Math.round(Math.abs(buffer) % 60)}s over`,
  };
}

export { standardDistances, getBQStandard, checkBQ };
