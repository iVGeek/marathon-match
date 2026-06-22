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
  return Date.now() / 1000 >= token.expiresAt;
}

export function getAuthUrl(clientId, redirectUri) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export async function fetchActivities(token, page = 1, perPage = 30) {
  const url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Strava API error: ${res.status}`);
  return res.json();
}

export async function fetchActivity(token, activityId) {
  const url = `https://www.strava.com/api/v3/activities/${activityId}`;
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
    distanceKm: activity.distance / 1000,
    movingTimeSec: activity.moving_time,
    elapsedTimeSec: activity.elapsed_time,
    elevationGain: activity.total_elevation_gain || 0,
    startDate: activity.start_date,
    averageSpeed: activity.average_speed,
    averageHeartrate: activity.average_heartrate,
    maxHeartrate: activity.max_heartrate,
  };
}

export async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, clientId, clientSecret }),
  });
  if (!res.ok) throw new Error('Failed to refresh token');
  return res.json();
}
