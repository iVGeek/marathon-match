import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`http://localhost:5173?error=no_code`);
  }

  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Strava token error:', err);
      return res.redirect(`http://localhost:5173?error=token_failed`);
    }

    const data = await tokenRes.json();
    const params = new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: JSON.stringify(data.athlete),
    });
    res.redirect(`http://localhost:5173?${params}`);
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect(`http://localhost:5173?error=server_error`);
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    stravaClientId: STRAVA_CLIENT_ID,
    stravaRedirectUri: `http://localhost:${PORT}/api/auth/callback`,
  });
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Strava refresh error:', err);
      return res.status(400).json({ error: 'refresh_failed' });
    }

    const data = await tokenRes.json();
    res.json(data);
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Marathon Match server running on http://localhost:${PORT}`);
});
