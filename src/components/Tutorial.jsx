import { useState } from 'react';

const STEPS = [
  {
    icon: '🏁',
    title: 'Welcome to Marathon Match',
    body: 'Project your running performance against 50+ real marathon courses worldwide. See your predicted time, rank, and pace for courses like Boston, New York, Berlin, and more.',
  },
  {
    icon: '🏃',
    title: 'Pick a Run',
    body: 'Select a recent run from Strava (or enter one manually) to use as your baseline. The app uses your distance, time, elevation, and splits to build a profile of your running ability.',
  },
  {
    icon: '📊',
    title: 'Browse Projections',
    body: 'Marathon Match projects your run against dozens of marathon courses. Sort by time, pace, difficulty, or relevance. Each row shows your predicted finish, rank, and course comparison.',
  },
  {
    icon: '🔍',
    title: 'Dive Deeper',
    body: 'Click any course to see a detailed breakdown — pace comparison, elevation profile, weather effects, age-graded time, and where you\'d rank among real finishers.',
  },
];

export default function Tutorial({ onDismiss }) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  return (
    <div className="tutorial-overlay" onClick={e => e.target === e.currentTarget && onDismiss()}>
      <div className="tutorial-card" key={step} style={{ animation: 'tutorialFadeIn 0.3s ease both' }}>
        <div className="tutorial-progress">
          <div className="tutorial-progress-track">
            <div className="tutorial-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <span className="tutorial-progress-text">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="tutorial-icon">{s.icon}</div>
        <h2 className="tutorial-title">{s.title}</h2>
        <p className="tutorial-body">{s.body}</p>
        <div className="tutorial-dots">
          {STEPS.map((_, i) => (
            <button key={i} className={`tutorial-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} onClick={() => setStep(i)} aria-label={`Step ${i + 1}`} />
          ))}
        </div>
        <div className="tutorial-actions">
          {step > 0 ? (
            <button className="tutorial-btn tutorial-btn-ghost" onClick={() => setStep(step - 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <button className="tutorial-btn tutorial-btn-primary" onClick={() => setStep(step + 1)}>
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ) : (
            <button className="tutorial-btn tutorial-btn-primary" onClick={onDismiss}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
