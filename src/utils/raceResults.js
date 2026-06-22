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

function timeToSec(h, m, s) {
  return h * 3600 + m * 60 + s;
}

function timeStrToSec(t) {
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60 + parts[1];
  return parts[0];
}

const courses = {
  marathon: {
    berlin: {
      year: 2025, mu: 9.62, sigma: 0.38, finishers: 54280,
      winnerMen: { name: 'Sabastian Sawe', country: 'KEN', timeSec: timeToSec(2,2,16) },
      winnerWomen: { name: 'Rosemary Wanjiru', country: 'KEN', timeSec: timeToSec(2,21,5) },
    },
    london: {
      year: 2026, mu: 9.64, sigma: 0.40, finishers: 53259,
      winnerMen: { name: 'Sabastian Sawe', country: 'KEN', timeSec: timeToSec(1,59,30) },
      winnerWomen: { name: 'Tigst Assefa', country: 'ETH', timeSec: timeToSec(2,15,41) },
    },
    boston: {
      year: 2026, mu: 9.72, sigma: 0.42, finishers: 26169,
      winnerMen: { name: 'John Korir', country: 'KEN', timeSec: timeToSec(2,1,52) },
      winnerWomen: { name: 'Sharon Lokedi', country: 'KEN', timeSec: timeToSec(2,18,51) },
    },
    chicago: {
      year: 2025, mu: 9.60, sigma: 0.38, finishers: 47869,
      winnerMen: { name: 'Jacob Kiplimo', country: 'UGA', timeSec: timeToSec(2,2,23) },
      winnerWomen: { name: 'Hawi Feysa', country: 'ETH', timeSec: timeToSec(2,14,56) },
    },
    nyc: {
      year: 2025, mu: 9.75, sigma: 0.40, finishers: 52966,
      winnerMen: { name: 'Benson Kipruto', country: 'KEN', timeSec: timeToSec(2,8,9) },
      winnerWomen: { name: 'Hellen Obiri', country: 'KEN', timeSec: timeToSec(2,19,51) },
    },
    tokyo: {
      year: 2026, mu: 9.65, sigma: 0.39, finishers: 37595,
      winnerMen: { name: 'Tadese Takele', country: 'ETH', timeSec: timeToSec(2,3,37) },
      winnerWomen: { name: 'Brigid Kosgei', country: 'KEN', timeSec: timeToSec(2,14,29) },
    },
    bigsur: {
      year: 2025, mu: 9.85, sigma: 0.35, finishers: 4515,
      winnerMen: { name: 'Zachary Stetler', country: 'USA', timeSec: timeToSec(2,24,9) },
      winnerWomen: { name: 'Samantha Bleich', country: 'USA', timeSec: timeToSec(2,53,40) },
    },
    paris: {
      year: 2025, mu: 9.66, sigma: 0.40, finishers: 54099,
      winnerMen: { name: 'Benard Biwott', country: 'KEN', timeSec: timeToSec(2,5,25) },
      winnerWomen: { name: 'Bedatu Hirpa', country: 'ETH', timeSec: timeToSec(2,20,45) },
    },
    amsterdam: {
      year: 2025, mu: 9.63, sigma: 0.38, finishers: 21343,
      winnerMen: { name: 'Geofry Toroitich Kipchumba', country: 'KEN', timeSec: timeToSec(2,3,30) },
      winnerWomen: { name: 'Aynalem Desta', country: 'ETH', timeSec: timeToSec(2,17,37) },
    },
    rome: {
      year: 2025, mu: 9.74, sigma: 0.38, finishers: 19943,
      winnerMen: { name: 'Robert Ngeno', country: 'KEN', timeSec: timeToSec(2,7,35) },
      winnerWomen: { name: 'Betty Chepkwony', country: 'KEN', timeSec: timeToSec(2,26,16) },
    },
    valencia: {
      year: 2025, mu: 9.58, sigma: 0.37, finishers: 32751,
      winnerMen: { name: 'John Korir', country: 'KEN', timeSec: timeToSec(2,2,24) },
      winnerWomen: { name: 'Joyciline Jepkosgei', country: 'KEN', timeSec: timeToSec(2,14,0) },
    },
    prague: {
      year: 2025, mu: 9.71, sigma: 0.38, finishers: 17073,
      winnerMen: { name: 'Lemi Berhanu Hayle', country: 'ETH', timeSec: timeToSec(2,5,14) },
      winnerWomen: { name: 'Bertukan Welde', country: 'ETH', timeSec: timeToSec(2,20,55) },
    },
    'marina-bay': {
      year: 2025, mu: 9.76, sigma: 0.38, finishers: 15424,
      winnerMen: { name: 'Nicholas Kipkemboi', country: 'KEN', timeSec: timeToSec(2,14,59) },
      winnerWomen: { name: 'Jackline Chepngeno', country: 'KEN', timeSec: timeToSec(2,38,49) },
    },
    vienna: {
      year: 2025, mu: 9.72, sigma: 0.37, finishers: 10806,
      winnerMen: { name: 'Geoffrey Yator', country: 'KEN', timeSec: timeToSec(2,8,28) },
      winnerWomen: { name: 'Vibian Chepkirui', country: 'KEN', timeSec: timeToSec(2,27,11) },
    },
    copenhagen: {
      year: 2025, mu: 9.70, sigma: 0.37, finishers: 17590,
      winnerMen: { name: 'Vincent Mutai', country: 'KEN', timeSec: timeToSec(2,9,9) },
      winnerWomen: { name: 'Sharon Kiptugen', country: 'KEN', timeSec: timeToSec(2,23,19) },
    },
    geneva: {
      year: 2025, mu: 9.78, sigma: 0.36, finishers: 8565,
      winnerMen: { name: 'Edwin Kipngetich', country: 'KEN', timeSec: timeToSec(2,12,51) },
      winnerWomen: { name: 'Ruth Cherotich', country: 'KEN', timeSec: timeToSec(2,30,4) },
    },
    barcelona: {
      year: 2025, mu: 9.73, sigma: 0.38, finishers: 19119,
      winnerMen: { name: 'Tesfaye Deriba', country: 'ETH', timeSec: timeToSec(2,4,13) },
      winnerWomen: { name: 'Sharon Chelimo', country: 'KEN', timeSec: timeToSec(2,19,33) },
    },
    dublin: {
      year: 2025, mu: 9.72, sigma: 0.37, finishers: 22261,
      winnerMen: { name: 'Moses Kemei', country: 'KEN', timeSec: timeToSec(2,8,41) },
      winnerWomen: { name: 'Chelagat Abere', country: 'ETH', timeSec: timeToSec(2,26,25) },
    },
    marrakech: {
      year: 2025, mu: 9.75, sigma: 0.36, finishers: 8562,
      winnerMen: { name: 'Edwin Kiprop', country: 'KEN', timeSec: timeToSec(2,11,15) },
      winnerWomen: { name: 'Mentwab Tefera', country: 'ETH', timeSec: timeToSec(2,32,48) },
    },
    reykjavik: {
      year: 2025, mu: 9.80, sigma: 0.35, finishers: 3804,
      winnerMen: { name: 'Kyle Cuerrieri', country: 'CAN', timeSec: timeToSec(2,22,39) },
      winnerWomen: { name: 'Anna Karlsdottir', country: 'ISL', timeSec: timeToSec(2,52,45) },
    },
    greek: {
      year: 2025, mu: 9.78, sigma: 0.40, finishers: 18913,
      winnerMen: { name: 'Kassahun Dinku', country: 'ETH', timeSec: timeToSec(2,10,48) },
      winnerWomen: { name: 'Nancy Kiprop', country: 'KEN', timeSec: timeToSec(2,36,52) },
    },
  },
  half: {
    'berlin-half': {
      year: 2025, mu: 8.82, sigma: 0.38, finishers: 36291,
      winnerMen: { name: 'Jimmy Gressier', country: 'FRA', timeSec: timeToSec(0,59,0) },
      winnerWomen: { name: 'Melat Kejeta', country: 'GER', timeSec: timeToSec(1,7,0) },
    },
    'boston-half': {
      year: 2025, mu: 8.88, sigma: 0.38, finishers: 9316,
      winnerMen: { name: 'Abbott Kiplagat', country: 'KEN', timeSec: timeToSec(1,0,55) },
      winnerWomen: { name: 'Edna Chepkemoi', country: 'KEN', timeSec: timeToSec(1,12,10) },
    },
    'nyc-half': {
      year: 2025, mu: 8.86, sigma: 0.39, finishers: 24736,
      winnerMen: { name: 'Abdi Nageeye', country: 'NED', timeSec: timeToSec(1,0,1) },
      winnerWomen: { name: 'Sifan Hassan', country: 'NED', timeSec: timeToSec(1,7,15) },
    },
    'lisbon-half': {
      year: 2025, mu: 8.80, sigma: 0.37, finishers: 13187,
      winnerMen: { name: 'Andamlak Bilih', country: 'ETH', timeSec: timeToSec(0,58,56) },
      winnerWomen: { name: 'Tsigie Gebreselama', country: 'ETH', timeSec: timeToSec(1,5,30) },
    },
    'prague-half': {
      year: 2025, mu: 8.85, sigma: 0.37, finishers: 9815,
      winnerMen: { name: 'Tsegay Misgina', country: 'ETH', timeSec: timeToSec(1,0,2) },
      winnerWomen: { name: 'Catherine Reline Amanang\'ole', country: 'KEN', timeSec: timeToSec(1,9,10) },
    },
    'valencia-half': {
      year: 2025, mu: 8.78, sigma: 0.36, finishers: 13240,
      winnerMen: { name: 'Yomif Kejelcha', country: 'ETH', timeSec: timeToSec(0,58,27) },
      winnerWomen: { name: 'Tsigie Gebreselama', country: 'ETH', timeSec: timeToSec(1,5,15) },
    },
    'golden-gate-half': {
      year: 2025, mu: 8.94, sigma: 0.35, finishers: 5650,
      winnerMen: { name: 'Sammy Fell', country: 'USA', timeSec: timeToSec(1,4,10) },
      winnerWomen: { name: 'Molly Seidel', country: 'USA', timeSec: timeToSec(1,14,30) },
    },
  },
  ultra: {
    'comrades-down': {
      year: 2025, mu: 10.58, sigma: 0.30, finishers: 16124,
      winnerMen: { name: 'Piet Wiersma', country: 'RSA', timeSec: timeToSec(5,20,17) },
      winnerWomen: { name: 'Caitriona Jennings', country: 'IRL', timeSec: timeToSec(5,55,0) },
    },
    'comrades-up': {
      year: 2025, mu: 10.64, sigma: 0.30, finishers: 15208,
      winnerMen: { name: 'Dan Carlsson', country: 'SWE', timeSec: timeToSec(5,23,24) },
      winnerWomen: { name: 'Caitriona Jennings', country: 'IRL', timeSec: timeToSec(5,58,10) },
    },
    'two-oceans': {
      year: 2025, mu: 10.12, sigma: 0.32, finishers: 11312,
      winnerMen: { name: 'Lungile Gongqa', country: 'RSA', timeSec: timeToSec(3,11,5) },
      winnerWomen: { name: 'Gerda Steyn', country: 'RSA', timeSec: timeToSec(3,35,42) },
    },
    ccc: {
      year: 2025, mu: 10.77, sigma: 0.35, finishers: 2923,
      winnerMen: { name: 'Petter Engdahl', country: 'SWE', timeSec: timeToSec(9,36,12) },
      winnerWomen: { name: 'Toni McCann', country: 'IRL', timeSec: timeToSec(10,57,6) },
    },
    utmb: {
      year: 2025, mu: 11.37, sigma: 0.33, finishers: 2760,
      winnerMen: { name: 'Kilian Jornet', country: 'ESP', timeSec: timeToSec(19,43,14) },
      winnerWomen: { name: 'Katie Schide', country: 'USA', timeSec: timeToSec(23,15,12) },
    },
    'western-states': {
      year: 2025, mu: 11.15, sigma: 0.30, finishers: 386,
      winnerMen: { name: 'Chris Kelly', country: 'USA', timeSec: timeToSec(14,28,21) },
      winnerWomen: { name: 'Abby Hall', country: 'USA', timeSec: timeToSec(16,37,16) },
    },
    leadville: {
      year: 2025, mu: 11.22, sigma: 0.30, finishers: 624,
      winnerMen: { name: 'Austin Gann', country: 'USA', timeSec: timeToSec(6,12,0) },
      winnerWomen: { name: 'Rachel Drake', country: 'USA', timeSec: timeToSec(7,45,0) },
    },
    tarawera: {
      year: 2025, mu: 10.59, sigma: 0.33, finishers: 1782,
      winnerMen: { name: 'Devon Portmann', country: 'NZL', timeSec: timeToSec(7,48,12) },
      winnerWomen: { name: 'Ruth Croft', country: 'NZL', timeSec: timeToSec(8,44,0) },
    },
    'marathon-des-sables': {
      year: 2025, mu: 11.50, sigma: 0.28, finishers: 1287,
      winnerMen: { name: 'Rachid El Morabity', country: 'MAR', timeSec: timeToSec(20,28,0) },
      winnerWomen: { name: 'Aziza El Amrany', country: 'MAR', timeSec: timeToSec(25,15,0) },
    },
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

  const raw = logNormalCDF(projectedTimeSec, c.mu, c.sigma);
  const percentile = Math.min(0.99999, raw);
  const position = Math.max(1, Math.round(percentile * c.finishers));
  const outOf = c.finishers;

  return {
    position,
    totalFinishers: outOf,
    topPct: (position / outOf) * 100,
    percentile: percentile * 100,
    winnerName: c.winnerMen.name,
    winnerTimeSec: c.winnerMen.timeSec,
    winnerWomenName: c.winnerWomen.name,
    winnerWomenTimeSec: c.winnerWomen.timeSec,
  };
}
