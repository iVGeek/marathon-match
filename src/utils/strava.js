const STORAGE_KEY = 'marathon_match_strava_token';

export function getStoredToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeToken(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athlete: data.athlete,
  }));
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isTokenExpired(token) {
  if (!token || !token.expiresAt) return true;
  return Date.now() / 1000 >= token.expiresAt;
}

export function getAuthUrl(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all,profile:read_all',
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export async function fetchActivities(token, page = 1, perPage = 100) {
  const url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Strava API error: ${res.status}`);
  return res.json();
}

export async function fetchAllActivities(token, onProgress) {
  const all = [];
  let page = 1;
  const perPage = 100;
  let batch;

  do {
    batch = await fetchActivities(token, page, perPage);
    if (batch && batch.length > 0) {
      all.push(...batch);
      if (onProgress) onProgress(all.length, batch.length);
      page++;
    }
  } while (batch && batch.length === perPage);

  return all;
}

export async function fetchActivityDetail(token, activityId) {
  const url = `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Strava API error: ${res.status}`);
  return res.json();
}

export function isRunningActivity(activity) {
  return activity.type === 'Run';
}

export function parseActivityStats(activity) {
  return {
    id: activity.id,
    name: activity.name,
    distance: activity.distance,
    distanceKm: activity.distance / 1000,
    movingTimeSec: activity.moving_time,
    elapsedTimeSec: activity.elapsed_time,
    totalElevationGain: activity.total_elevation_gain,
    elevationGain: activity.total_elevation_gain || 0,
    type: activity.type,
    sportType: activity.sport_type,
    startDate: activity.start_date,
    startDateLocal: activity.start_date_local,
    timezone: activity.timezone,
    utcOffset: activity.utc_offset,
    startLatlng: activity.start_latlng,
    endLatlng: activity.end_latlng,
    locationCity: activity.location_city,
    locationState: activity.location_state,
    locationCountry: activity.location_country,
    startLatitude: activity.start_latitude,
    startLongitude: activity.start_longitude,
    averageSpeed: activity.average_speed,
    maxSpeed: activity.max_speed,
    averageHeartrate: activity.average_heartrate,
    maxHeartrate: activity.max_heartrate,
    averageTemp: activity.average_temp,
    averageCadence: activity.average_cadence,
    elevHigh: activity.elev_high,
    elevLow: activity.elev_low,
    achievementCount: activity.achievement_count,
    kudosCount: activity.kudos_count,
    commentCount: activity.comment_count,
    athleteCount: activity.athlete_count,
    photoCount: activity.photo_count,
    trainer: activity.trainer,
    commute: activity.commute,
    manual: activity.manual,
    private: activity.private,
    visibility: activity.visibility,
    flagged: activity.flagged,
    gearId: activity.gear_id,
    description: activity.description,
    calories: activity.calories,
    deviceName: activity.device_name,
    workoutType: activity.workout_type,
    hasHeartrate: activity.has_heartrate,
    prCount: activity.pr_count,
    resourceState: activity.resource_state,
    externalId: activity.external_id,
    uploadId: activity.upload_id,
    workoutType: activity.workout_type,
    isManual: false,
  };
}

export function parseActivityDetail(raw) {
  const base = parseActivityStats(raw);
  return {
    ...base,
    splits: (raw.splits_metric || []).map(s => ({
      distance: s.distance,
      movingTime: s.moving_time,
      elapsedTime: s.elapsed_time,
      averageSpeed: s.average_speed,
      maxSpeed: s.max_speed,
      elevationDiff: s.elevation_difference,
      averageGradeAdjustedSpeed: s.average_grade_adjusted_speed,
      averageHeartrate: s.average_heartrate,
      averageCadence: s.average_cadence,
      split: s.split,
    })),
    gradeAdjustedDistance: raw.grade_adjusted_distance,
    averageGradeAdjustedSpeed: raw.average_grade_adjusted_speed,
    bestEfforts: (raw.best_efforts || []).map(e => ({
      name: e.name,
      distance: e.distance,
      elapsedTime: e.elapsed_time,
      movingTime: e.moving_time,
      startDate: e.start_date,
    })),
  };
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Failed to refresh token');
  return res.json();
}
