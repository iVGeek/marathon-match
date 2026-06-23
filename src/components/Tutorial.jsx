import { useState } from 'react';

const STEPS = [
  {
    title: 'Welcome to Marathon Match',
    body: 'Project your running performance against real marathon courses worldwide. See your predicted time, rank, and pace for courses like Boston, New York, Berlin, and more.',
  },
  {
    title: 'Pick a Run',
    body: 'Select a recent run from Strava (or enter one manually) to use as your baseline. The app uses your distance, time, elevation, and splits to build a profile of your running ability.',
  },
  {
    title: 'Browse Projections',
    body: 'Marathon Match projects your run against 50+ marathon courses. Sort by relevance, time, pace, or difficulty. Each row shows your predicted finish, rank, and how the course compares to your run.',
  },
  {
    title: 'Dive Deeper',
    body: 'Click any course to see a detailed breakdown — pace comparison, elevation profile, weather effects, age-graded time, and where you\'d rank among real finishers.',
  },
];

export default function Tutorial({ onDismiss }) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-steps">
          {STEPS.map((_, i) => (
            <span key={i} className={`tutorial-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
          ))}
        </div>
        <h2 className="tutorial-title">{s.title}</h2>
        <p className="tutorial-body">{s.body}</p>
        <div className="tutorial-actions">
          {step > 0 && (
            <button className="tutorial-btn tutorial-btn-secondary" onClick={() => setStep(step - 1)}>Back</button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button className="tutorial-btn tutorial-btn-primary" onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button className="tutorial-btn tutorial-btn-primary" onClick={onDismiss}>Got it</button>
          )}
        </div>
      </div>
    </div>
  );
}
