let cachedConfig = null;

export async function fetchConfig() {
  if (cachedConfig) return cachedConfig;
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to fetch config');
  cachedConfig = await res.json();
  return cachedConfig;
}

export function getCachedConfig() {
  return cachedConfig;
}
