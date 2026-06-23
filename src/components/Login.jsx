import { useTheme } from '../utils/theme';

export default function Login({ authUrl }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🏃</div>
        <h1 className="login-title">Marathon Match</h1>
        <p className="login-subtitle">
          Connect your Strava to see how your runs stack up<br />
          against the world's greatest marathon courses.
        </p>
        <a href={authUrl} className="strava-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-3.526l-2.89-5.725H0l5.88 11.573 4.238-8.348m4.544 3.029l-2.89-5.725h-5.38l4.679 9.222 4.239-8.348z"/>
          </svg>
          Connect with Strava
        </a>
        <p className="login-note">
          We only read your activity data. Nothing is posted to Strava.
        </p>
        <button className="theme-toggle" onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} style={{ margin: '20px auto 0' }}>
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}
