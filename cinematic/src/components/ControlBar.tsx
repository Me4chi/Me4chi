import { useApp } from '../app/store';
import { CLASSIC_SITE } from '../data/content';

export function ControlBar({ onSkip }: { onSkip: () => void }) {
  const audioOn = useApp(s => s.audioOn);
  const reducedMotion = useApp(s => s.reducedMotion);
  const set = useApp(s => s.set);

  const toggleMotion = (): void => {
    const next = !reducedMotion;
    set({ reducedMotion: next });
    try {
      localStorage.setItem('me4chi-reduced-motion', next ? '1' : '0');
    } catch {
      // Preference simply won't persist.
    }
  };

  return (
    <div className="controls">
      <button type="button" className="hud-button" aria-pressed={audioOn} onClick={() => set({ audioOn: !audioOn })}>
        ♪ {audioOn ? 'On' : 'Off'}
      </button>
      <button type="button" className="hud-button" aria-pressed={reducedMotion} onClick={toggleMotion}>
        {reducedMotion ? 'Motion: calm' : 'Motion: full'}
      </button>
      <button type="button" className="hud-button" onClick={onSkip}>Skip ↓</button>
      <a className="hud-button" href={CLASSIC_SITE}>Classic</a>
    </div>
  );
}
