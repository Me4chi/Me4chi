import { useEffect, useRef } from 'react';
import { ChapterNav } from '../components/ChapterNav';
import { ControlBar } from '../components/ControlBar';
import { Epilogue } from '../components/Epilogue';
import { LoadingScreen } from '../components/LoadingScreen';
import { StageOverlay } from '../components/StageOverlay';
import { CLASSIC_SITE, PROFILE } from '../data/content';
import { type Experience, startExperience } from './bootstrap';
import { useApp } from './store';

export function App() {
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const shotLabel = useRef<HTMLSpanElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const experience = useRef<Experience | null>(null);
  const status = useApp(s => s.status);
  const audioOn = useApp(s => s.audioOn);

  useEffect(() => {
    let disposed = false;
    const [s, t, o, l, p] = [stage.current, track.current, overlay.current, shotLabel.current, progressBar.current];
    if (!s || !t || !o || !l || !p) return;
    startExperience({ stage: s, track: t, overlay: o, shotLabel: l, progressBar: p })
      .then(exp => {
        if (disposed) exp.dispose();
        else experience.current = exp;
      })
      .catch((error: unknown) => {
        console.error(error);
        useApp.getState().set({ status: 'unsupported' });
      });
    return () => {
      disposed = true;
      experience.current?.dispose();
      experience.current = null;
    };
  }, []);

  useEffect(() => {
    experience.current?.setAudio(audioOn);
  }, [audioOn]);

  return (
    <>
      <a className="skip-link" href="#epilogue" onClick={event => { event.preventDefault(); experience.current?.scrollToEnd(); document.getElementById('epilogue')?.focus({ preventScroll: true }); }}>
        Skip the intro
      </a>
      <div className="stage" ref={stage} />
      <StageOverlay ref={overlay} />

      <header className="hud">
        <span className="hud-logo">✿ {PROFILE.name}</span>
        <ChapterNav onSelect={id => experience.current?.scrollToChapter(id)} />
        <ControlBar onSkip={() => experience.current?.scrollToEnd()} />
      </header>

      <div className="hud-shot" aria-hidden="true">
        <span>CH.I</span> · <span ref={shotLabel}>Establishing</span>
      </div>
      <div className="hud-rail" aria-hidden="true"><div ref={progressBar} /></div>

      <main>
        <div className="track" ref={track}>
          <div className="sr-only">
            <h1>{PROFILE.name} — {PROFILE.role}</h1>
            <p>
              Chapter one, Awakening: a night forest, a moss-covered shrine and a traveller waking beside a stone lantern.
              Scroll to move the camera through the scene, or skip to the portfolio below.
            </p>
          </div>
        </div>
        <Epilogue onRestart={() => experience.current?.scrollToChapter('awakening')} />
      </main>

      {status === 'loading' && <LoadingScreen />}
      {status === 'unsupported' && (
        <div className="notice" role="alert">
          <p>This browser could not start WebGL, so the cinematic scene is unavailable.</p>
          <a className="button" href={CLASSIC_SITE}>Open the classic portfolio</a>
        </div>
      )}
      {status === 'context-lost' && (
        <div className="notice" role="alert">
          <p>The graphics context was lost (the GPU was reset or reclaimed).</p>
          <button className="button" type="button" onClick={() => window.location.reload()}>Restart the scene</button>
        </div>
      )}
    </>
  );
}
