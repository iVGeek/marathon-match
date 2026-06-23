import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const PORT = process.env.PORT || 3001;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const paths = {
  __dirname,
  cwd: process.cwd(),
  distFromDirname: resolve(__dirname, '..', 'dist'),
  distFromCwd: resolve(process.cwd(), 'dist'),
};
console.log('Path debug:', JSON.stringify(paths, null, 2));

let distPath = null;
for (const key of ['distFromDirname', 'distFromCwd']) {
  if (existsSync(paths[key])) {
    distPath = paths[key];
    console.log('dist FOUND at', distPath, '— contents:', readdirSync(distPath));
    break;
  }
}
if (!distPath) {
  console.warn('dist NOT found. Tried:', paths.distFromDirname, 'and', paths.distFromCwd);
}

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${APP_URL}?error=no_code`);
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
      return res.redirect(`${APP_URL}?error=token_failed`);
    }

    const data = await tokenRes.json();
    const params = new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: JSON.stringify(data.athlete),
    });
    res.redirect(`${APP_URL}?${params}`);
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect(`${APP_URL}?error=server_error`);
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    stravaClientId: STRAVA_CLIENT_ID,
    stravaRedirectUri: `${APP_URL}/api/auth/callback`,
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

app.get('/api/health', (req, res) => {
  res.json({ ok: true, distFound: !!distPath, distPath, paths });
});

if (distPath && existsSync(join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(200).send(`Marathon Match server running.<br> dist: ${!!distPath}<br> paths: <pre>${JSON.stringify(paths, null, 2)}</pre>`);
  });
}

app.listen(PORT, () => {
  console.log(`Marathon Match running at ${APP_URL}`);
  if (distPath) console.log('Serving static from', distPath);
});
