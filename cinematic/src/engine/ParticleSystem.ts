import { Container, Sprite, type Texture } from 'pixi.js';
import { rng } from './pixel';

export interface ParticleField {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Pooled ambient particles (fireflies, dust). All sprites are created once; per-frame work is
 * arithmetic over typed arrays, with no allocation. `active` limits how many are shown so
 * quality changes never rebuild the pool.
 */
export class ParticleSystem {
  readonly view = new Container();
  private readonly sprites: Sprite[];
  private readonly params: Float32Array;
  private active: number;

  constructor(texture: Texture, readonly capacity: number, field: ParticleField, seed: number) {
    const r = rng(seed);
    this.params = new Float32Array(capacity * 6);
    this.sprites = Array.from({ length: capacity }, (_, i) => {
      const o = i * 6;
      this.params[o] = field.x + r() * field.width; // home x
      this.params[o + 1] = field.y + r() * field.height; // home y
      this.params[o + 2] = 4 + r() * 10; // wander radius
      this.params[o + 3] = 0.15 + r() * 0.35; // wander speed
      this.params[o + 4] = r() * Math.PI * 2; // phase
      this.params[o + 5] = 0.8 + r() * 2.2; // twinkle speed
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.blendMode = 'add';
      this.view.addChild(sprite);
      return sprite;
    });
    this.active = capacity;
  }

  setActive(count: number): void {
    this.active = Math.max(0, Math.min(this.capacity, Math.round(count)));
  }

  /** `intensity` comes from the scroll timeline; motion runs on wall-clock time. */
  update(time: number, intensity: number, motion: boolean): void {
    const t = motion ? time : 0;
    for (let i = 0; i < this.capacity; i += 1) {
      const sprite = this.sprites[i];
      if (!sprite) continue;
      sprite.visible = i < this.active && intensity > 0.01;
      if (!sprite.visible) continue;
      const o = i * 6;
      const radius = this.params[o + 2] ?? 0;
      const speed = this.params[o + 3] ?? 0;
      const phase = this.params[o + 4] ?? 0;
      const x = (this.params[o] ?? 0) + Math.sin(t * speed + phase) * radius + Math.sin(t * speed * 2.3 + phase) * 2;
      const y = (this.params[o + 1] ?? 0) + Math.cos(t * speed * 0.8 + phase * 1.7) * radius * 0.5;
      sprite.position.set(Math.round(x), Math.round(y));
      const twinkle = 0.5 + 0.5 * Math.sin(time * (this.params[o + 5] ?? 1) + phase);
      // Each firefly wakes at its own moment as intensity rises — the forest lights up gradually.
      const wake = Math.min(1, Math.max(0, intensity * 1.6 - (i / this.capacity) * 0.6));
      sprite.alpha = wake * (0.25 + 0.75 * twinkle);
    }
  }
}
