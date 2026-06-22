import { paceDisplay } from './projections';

function analyzeSplits(splits, averageHR, maxHR) {
  if (!splits || splits.length === 0) return null;

  const valid = splits.filter(s => s.distance > 0 && s.moving_time > 0);

  const paces = valid.map(s => (s.moving_time / s.distance) * 1000).filter(p => isFinite(p));
  if (paces.length === 0) return null;
  const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;

  const gapSpeeds = valid.map(s => s.average_grade_adjusted_speed).filter(Boolean);
  const avgGAP = gapSpeeds.length > 0
    ? (gapSpeeds.reduce((a, b) => a + b, 0) / gapSpeeds.length)
    : null;

  const halfIdx = Math.floor(valid.length / 2);
  const firstHalf = paces.slice(0, halfIdx);
  const secondHalf = paces.slice(halfIdx);
  const firstAvg = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
  const secondAvg = secondHalf.length ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
  const paceFadePct = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  const variance = paces.reduce((sum, p) => sum + (p - avgPace) ** 2, 0) / paces.length;
  const cv = avgPace > 0 ? (Math.sqrt(variance) / avgPace) * 100 : 0;

  const hrSplits = valid.map(s => s.average_heartrate).filter(Boolean);
  const hrDrift = hrSplits.length > 1
    ? hrSplits[hrSplits.length - 1] - hrSplits[0]
    : null;
  const avgHrSplit = hrSplits.length ? hrSplits.reduce((a, b) => a + b, 0) / hrSplits.length : null;

  const cadences = valid.map(s => s.average_cadence).filter(Boolean);
  const avgCadence = cadences.length
    ? cadences.reduce((a, b) => a + b, 0) / cadences.length
    : null;

  const maxHRCalc = maxHR || (averageHR ? averageHR * 1.15 : null);
  const hrZoneBoundaries = maxHRCalc
    ? {
        zone2: Math.round(maxHRCalc * 0.7),
        zone3: Math.round(maxHRCalc * 0.8),
        zone4: Math.round(maxHRCalc * 0.88),
        zone5: Math.round(maxHRCalc * 0.94),
      }
    : null;

  const hrZones = {};
  if (hrZoneBoundaries && avgHrSplit) {
    hrZones.zone = avgHrSplit <= hrZoneBoundaries.zone2 ? 'Zone 2 (Easy)' :
      avgHrSplit <= hrZoneBoundaries.zone3 ? 'Zone 3 (Moderate)' :
      avgHrSplit <= hrZoneBoundaries.zone4 ? 'Zone 4 (Threshold)' :
      avgHrSplit <= hrZoneBoundaries.zone5 ? 'Zone 5 (VO2 Max)' : 'Zone 5+ (Max)';
    hrZones.pctMax = maxHRCalc > 0 ? Math.round((avgHrSplit / maxHRCalc) * 100) : null;
  }

  const gradeAdjs = valid.map(s => s.average_grade_adjusted_speed).filter(Boolean);
  const hasGAP = gradeAdjs.length === valid.length;

  return {
    splitCount: valid.length,
    totalDistance: valid.reduce((sum, s) => sum + s.distance, 0),
    avgPaceSec: avgPace,
    avgPaceDisplay: paceDisplay(avgPace),
    avgGAPSec: avgGAP ? 1000 / avgGAP : null,
    avgGAPDisplay: avgGAP ? paceDisplay(1000 / avgGAP) : null,
    avgGAPSpeed: avgGAP,
    hasGAP,
    paceFadePct,
    paceFadeLabel: paceFadePct > 5 ? 'Significant fade' : paceFadePct > 2 ? 'Moderate fade' : paceFadePct > -2 ? 'Even pacing' : 'Negative split',
    firstHalfAvgPace: paceDisplay(firstAvg),
    secondHalfAvgPace: paceDisplay(secondAvg),
    consistencyCV: cv,
    consistencyLabel: cv < 5 ? 'Very consistent' : cv < 10 ? 'Moderately consistent' : 'Inconsistent',
    hrDrift,
    hrDriftLabel: hrDrift != null ? `${hrDrift > 0 ? '+' : ''}${hrDrift.toFixed(0)} bpm` : null,
    avgHR: avgHrSplit,
    avgCadence,
    avgCadenceRounded: avgCadence ? Math.round(avgCadence * 2) : null,
    hrZones,
    maxHR: maxHRCalc,
  };
}

function fadeEnduranceFactor(paceFadePct, userDistanceKm, targetDistanceKm) {
  const ratio = targetDistanceKm / userDistanceKm;
  if (paceFadePct <= 2) return 1;
  if (paceFadePct <= 5) return 1 + (ratio - 1) * 0.008;
  return 1 + (ratio - 1) * 0.015;
}

export { analyzeSplits, fadeEnduranceFactor };
