/** World-space camera framing. `x`/`y` is the point at the centre of the screen, in world pixels. */
export interface CameraShot {
  x: number;
  y: number;
  zoom: number;
}

export type ShotType =
  | 'establishing'
  | 'wide'
  | 'medium'
  | 'close-up'
  | 'extreme-close-up'
  | 'orbit'
  | 'reveal'
  | 'tracking';

/** GSAP ease name, resolved once with gsap.parseEase. */
export type EaseName = 'none' | 'sine.inOut' | 'sine.out' | 'sine.in' | 'power1.inOut' | 'power2.inOut' | 'power2.out' | 'power3.inOut' | 'expo.out';

export interface CinematicKeyframe {
  /** Local chapter progress, 0..1. */
  at: number;
  camera: CameraShot;
  /** Reframing for portrait screens; unspecified fields fall back to `camera`. */
  portrait?: Partial<CameraShot>;
  /** Ease used to travel from the previous keyframe to this one. */
  ease?: EaseName;
  shot: ShotType;
}

export interface ChannelKey {
  at: number;
  value: number;
  ease?: EaseName;
}

export type ChannelId = 'darkness' | 'lantern' | 'fog' | 'fireflies' | 'characterX';

export type LightingPresetId = 'void' | 'moonlit' | 'lanternlit';

export interface LightingKey {
  at: number;
  preset: LightingPresetId;
  ease?: EaseName;
}

export type PoseId = 'bow' | 'lookUp' | 'idle' | 'front' | 'walk';

export interface PoseKey {
  at: number;
  pose: PoseId;
  /** Character faces screen-left until a key says otherwise. */
  facing: -1 | 0 | 1;
}

export interface CinematicChapter {
  id: string;
  /** Scroll length of the chapter, in viewport heights. */
  length: number;
  keyframes: readonly CinematicKeyframe[];
  channels: Readonly<Record<ChannelId, readonly ChannelKey[]>>;
  lighting: readonly LightingKey[];
  poses: readonly PoseKey[];
}

export interface LightingColors {
  skyTop: number;
  skyHorizon: number;
  /** Multiplicative tint for the farthest layer (depth 0)… */
  far: number;
  /** …and the gameplay layer (depth 1). Layers in between are blended. */
  near: number;
  /** Foreground silhouettes (depth > 1). */
  fore: number;
  mist: number;
}

/** Everything a scene needs to draw one frame. Pre-allocated and mutated in place. */
export interface CinematicState {
  chapterId: string;
  local: number;
  camera: CameraShot;
  shot: ShotType;
  channels: Record<ChannelId, number>;
  light: LightingColors;
  pose: PoseId;
  facing: -1 | 0 | 1;
}
