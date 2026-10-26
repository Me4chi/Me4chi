import { Texture, TextureSource } from 'pixi.js';

// Every texture in the world is pixel art: sample it with nearest-neighbour, never bilinear.
TextureSource.defaultOptions.scaleMode = 'nearest';

export type Rand = () => number;

/** Deterministic PRNG (mulberry32) so the painted world is identical on every visit. */
export function rng(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Ordered-dither threshold in [-0.5, 0.5) for the pixel at (x, y). */
export const bayer = (x: number, y: number): number => (BAYER4[(y & 3) * 4 + (x & 3)] ?? 0) / 16 - 0.5;

const css = (color: number): string => `#${color.toString(16).padStart(6, '0')}`;

/**
 * A low-resolution paint surface addressed in world pixels.
 * `originX/originY` is the world coordinate of the canvas' top-left pixel.
 */
export class PixelCanvas {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(
    readonly width: number,
    readonly height: number,
    readonly originX = 0,
    readonly originY = 0,
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas is unavailable');
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
  }

  rect(x: number, y: number, w: number, h: number, color: number, alpha = 1): void {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = css(color);
    this.ctx.fillRect(Math.round(x - this.originX), Math.round(y - this.originY), Math.round(w), Math.round(h));
    this.ctx.globalAlpha = 1;
  }

  px(x: number, y: number, color: number, alpha = 1): void {
    this.rect(x, y, 1, 1, color, alpha);
  }

  /** Horizontal span — the workhorse for scanline-drawn shapes. */
  span(x0: number, x1: number, y: number, color: number): void {
    if (x1 >= x0) this.rect(x0, y, x1 - x0 + 1, 1, color);
  }

  toTexture(): Texture {
    return Texture.from(this.canvas);
  }
}

/** Paints a sprite authored as rows of palette characters ('.' = transparent). */
export function paintMap(rows: readonly string[], palette: Readonly<Record<string, number>>): PixelCanvas {
  const width = Math.max(...rows.map(row => row.length));
  const canvas = new PixelCanvas(width, rows.length);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const color = palette[row[x] ?? '.'];
      if (color !== undefined) canvas.px(x, y, color);
    }
  });
  return canvas;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpColor(a: number, b: number, t: number): number {
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
  const bl = Math.round(lerp(a & 255, b & 255, t));
  return (r << 16) | (g << 8) | bl;
}

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
