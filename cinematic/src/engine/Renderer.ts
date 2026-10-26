import { Application } from 'pixi.js';

const RESOLUTION_STEPS = [2, 1.5, 1, 0.75] as const;

/**
 * Owns the Pixi application. It never runs its own ticker: frames are rendered from GSAP's
 * ticker so scroll, Lenis and rendering share exactly one loop.
 */
export class Renderer {
  readonly app = new Application();
  private step = 0;
  private slowFrames = 0;
  private frameTime = 16.7;

  async init(host: HTMLElement, onContextLost: () => void): Promise<void> {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.step = RESOLUTION_STEPS.findIndex(r => r <= dpr);
    await this.app.init({
      preference: 'webgl',
      resizeTo: window,
      antialias: false,
      autoDensity: true,
      resolution: this.resolution,
      autoStart: false,
      background: 0x05080a,
      powerPreference: 'high-performance',
    });
    this.app.ticker.stop();
    const canvas = this.app.canvas;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      onContextLost();
    });
    host.appendChild(canvas);
  }

  get resolution(): number {
    return RESOLUTION_STEPS[Math.max(0, this.step)] ?? 1;
  }

  get width(): number {
    return this.app.screen.width;
  }

  get height(): number {
    return this.app.screen.height;
  }

  /**
   * Frame-time monitor. After ~1.5 s of frames slower than ~40 fps the render resolution drops a
   * step (pixel art tolerates it well). Returns true when quality changed.
   */
  sample(deltaMs: number): boolean {
    this.frameTime += (Math.min(deltaMs, 100) - this.frameTime) * 0.05;
    this.slowFrames = this.frameTime > 25 ? this.slowFrames + 1 : 0;
    if (this.slowFrames < 90 || this.step >= RESOLUTION_STEPS.length - 1) return false;
    this.step += 1;
    this.slowFrames = 0;
    this.app.renderer.resize(this.width, this.height, this.resolution);
    return true;
  }

  get qualityLevel(): number {
    return this.step;
  }

  render(): void {
    this.app.render();
  }

  destroy(): void {
    this.app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
  }
}
