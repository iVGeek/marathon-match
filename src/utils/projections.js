const RIEGEL_EXPONENT = 1.06;

function riegelProjection(timeSeconds, distanceKm, targetDistanceKm) {
  const factor = (targetDistanceKm / distanceKm) ** RIEGEL_EXPONENT;
  return timeSeconds * factor;
}

function elevationFactor(userElevationPerKm, courseElevationPerKm, difficulty) {
  const flatBase = 10;
  const userEffort = userElevationPerKm / flatBase;
  const courseEffort = courseElevationPerKm / flatBase;
  const elevationRatio = courseEffort > 0
    ? Math.max(0.85, Math.min(1.25, userEffort / courseEffort))
    : 1;
  return (elevationRatio * difficulty);
}

function temperatureFactor(userTemp, courseTemp) {
  const optimalTemp = 12;
  const uDiff = userTemp != null ? Math.abs(userTemp - optimalTemp) : 0;
  const cDiff = courseTemp != null ? Math.abs(courseTemp - optimalTemp) : 0;
  if (uDiff === 0 || cDiff === 0) return 1;
  return 1 + Math.max(0, (cDiff - uDiff) * 0.003);
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

function projectRun(runDistanceKm, runDurationSec, runElevationGain, targetCourse) {
  const userPace = runDurationSec / runDistanceKm;
  const userElevPerKm = runElevationGain / runDistanceKm;

  const baseProjectedSec = riegelProjection(runDurationSec, runDistanceKm, targetCourse.distanceKm);

  const elevFactor = elevationFactor(
    userElevPerKm,
    targetCourse.elevationGain / targetCourse.distanceKm,
    targetCourse.difficulty
  );

  const projectedTime = baseProjectedSec * elevFactor;
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
    predictedPaceSec: projectedPace,
    userPace: paceDisplay(userPace),
    userPaceSec: userPace,
    userDistance: runDistanceKm,
    userDuration: runDurationSec,
    userElevation: runElevationGain,
    adjustmentFactor: elevFactor,
  };
}

export { projectRun, riegelProjection, elevationFactor, paceDisplay, timeDisplay, formatPace };
