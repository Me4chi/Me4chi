import type { Container } from 'pixi.js';
import type { CameraShot } from '../animation/types';

/**
 * Turns an authored shot into per-layer transforms.
 *
 * Rendering strategy (pixel art vs. smooth camera):
 *  - The world is authored in world pixels; `virtualHeight` world pixels fill the screen at zoom 1.
 *  - Zoom is continuous and textures are sampled nearest-neighbour, so pixels stay crisp; at
 *    non-integer scales individual world pixels may differ by at most one device pixel.
 *  - Every layer position is snapped to the device-pixel grid, so nothing shimmers while the
 *    camera glides: motion is smooth at screen resolution, never sub-pixel blurred.
 *  - 2.5D depth: a layer at depth d moves d× the camera and zooms 1 + (zoom - 1)·d.
 *    Layers line up exactly as authored when the camera sits on the reference point.
 */
export class CameraDirector {
  readonly shot: CameraShot = { x: 0, y: 0, zoom: 1 };
  private width = 1;
  private height = 1;
  private resolution = 1;
  private baseScale = 1;

  constructor(
    private readonly refX: number,
    private readonly refY: number,
  ) {}

  resize(width: number, height: number, resolution: number, virtualHeight: number): void {
    this.width = width;
    this.height = height;
    this.resolution = resolution;
    this.baseScale = height / virtualHeight;
  }

  /** Frames a shot, adding a slow handheld drift unless motion is reduced. */
  frame(target: CameraShot, time: number, drift: boolean): void {
    this.shot.x = target.x + (drift ? Math.sin(time * 0.21) * 0.7 + Math.sin(time * 0.53) * 0.25 : 0);
    this.shot.y = target.y + (drift ? Math.sin(time * 0.17 + 1.3) * 0.45 : 0);
    this.shot.zoom = target.zoom * (drift ? 1 + Math.sin(time * 0.11) * 0.004 : 1);
  }

  layerScale(depth: number): number {
    return this.baseScale * (1 + (this.shot.zoom - 1) * depth);
  }

  apply(layer: Container, depth: number): void {
    const scale = this.layerScale(depth);
    const focusX = this.shot.x * depth + (1 - depth) * this.refX;
    const focusY = this.shot.y * depth + (1 - depth) * this.refY;
    layer.scale.set(scale);
    layer.position.set(this.snap(this.width / 2 - focusX * scale), this.snap(this.height / 2 - focusY * scale));
  }

  private snap(v: number): number {
    return Math.round(v * this.resolution) / this.resolution;
  }
}
