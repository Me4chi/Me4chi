import { useApp } from '../app/store';

export function LoadingScreen() {
  const progress = useApp(s => s.loadProgress);
  const percent = Math.round(progress * 100);
  return (
    <div className="loading" role="status" aria-live="polite">
      <p>Painting the forest</p>
      <div className="loading-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>
      <small>{percent}%</small>
    </div>
  );
}
