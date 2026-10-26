import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import type { CinematicState } from '../../animation/types';
import type { CameraDirector } from '../../engine/CameraDirector';
import { lerpColor, PixelCanvas } from '../../engine/pixel';
import { ParticleSystem } from '../../engine/ParticleSystem';
import { Character } from '../../entities/Character';
import * as art from './art';

interface DepthLayer {
  view: Container;
  depth: number;
  /** Tinted by scene lighting (false for emissive light sources). */
  lit: boolean;
  fog?: { strength: number; drift: number };
}

export interface FrameContext {
  time: number;
  motion: boolean;
  width: number;
  height: number;
}

const LANTERN = { x: 330, y: 123 };

/**
 * Chapter 01 — Awakening.
 * Layer stack (back → front): sky · stars/moon · mountains · far forest · fog · mid forest ·
 * fog · clearing (torii, shrine, character) · emissive light · foreground foliage · grade.
 */
export class AwakeningScene {
  readonly view = new Container();
  private readonly skyBase = new Sprite(Texture.WHITE);
  private readonly skyHorizon: Sprite;
  private readonly layers: DepthLayer[] = [];
  private readonly character = new Character();
  private readonly fireflies: ParticleSystem;
  private readonly lanternGlow: Sprite;
  private readonly lanternCore: Sprite;
  private readonly darkness = new Graphics();
  private readonly vignette: Sprite;

  constructor(mobile: boolean, onProgress: (done: number) => void) {
    const steps: (() => void)[] = [];
    let horizon!: Sprite;
    let glow!: Sprite;
    let core!: Sprite;
    let vignette!: Sprite;
    let fireflies!: ParticleSystem;

    const add = (canvas: PixelCanvas, depth: number, lit = true, fog?: DepthLayer['fog']): Container => {
      const view = new Container();
      const sprite = new Sprite(canvas.toTexture());
      sprite.position.set(art.WORLD.x, art.WORLD.y);
      view.addChild(sprite);
      this.view.addChild(view);
      this.layers.push({ view, depth, lit, ...(fog ? { fog } : {}) });
      return view;
    };

    steps.push(() => {
      this.view.addChild(this.skyBase);
      horizon = new Sprite(verticalGradient().toTexture());
      horizon.texture.source.scaleMode = 'linear';
      this.view.addChild(horizon);
    });
    steps.push(() => void add(art.paintSkyObjects(), 0.03, false));
    steps.push(() => void add(art.paintMountains(), 0.12));
    steps.push(() => void add(art.paintFarForest(), 0.32));
    steps.push(() => void add(art.paintFog(5, 128, 16), 0.45, false, { strength: 0.45, drift: 1.5 }));
    steps.push(() => void add(art.paintMidForest(), 0.62));
    steps.push(() => void add(art.paintFog(9, 144, 10), 0.8, false, { strength: 0.32, drift: 3 }));
    steps.push(() => {
      const main = add(art.paintMainLayer(), 1);
      main.addChild(this.character.sprite);
    });
    steps.push(() => {
      // Emissive light lives on its own depth-1 layer so lighting tints never dim it.
      const emissive = add(new PixelCanvas(1, 1), 1, false);
      glow = new Sprite(art.paintGlow(58, 0xe8ad63).toTexture());
      glow.anchor.set(0.5);
      glow.position.set(LANTERN.x, LANTERN.y);
      glow.blendMode = 'add';
      core = new Sprite(Texture.WHITE);
      core.tint = 0xffd88a;
      core.width = 5;
      core.height = 4;
      core.position.set(LANTERN.x - 2, LANTERN.y - 2);
      fireflies = new ParticleSystem(art.paintFirefly().toTexture(), 48, { x: 140, y: 70, width: 380, height: 80 }, 97);
      fireflies.setActive(mobile ? 20 : 48);
      emissive.addChild(glow, core, fireflies.view);
    });
    steps.push(() => void add(art.paintForeground(), 1.4));
    steps.push(() => {
      vignette = new Sprite(radialVignette().toTexture());
      vignette.texture.source.scaleMode = 'linear';
      this.view.addChild(vignette, this.darkness);
    });

    steps.forEach((step, i) => {
      step();
      onProgress((i + 1) / steps.length);
    });
    this.skyHorizon = horizon;
    this.lanternGlow = glow;
    this.lanternCore = core;
    this.vignette = vignette;
    this.fireflies = fireflies;
  }

  setParticleBudget(scale: number): void {
    this.fireflies.setActive(this.fireflies.capacity * scale);
  }

  update(state: CinematicState, camera: CameraDirector, frame: FrameContext): void {
    const { light, channels } = state;
    const { width, height, time, motion } = frame;

    this.skyBase.tint = light.skyTop;
    this.skyBase.setSize(width, height);
    this.skyHorizon.tint = light.skyHorizon;
    this.skyHorizon.setSize(width, height);

    for (const layer of this.layers) {
      camera.apply(layer.view, layer.depth);
      if (layer.fog) {
        layer.view.tint = light.mist;
        layer.view.alpha = channels.fog * layer.fog.strength;
        const drift = motion ? Math.sin(time * 0.03 * layer.fog.drift) * 24 : 0;
        layer.view.x += Math.round(drift * camera.layerScale(layer.depth));
      } else if (layer.lit) {
        layer.view.tint = layer.depth > 1 ? light.fore : lerpColor(light.far, light.near, Math.min(1, layer.depth));
      }
    }

    this.character.update(state.pose, state.facing, channels.characterX, art.WORLD.ground + 1, time, motion);

    const flicker = motion ? 0.88 + Math.sin(time * 9.1) * 0.05 + Math.sin(time * 23.7) * 0.04 : 0.95;
    this.lanternGlow.alpha = channels.lantern * flicker;
    this.lanternCore.alpha = Math.min(1, channels.lantern * 1.4);
    this.fireflies.update(time, channels.fireflies, motion);

    this.vignette.setSize(width, height);
    this.vignette.alpha = 0.55 + channels.darkness * 0.45;
    this.darkness.clear().rect(0, 0, width, height).fill({ color: 0x05080a, alpha: channels.darkness * 0.97 });
  }
}

function verticalGradient(): PixelCanvas {
  const p = new PixelCanvas(1, 64);
  for (let y = 0; y < 64; y += 1) p.px(0, y, 0xffffff, (y / 63) ** 1.6);
  return p;
}

function radialVignette(): PixelCanvas {
  const size = 128;
  const p = new PixelCanvas(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = Math.hypot((x - size / 2) / (size / 2), (y - size / 2) / (size / 2));
      p.px(x, y, 0x05080a, Math.max(0, Math.min(1, (d - 0.55) * 1.3)) ** 1.5);
    }
  }
  return p;
}
