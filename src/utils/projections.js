import { tempAdjustment, getWeather } from './weather';
import { fadeEnduranceFactor } from './paceAnalysis';

const RIEGEL_EXPONENT = 1.06;

function riegelProjection(timeSeconds, distanceKm, targetDistanceKm) {
  const factor = (targetDistanceKm / distanceKm) ** RIEGEL_EXPONENT;
  return timeSeconds * factor;
}

function elevationFactor(userElevPerKm, courseElevPerKm, difficulty, weightKg) {
  const flatBase = 10;
  const userEffort = userElevPerKm / flatBase;
  const courseEffort = courseElevPerKm / flatBase;
  const elevationRatio = courseEffort > 0
    ? Math.max(0.85, Math.min(1.25, userEffort / courseEffort))
    : 1;

  const w = weightKg || 70;
  const weightPenalty = w > 0 ? 1 + (w - 70) / 70 * 0.12 * (courseElevPerKm / 15) : 1;

  return (elevationRatio * difficulty * weightPenalty);
}

function ageAdjustment(age, targetDistanceKm) {
  if (!age || age < 18) return 1;
  if (age <= 27) return 1;
  const yearsAbovePeak = age - 27;
  const factor = 1 + (yearsAbovePeak / 100) * 0.4 * Math.min(3, targetDistanceKm / 21);
  return factor;
}

function endurancePenalty(userDistanceKm, targetDistanceKm) {
  const ratio = userDistanceKm / targetDistanceKm;
  if (ratio >= 0.8) return 1.0;
  if (ratio >= 0.5) return 1.04;
  if (ratio >= 0.33) return 1.10;
  if (ratio >= 0.2) return 1.18;
  return 1.25;
}

function getRelevance(userDistanceKm, targetDistanceKm) {
  const ratio = userDistanceKm / targetDistanceKm;
  if (ratio >= 0.8) return { level: 'high', label: 'Very relevant', score: 3 };
  if (ratio >= 0.5) return { level: 'medium', label: 'Relevant', score: 2 };
  if (ratio >= 0.25) return { level: 'low', label: 'Approximate', score: 1 };
  return { level: 'estimate', label: 'Rough estimate', score: 0 };
}

function paceDisplay(secondsPerKm, compact) {
  if (secondsPerKm == null || !isFinite(secondsPerKm)) return '--:--';
  const min = Math.floor(secondsPerKm / 60);
  const sec = Math.round(secondsPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')}${compact ? '' : ' /km'}`;
}

function timeDisplay(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function formatPace(secondsPerKm) {
  return paceDisplay(secondsPerKm);
}

function projectRun(runDistanceKm, runDurationSec, runElevationGain, targetCourse, userTempC, paceAnalysis, athlete) {
  const rawPace = runDurationSec / runDistanceKm;

  const effectivePace = (paceAnalysis && paceAnalysis.hasGAP && paceAnalysis.avgGAPSec)
    ? paceAnalysis.avgGAPSec
    : rawPace;

  const effectiveDuration = effectivePace * runDistanceKm;

  const baseProjectedSec = riegelProjection(effectiveDuration, runDistanceKm, targetCourse.distanceKm);

  const userElevPerKm = runElevationGain / runDistanceKm;
  const courseElevPerKm = targetCourse.elevationGain / targetCourse.distanceKm;

  const userWeight = athlete?.weight || null;

  const elevFactor = elevationFactor(
    userElevPerKm,
    courseElevPerKm,
    targetCourse.difficulty,
    userWeight
  );

  const ageVal = athlete?.age || null;
  const ageFactor = ageAdjustment(ageVal, targetCourse.distanceKm);

  const elevRatio = courseElevPerKm > 0
    ? Math.max(0.85, Math.min(1.25, (userElevPerKm / 10) / (courseElevPerKm / 10)))
    : 1;
  const diffVsRun = elevRatio < 1 ? 'Less' : elevRatio > 1 ? 'More' : 'Similar';
  const diffVsRunPct = Math.abs(elevRatio - 1) * 100;

  const endurance = endurancePenalty(runDistanceKm, targetCourse.distanceKm);
  const relevance = getRelevance(runDistanceKm, targetCourse.distanceKm);

  const courseWeather = getWeather(targetCourse.id);
  const weatherFactor = userTempC != null && courseWeather
    ? tempAdjustment(userTempC, courseWeather.tempC)
    : 1;

  const fadeFactor = paceAnalysis
    ? fadeEnduranceFactor(paceAnalysis.paceFadePct, runDistanceKm, targetCourse.distanceKm)
    : 1;

  const projectedTime = baseProjectedSec * elevFactor * endurance * weatherFactor * fadeFactor * ageFactor;
  const projectedPace = projectedTime / targetCourse.distanceKm;

  return {
    courseId: targetCourse.id,
    courseName: targetCourse.name,
    location: targetCourse.location,
    country: targetCourse.country,
    distanceKm: targetCourse.distanceKm,
    elevationGain: targetCourse.elevationGain,
    difficulty: targetCourse.difficulty,
    description: targetCourse.description,
    color: targetCourse.color,
    surface: targetCourse.surface,
    projectedTimeSec: projectedTime,
    projectedTime: timeDisplay(projectedTime),
    projectedPace: paceDisplay(projectedPace),
    projectedPaceSec: projectedPace,
    userPace: paceDisplay(rawPace),
    userPaceSec: rawPace,
    userGAP: paceAnalysis && paceAnalysis.avgGAPDisplay ? paceAnalysis.avgGAPDisplay : null,
    userGAPSec: paceAnalysis && paceAnalysis.avgGAPSec ? paceAnalysis.avgGAPSec : null,
    userDistance: runDistanceKm,
    userDuration: runDurationSec,
    userElevation: runElevationGain,
    adjustmentFactor: elevFactor,
    endurancePenalty: endurance,
    relevance,
    weatherFactor,
    courseWeather,
    userTemperature: userTempC,
    fadeFactor,
    paceFadePct: paceAnalysis ? paceAnalysis.paceFadePct : null,
    diffVsRun,
    diffVsRunPct,
    userElevPerKm,
    courseElevPerKm,
    userWeight,
    userAge: ageVal,
    ageFactor,
  };
}

export { projectRun, riegelProjection, elevationFactor, endurancePenalty, getRelevance, paceDisplay, timeDisplay, formatPace, ageAdjustment };
