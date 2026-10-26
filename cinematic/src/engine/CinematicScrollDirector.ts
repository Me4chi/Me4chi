import { gsap } from 'gsap';
import { LIGHTING } from '../animation/lighting';
import type {
  CameraShot,
  ChannelId,
  ChannelKey,
  CinematicChapter,
  CinematicKeyframe,
  CinematicState,
  EaseName,
  LightingColors,
} from '../animation/types';
import { clamp01, lerp, lerpColor } from './pixel';

interface ChapterSlot {
  chapter: CinematicChapter;
  start: number;
  end: number;
}

const easeCache = new Map<string, (t: number) => number>();
function ease(name: EaseName | undefined): (t: number) => number {
  const key = name ?? 'none';
  let fn = easeCache.get(key);
  if (!fn) {
    fn = gsap.parseEase(key) ?? ((t: number) => t);
    easeCache.set(key, fn);
  }
  return fn;
}

/** Index of the last key whose `at` <= p (keys are sorted). */
function segment(keys: readonly { at: number }[], p: number): number {
  let i = 0;
  while (i < keys.length - 1 && (keys[i + 1]?.at ?? Infinity) <= p) i += 1;
  return i;
}

function sampleChannel(keys: readonly ChannelKey[], p: number): number {
  const i = segment(keys, p);
  const a = keys[i];
  const b = keys[i + 1];
  if (!a) return 0;
  if (!b || p <= a.at) return a.value;
  return lerp(a.value, b.value, ease(b.ease)(clamp01((p - a.at) / (b.at - a.at))));
}

const CHANNELS: readonly ChannelId[] = ['darkness', 'lantern', 'fog', 'fireflies', 'characterX'];

/**
 * Translates scroll progress into a complete cinematic state.
 *
 * The state is a pure function of progress: scrolling backwards, jumping or
 * reloading mid-page always reproduces exactly the same frame.
 */
export class CinematicScrollDirector {
  private readonly slots: ChapterSlot[];
  readonly totalLength: number;
  private progress = 0;

  readonly state: CinematicState = {
    chapterId: '',
    local: 0,
    camera: { x: 0, y: 0, zoom: 1 },
    shot: 'establishing',
    channels: { darkness: 1, lantern: 0, fog: 0, fireflies: 0, characterX: 0 },
    light: { ...LIGHTING.void },
    pose: 'bow',
    facing: -1,
  };

  constructor(chapters: readonly CinematicChapter[]) {
    this.totalLength = chapters.reduce((sum, c) => sum + c.length, 0);
    let cursor = 0;
    this.slots = chapters.map(chapter => {
      const start = cursor / this.totalLength;
      cursor += chapter.length;
      return { chapter, start, end: cursor / this.totalLength };
    });
  }

  setProgress(value: number): void {
    this.progress = clamp01(value);
  }

  /** Global progress at which a chapter begins — used by chapter navigation. */
  chapterStart(id: string): number {
    return this.slots.find(slot => slot.chapter.id === id)?.start ?? 0;
  }

  evaluate(portrait: boolean): CinematicState {
    const p = this.progress;
    const slot = this.slots.find(s => p <= s.end) ?? this.slots[this.slots.length - 1];
    if (!slot) return this.state;
    const local = clamp01((p - slot.start) / (slot.end - slot.start));
    const { chapter } = slot;
    const s = this.state;
    s.chapterId = chapter.id;
    s.local = local;

    this.sampleCamera(chapter.keyframes, local, portrait, s.camera);
    // Label the shot the camera is travelling toward — that is what the audience is watching form.
    const keyIndex = segment(chapter.keyframes, local);
    s.shot = (chapter.keyframes[keyIndex + 1] ?? chapter.keyframes[keyIndex])?.shot ?? s.shot;

    for (const id of CHANNELS) s.channels[id] = sampleChannel(chapter.channels[id], local);

    this.sampleLighting(chapter, local, s.light);

    const pose = chapter.poses[segment(chapter.poses, local)];
    if (pose) {
      s.pose = pose.pose;
      s.facing = pose.facing;
    }
    return s;
  }

  private sampleCamera(keys: readonly CinematicKeyframe[], p: number, portrait: boolean, out: CameraShot): void {
    const i = segment(keys, p);
    const a = keys[i];
    const b = keys[i + 1] ?? a;
    if (!a || !b) return;
    const t = b === a || p <= a.at ? 0 : ease(b.ease)(clamp01((p - a.at) / (b.at - a.at)));
    const pick = (k: CinematicKeyframe, f: keyof CameraShot): number =>
      (portrait ? k.portrait?.[f] : undefined) ?? k.camera[f];
    out.x = lerp(pick(a, 'x'), pick(b, 'x'), t);
    out.y = lerp(pick(a, 'y'), pick(b, 'y'), t);
    // Interpolate zoom in log space so a push-in feels constant-speed.
    out.zoom = Math.exp(lerp(Math.log(pick(a, 'zoom')), Math.log(pick(b, 'zoom')), t));
  }

  private sampleLighting(chapter: CinematicChapter, p: number, out: LightingColors): void {
    const keys = chapter.lighting;
    const i = segment(keys, p);
    const a = keys[i];
    const b = keys[i + 1] ?? a;
    if (!a || !b) return;
    const t = b === a || p <= a.at ? 0 : ease(b.ease)(clamp01((p - a.at) / (b.at - a.at)));
    const from = LIGHTING[a.preset];
    const to = LIGHTING[b.preset];
    for (const key of Object.keys(from) as (keyof LightingColors)[]) {
      out[key] = lerpColor(from[key], to[key], t);
    }
  }
}
