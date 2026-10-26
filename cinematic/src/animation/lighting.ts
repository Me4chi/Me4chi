import type { LightingColors, LightingPresetId } from './types';

export const LIGHTING: Readonly<Record<LightingPresetId, LightingColors>> = {
  // Before the eyes open: the forest is a shape, not a place.
  void: { skyTop: 0x040608, skyHorizon: 0x0a1110, far: 0x1c2630, near: 0x26303a, fore: 0x0a0e10, mist: 0x2a3a3a },
  // Cold moonlight, aerial perspective pulls distance toward blue-grey.
  moonlit: { skyTop: 0x0b1420, skyHorizon: 0x26405a, far: 0x55718c, near: 0x8a9fb4, fore: 0x2c3a40, mist: 0xa8bdb0 },
  // The lantern warms the near layers without lifting the sky.
  lanternlit: { skyTop: 0x0c1520, skyHorizon: 0x2c4558, far: 0x5a7489, near: 0xa9a59c, fore: 0x343a36, mist: 0xb2bfae },
};
