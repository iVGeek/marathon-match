const config = {
  strava: {
    clientId: import.meta.env.VITE_STRAVA_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_STRAVA_REDIRECT_URI || 'http://localhost:3001/api/auth/callback',
    authUrl: 'https://www.strava.com/oauth/authorize',
    tokenUrl: 'https://www.strava.com/oauth/token',
    apiBase: 'https://www.strava.com/api/v3',
  },
};

export default config;
