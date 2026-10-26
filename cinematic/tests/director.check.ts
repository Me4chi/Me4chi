// Self-check: the cinematic state must be a pure function of scroll progress (reverse-scroll safety).
// Run: npm run check (tsx)
import assert from 'node:assert/strict';
import { AWAKENING } from '../src/animation/keyframes/awakening';
import { CinematicScrollDirector } from '../src/engine/CinematicScrollDirector';

const director = new CinematicScrollDirector([AWAKENING]);
const snapshot = (p: number) => {
  director.setProgress(p);
  return JSON.stringify(director.evaluate(false));
};

const probes = [0, 0.1, 0.37, 0.5, 0.81, 0.9, 1];
const forward = probes.map(snapshot);
const backward = [...probes].reverse().map(snapshot).reverse();
assert.deepEqual(backward, forward, 'state differs between forward and backward scrubbing');

director.setProgress(0);
assert.equal(director.evaluate(false).channels.darkness, 1, 'film must open in darkness');
director.setProgress(1);
const end = director.evaluate(false);
assert.equal(end.pose, 'walk');
assert.equal(Math.round(end.camera.x), 452);
console.log('director check: ok');
