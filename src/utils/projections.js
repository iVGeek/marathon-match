import { tempAdjustment, getWeather } from './weather';

const RIEGEL_EXPONENT = 1.06;

function riegelProjection(timeSeconds, distanceKm, targetDistanceKm) {
  const factor = (targetDistanceKm / distanceKm) ** RIEGEL_EXPONENT;
  return timeSeconds * factor;
}

function elevationFactor(userElevPerKm, courseElevPerKm, difficulty) {
  const flatBase = 10;
  const userEffort = userElevPerKm / flatBase;
  const courseEffort = courseElevPerKm / flatBase;
  const elevationRatio = courseEffort > 0
    ? Math.max(0.85, Math.min(1.25, userEffort / courseEffort))
    : 1;
  return (elevationRatio * difficulty);
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

function paceDisplay(secondsPerKm) {
  const min = Math.floor(secondsPerKm / 60);
  const sec = Math.round(secondsPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')} /km`;
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

function projectRun(runDistanceKm, runDurationSec, runElevationGain, targetCourse, userTempC) {
  const userPace = runDurationSec / runDistanceKm;
  const userElevPerKm = runElevationGain / runDistanceKm;

  const baseProjectedSec = riegelProjection(runDurationSec, runDistanceKm, targetCourse.distanceKm);

  const elevFactor = elevationFactor(
    userElevPerKm,
    targetCourse.elevationGain / targetCourse.distanceKm,
    targetCourse.difficulty
  );

  const endurance = endurancePenalty(runDistanceKm, targetCourse.distanceKm);
  const relevance = getRelevance(runDistanceKm, targetCourse.distanceKm);

  const courseWeather = getWeather(targetCourse.id);
  const weatherFactor = userTempC != null && courseWeather
    ? tempAdjustment(userTempC, courseWeather.tempC)
    : 1;

  const projectedTime = baseProjectedSec * elevFactor * endurance * weatherFactor;
  const projectedPace = projectedTime / targetCourse.distanceKm;

  return {
    courseId: targetCourse.id,
    courseName: targetCourse.name,
    location: targetCourse.location,
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
    userPace: paceDisplay(userPace),
    userPaceSec: userPace,
    userDistance: runDistanceKm,
    userDuration: runDurationSec,
    userElevation: runElevationGain,
    adjustmentFactor: elevFactor,
    endurancePenalty: endurance,
    relevance,
    userTemperature: userTempC,
    weatherFactor,
    courseWeather,
  };
}

export { projectRun, riegelProjection, elevationFactor, endurancePenalty, getRelevance, paceDisplay, timeDisplay, formatPace };
