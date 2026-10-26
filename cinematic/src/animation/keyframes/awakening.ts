import type { CinematicChapter } from '../types';

/**
 * Chapter 01 — Awakening. World layout (world px, ground line y = 150):
 *   torii 170–228 · shrine 232–304 · character 305 · stone lantern 330 · forest path 360 →
 */
export const AWAKENING: CinematicChapter = {
  id: 'awakening',
  length: 6,
  keyframes: [
    // 0–15 %: darkness lifts on a still establishing shot.
    { at: 0, camera: { x: 280, y: 94, zoom: 1 }, portrait: { x: 292, y: 100 }, shot: 'establishing' },
    { at: 0.15, camera: { x: 283, y: 95, zoom: 1.05 }, portrait: { x: 294 }, ease: 'sine.inOut', shot: 'establishing' },
    // 15–35 %: slow push toward the shrine; foreground foliage slides past.
    { at: 0.35, camera: { x: 292, y: 106, zoom: 1.55 }, portrait: { x: 296, zoom: 1.45 }, ease: 'power2.inOut', shot: 'wide' },
    // 35–55 %: the character raises their head, the lantern wakes — medium shot.
    { at: 0.55, camera: { x: 310, y: 118, zoom: 2.35 }, portrait: { x: 312, y: 120, zoom: 2.2 }, ease: 'power2.inOut', shot: 'medium' },
    // 55–80 %: drift left around the shrine; depth layers separate (2.5D orbit) while the title lands.
    { at: 0.68, camera: { x: 258, y: 110, zoom: 1.85 }, portrait: { x: 288, zoom: 1.7 }, ease: 'sine.inOut', shot: 'orbit' },
    { at: 0.8, camera: { x: 288, y: 102, zoom: 1.6 }, portrait: { x: 300, y: 104, zoom: 1.45 }, ease: 'sine.inOut', shot: 'wide' },
    // 80–100 %: the character turns to the path; the camera picks them up and tracks.
    { at: 0.86, camera: { x: 322, y: 108, zoom: 1.7 }, portrait: { x: 330 }, ease: 'sine.in', shot: 'tracking' },
    { at: 1, camera: { x: 452, y: 110, zoom: 1.75 }, portrait: { x: 462 }, ease: 'none', shot: 'tracking' },
  ],
  channels: {
    darkness: [
      { at: 0, value: 1 },
      { at: 0.03, value: 1 },
      { at: 0.15, value: 0.22, ease: 'sine.out' },
      { at: 0.4, value: 0.12 },
      { at: 1, value: 0.1 },
    ],
    lantern: [
      { at: 0, value: 0 },
      { at: 0.42, value: 0 },
      { at: 0.52, value: 1, ease: 'expo.out' },
      { at: 1, value: 1 },
    ],
    fog: [
      { at: 0, value: 1 },
      { at: 0.3, value: 0.7 },
      { at: 0.7, value: 0.5 },
      { at: 1, value: 0.4 },
    ],
    fireflies: [
      { at: 0, value: 0 },
      { at: 0.07, value: 0 },
      { at: 0.22, value: 1, ease: 'sine.out' },
      { at: 1, value: 1 },
    ],
    characterX: [
      { at: 0, value: 305 },
      { at: 0.845, value: 305 },
      { at: 1, value: 452 },
    ],
  },
  lighting: [
    { at: 0, preset: 'void' },
    { at: 0.04, preset: 'void' },
    { at: 0.18, preset: 'moonlit', ease: 'sine.inOut' },
    { at: 0.44, preset: 'moonlit' },
    { at: 0.54, preset: 'lanternlit', ease: 'power2.out' },
  ],
  poses: [
    { at: 0, pose: 'bow', facing: -1 },
    { at: 0.4, pose: 'lookUp', facing: -1 },
    { at: 0.56, pose: 'idle', facing: -1 },
    { at: 0.815, pose: 'front', facing: 0 },
    { at: 0.845, pose: 'walk', facing: 1 },
  ],
};
