import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { AWAKENING } from '../animation/keyframes/awakening';
import type { ShotType } from '../animation/types';
import { AudioManager } from '../engine/AudioManager';
import { CameraDirector } from '../engine/CameraDirector';
import { CinematicScrollDirector } from '../engine/CinematicScrollDirector';
import { Renderer } from '../engine/Renderer';
import { AwakeningScene } from '../scenes/awakening/AwakeningScene';
import { useApp } from './store';

gsap.registerPlugin(ScrollTrigger);

export interface ExperienceDom {
  /** Element the Pixi canvas is mounted into (fixed, full screen). */
  stage: HTMLElement;
  /** Tall element whose scroll range drives the film. */
  track: HTMLElement;
  /** Overlay holding [data-cue] text elements choreographed by the timeline. */
  overlay: HTMLElement;
  shotLabel: HTMLElement;
  progressBar: HTMLElement;
}

export interface Experience {
  scrollToChapter: (id: string) => void;
  scrollToEnd: () => void;
  setAudio: (on: boolean) => void;
  dispose: () => void;
}

const SHOT_NAMES: Record<ShotType, string> = {
  establishing: 'Establishing',
  wide: 'Wide',
  medium: 'Medium',
  'close-up': 'Close-up',
  'extreme-close-up': 'Extreme close-up',
  orbit: 'Orbit',
  reveal: 'Reveal',
  tracking: 'Tracking',
};

/** Scrubbed HTML choreography. Positions are chapter progress (timeline length = 1). */
function buildTextTimeline(overlay: HTMLElement): gsap.core.Timeline {
  const q = <T extends Element>(cue: string): T[] => [...overlay.querySelectorAll<T>(`[data-cue="${cue}"]`)];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.addLabel('awakening.hint', 0)
    .to(q('hint'), { autoAlpha: 0, y: -12, duration: 0.04 }, 0.02)
    .addLabel('awakening.card', 0.06)
    .fromTo(q('card'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power2.out' }, 0.06)
    .to(q('card'), { autoAlpha: 0, y: -14, duration: 0.05 }, 0.22)
    .addLabel('awakening.title', 0.58)
    .fromTo(
      q('title-letter'),
      { autoAlpha: 0, yPercent: 60, filter: 'blur(6px)' },
      { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.05, stagger: 0.012, ease: 'power3.out' },
      0.58,
    )
    .fromTo(q('subtitle'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power2.out' }, 0.66)
    .to([...q('title-letter'), ...q('subtitle')], { autoAlpha: 0, y: -18, duration: 0.05, stagger: 0.004 }, 0.86)
    .addLabel('awakening.exit', 0.93)
    .fromTo(q('exit'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.93)
    .set({}, {}, 1);
  return tl;
}

export async function startExperience(dom: ExperienceDom): Promise<Experience> {
  const store = useApp.getState;
  const setStore = useApp.getState().set;
  const portraitQuery = window.matchMedia('(max-aspect-ratio: 4/5)');
  const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 720;

  const renderer = new Renderer();
  await renderer.init(dom.stage, () => setStore({ status: 'context-lost' }));

  // Fonts must be ready before the first painted frame so the title never reflows mid-shot.
  await document.fonts.ready;
  const scene = new AwakeningScene(mobile, done => setStore({ loadProgress: done }));
  renderer.app.stage.addChild(scene.view);

  const director = new CinematicScrollDirector([AWAKENING]);
  const camera = new CameraDirector(300, 100);
  const audio = new AudioManager();
  const text = buildTextTimeline(dom.overlay);

  dom.track.style.height = `${director.totalLength * 100 + 100}vh`;

  let lenis: Lenis | undefined;
  const syncLenis = (reduced: boolean): void => {
    lenis?.destroy();
    lenis = reduced ? undefined : new Lenis({ lerp: 0.12, wheelMultiplier: 0.9 });
    lenis?.on('scroll', ScrollTrigger.update);
  };
  syncLenis(store().reducedMotion);

  const trigger = ScrollTrigger.create({
    trigger: dom.track,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => {
      director.setProgress(self.progress);
      text.progress(self.progress);
    },
  });

  const resize = (): void => {
    const portrait = portraitQuery.matches;
    camera.resize(renderer.width, renderer.height, renderer.resolution, portrait ? 260 : 180);
  };
  resize();
  renderer.app.renderer.on('resize', resize);

  let lastShot: ShotType | undefined;
  let lastChapter = '';
  const tick = (time: number, deltaMs: number): void => {
    lenis?.raf(time * 1000);
    const motion = !store().reducedMotion;
    const state = director.evaluate(portraitQuery.matches);
    camera.frame(state.camera, time, motion);
    // Once the epilogue covers the screen the film is invisible: stop paying for frames.
    const offstage = window.scrollY > dom.track.offsetTop + dom.track.offsetHeight;
    if (!offstage) {
      scene.update(state, camera, { time, motion, width: renderer.width, height: renderer.height });
      renderer.render();
    }

    if (renderer.sample(deltaMs)) {
      resize();
      const level = renderer.qualityLevel;
      setStore({ quality: level >= 3 ? 'low' : level >= 2 ? 'medium' : 'high' });
      scene.setParticleBudget(level >= 3 ? 0.4 : 0.7);
    }
    // DOM writes only when something actually changes.
    if (state.shot !== lastShot) {
      lastShot = state.shot;
      dom.shotLabel.textContent = SHOT_NAMES[state.shot];
    }
    if (state.chapterId !== lastChapter) {
      lastChapter = state.chapterId;
      setStore({ activeChapter: state.chapterId });
    }
    dom.progressBar.style.transform = `scaleY(${trigger.progress.toFixed(4)})`;
    audio.setAtmosphere(state.channels.darkness);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const unsubscribe = useApp.subscribe((next, prev) => {
    if (next.reducedMotion !== prev.reducedMotion) syncLenis(next.reducedMotion);
  });

  setStore({ status: 'ready', loadProgress: 1 });

  const scrollTo = (y: number): void => {
    if (lenis) lenis.scrollTo(y, { duration: 2.2 });
    else window.scrollTo({ top: y });
  };

  return {
    scrollToChapter: id => {
      const top = dom.track.offsetTop;
      const range = dom.track.offsetHeight - window.innerHeight;
      scrollTo(top + director.chapterStart(id) * range);
    },
    scrollToEnd: () => scrollTo(dom.track.offsetTop + dom.track.offsetHeight),
    setAudio: on => void audio.setEnabled(on),
    dispose: () => {
      gsap.ticker.remove(tick);
      unsubscribe();
      trigger.kill();
      text.kill();
      lenis?.destroy();
      audio.dispose();
      renderer.destroy();
    },
  };
}
