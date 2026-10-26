import { bayer, PixelCanvas, type Rand, rng } from '../../engine/pixel';

/**
 * Procedurally painted pixel art for Chapter 01.
 *
 * Every layer is painted once at world resolution with a fixed seed, then uploaded as a single
 * nearest-filtered texture. Colours are albedo under neutral light; the scene's lighting tints
 * them per depth at runtime, so one painting serves night, lantern light and (later) sunset.
 */

/** World extents shared by all layers (world px). */
export const WORLD = { x: -200, y: -120, width: 1300, height: 400, ground: 150 } as const;

const layer = (): PixelCanvas => new PixelCanvas(WORLD.width, WORLD.height, WORLD.x, WORLD.y);

interface Foliage {
  dark: number;
  mid: number;
  light: number;
}

/** A dithered, top-left-lit cluster of leaves. */
function blob(p: PixelCanvas, r: Rand, cx: number, cy: number, rx: number, ry: number, c: Foliage, lightBias = 0): void {
  const wobble = Array.from({ length: 16 }, () => 0.8 + r() * 0.35);
  for (let y = -ry; y <= ry; y += 1) {
    for (let x = -rx; x <= rx; x += 1) {
      const angle = Math.floor(((Math.atan2(y, x) + Math.PI) / (Math.PI * 2)) * 16) % 16;
      const d = (x / rx) ** 2 + (y / ry) ** 2;
      if (d > (wobble[angle] ?? 1)) continue;
      const light = (-x / rx) * 0.45 + (-y / ry) * 0.65 + lightBias + bayer(cx + x, cy + y) * 0.55;
      p.px(cx + x, cy + y, light > 0.42 ? c.light : light < -0.3 ? c.dark : c.mid);
    }
  }
}

/** Japanese cedar (sugi): straight trunk, stacked conical foliage. */
function cedar(p: PixelCanvas, r: Rand, x: number, base: number, height: number, width: number, c: Foliage, bark: [number, number], trunkWidth: number): void {
  const top = base - height;
  for (let y = top + 10; y < base; y += 1) {
    const flare = y > base - 6 ? Math.floor((y - (base - 6)) / 2) : 0;
    p.rect(x - trunkWidth / 2 - flare, y, trunkWidth + flare * 2, 1, bark[1]);
    p.rect(x - trunkWidth / 2 - flare + 1, y, Math.max(1, Math.floor(trunkWidth / 3)), 1, bark[0]);
  }
  const tiers = Math.max(3, Math.floor(height / 26));
  for (let i = 0; i < tiers; i += 1) {
    const t = i / (tiers - 1);
    const cy = top + 8 + t * height * 0.62;
    const w = 3 + width * (0.25 + 0.75 * t);
    blob(p, r, x + (r() - 0.5) * 4, cy, Math.round(w / 2), Math.round(5 + t * 6), c, 0.1 - t * 0.2);
  }
}

function groundStrip(p: PixelCanvas, r: Rand, y: number, soil: number, grass: Foliage, speck: number): void {
  p.rect(WORLD.x, y, WORLD.width, WORLD.y + WORLD.height - y, soil);
  for (let x = WORLD.x; x < WORLD.x + WORLD.width; x += 1) {
    const tuft = r() < 0.35 ? 1 + Math.floor(r() * 3) : 0;
    p.rect(x, y - tuft, 1, 3 + tuft, (x * 7) % 5 === 0 ? grass.light : grass.mid);
    p.px(x, y + 3, grass.dark);
    if (r() < 0.12) p.px(x, y + 5 + Math.floor(r() * 40), speck);
    if (r() < 0.04) p.rect(x, y + 6 + Math.floor(r() * 36), 2 + Math.floor(r() * 3), 1, grass.dark);
    if (r() < 0.006) p.px(x, y - 1 - Math.floor(r() * 2), 0xc9b98a); // pale wildflower
  }
}

export function paintSkyObjects(): PixelCanvas {
  const p = layer();
  const r = rng(11);
  for (let i = 0; i < 260; i += 1) {
    const x = Math.floor(r() * 900) - 150;
    const y = Math.floor(r() * 170) - 100;
    p.px(x, y, r() < 0.12 ? 0xe6ddc7 : 0x8ea2b0, 0.35 + r() * 0.65);
    if (r() < 0.04) {
      p.px(x - 1, y, 0x8ea2b0, 0.4);
      p.px(x + 1, y, 0x8ea2b0, 0.4);
      p.px(x, y - 1, 0x8ea2b0, 0.4);
      p.px(x, y + 1, 0x8ea2b0, 0.4);
    }
  }
  // Moon with a quantised halo.
  const mx = 392;
  const my = 22;
  for (let y = -26; y <= 26; y += 1) {
    for (let x = -26; x <= 26; x += 1) {
      const d = Math.hypot(x, y);
      if (d <= 9) p.px(mx + x, my + y, d > 7.6 || (x > 2 && y < 1 && (x + y) % 5 === 0) ? 0xc9c2ad : 0xece4cf);
      else if (d < 26 && bayer(x, y) + 0.5 < (1 - d / 26) * 0.55) p.px(mx + x, my + y, 0x6f8494, 0.5);
    }
  }
  return p;
}

export function paintMountains(): PixelCanvas {
  const p = layer();
  const ridge = (x: number, f: number, phase: number): number =>
    Math.sin(x * 0.011 * f + phase) * 18 + Math.sin(x * 0.031 * f + phase * 2) * 7 + Math.sin(x * 0.073 * f) * 2;
  for (let x = WORLD.x; x < WORLD.x + WORLD.width; x += 1) {
    const back = Math.round(70 + ridge(x, 1, 0.4));
    p.span(x, x, back, 0x7f97a0);
    p.rect(x, back + 1, 1, 260 - back, 0x5f7a84);
    const front = Math.round(98 + ridge(x + 400, 1.6, 2.1) * 0.7);
    p.rect(x, front, 1, 260 - front, 0x4b6670);
    if (bayer(x, front) > 0.1) p.px(x, front, 0x6d8790);
  }
  return p;
}

export function paintFarForest(): PixelCanvas {
  const p = layer();
  const r = rng(23);
  const c = { dark: 0x2f4a40, mid: 0x3b5a4c, light: 0x4d6e5a };
  p.rect(WORLD.x, 132, WORLD.width, 140, c.dark);
  for (let x = WORLD.x; x < WORLD.x + WORLD.width; x += 7 + Math.floor(r() * 8)) {
    const h = 40 + r() * 34;
    const base = 138 + r() * 6;
    for (let y = 0; y < h; y += 1) {
      const half = Math.round((y / h) * (6 + r() * 1.2));
      p.span(x - half, x + half, base - h + y, (y + x) % 9 === 0 ? c.light : c.mid);
    }
  }
  return p;
}

export function paintMidForest(): PixelCanvas {
  const p = layer();
  const r = rng(37);
  const c = { dark: 0x1a3026, mid: 0x203a2d, light: 0x2f5240 };
  groundStrip(p, r, 146, 0x1c2a22, { dark: 0x15241c, mid: 0x223a2c, light: 0x2f5240 }, 0x2a3a30);
  for (let x = WORLD.x + 10; x < WORLD.x + WORLD.width; x += 26 + Math.floor(r() * 30)) {
    cedar(p, r, x, 148, 150 + r() * 70, 26 + r() * 12, c, [0x3a3028, 0x262019], 4);
  }
  return p;
}

const STONE = { dark: 0x4b4e48, mid: 0x6b6e66, light: 0x8b8d82 };
const VERMILLION = { dark: 0x62261d, mid: 0x9a3d2c, light: 0xc0583c };
const WOOD = { dark: 0x3a2618, mid: 0x5a3a26, light: 0x7a5236 };

function torii(p: PixelCanvas): void {
  const posts = [176, 216];
  for (const x of posts) {
    p.rect(x, 92, 6, 58, VERMILLION.mid);
    p.rect(x, 92, 1, 58, VERMILLION.light);
    p.rect(x + 5, 92, 1, 58, VERMILLION.dark);
    p.rect(x - 1, 144, 8, 6, 0x1b1b1b); // black footing
  }
  // Nuki (tie beam) and gakuzuka (central strut).
  p.rect(169, 102, 61, 4, VERMILLION.mid);
  p.rect(169, 105, 61, 1, VERMILLION.dark);
  p.rect(196, 93, 6, 9, VERMILLION.mid);
  p.rect(197, 95, 4, 5, 0x1b1b1b);
  // Shimaki + kasagi with upturned ends.
  p.rect(166, 90, 67, 3, VERMILLION.mid);
  p.rect(166, 92, 67, 1, VERMILLION.dark);
  for (let x = 160; x <= 238; x += 1) {
    const lift = x < 166 ? Math.ceil((166 - x) / 2) : x > 232 ? Math.ceil((x - 232) / 2) : 0;
    p.rect(x, 86 - lift, 1, 4, 0x1e1a1a);
    p.px(x, 86 - lift, 0x3a3232);
  }
}

function shrine(p: PixelCanvas, r: Rand): void {
  // Stone platform and steps.
  p.rect(232, 140, 72, 10, STONE.mid);
  p.rect(232, 140, 72, 1, STONE.light);
  for (let x = 236; x < 304; x += 9) p.rect(x, 141, 1, 9, STONE.dark);
  p.rect(258, 146, 22, 4, STONE.light);
  p.rect(258, 149, 22, 1, STONE.dark);
  // Body: posts, lattice doors.
  p.rect(242, 114, 54, 26, WOOD.mid);
  p.rect(242, 114, 3, 26, WOOD.dark);
  p.rect(293, 114, 3, 26, WOOD.dark);
  p.rect(252, 118, 34, 22, WOOD.dark);
  for (let x = 254; x < 286; x += 4) p.rect(x, 118, 1, 22, WOOD.mid);
  for (let y = 121; y < 140; y += 5) p.rect(252, y, 34, 1, WOOD.mid);
  p.rect(268, 118, 2, 22, WOOD.light);
  // Roof: curved hip with moss, scanline by scanline.
  for (let row = 0; row <= 22; row += 1) {
    const y = 92 + row;
    const half = Math.round(12 + row * 1.25 + (row > 18 ? (row - 18) * 1.6 : 0));
    const cx = 269;
    p.span(cx - half, cx + half, y, row % 3 === 0 ? 0x3c4640 : 0x2e3530);
    if (row > 2 && r() < 0.8) {
      const mx = cx - half + Math.floor(r() * half * 2);
      p.rect(mx, y, 2 + Math.floor(r() * 4), 1, r() < 0.5 ? 0x456b4c : 0x739a75);
    }
  }
  p.rect(256, 89, 27, 3, 0x22282a);
  p.rect(252, 88, 3, 2, 0x22282a);
  p.rect(284, 88, 3, 2, 0x22282a);
  // Eave underside shadow.
  p.rect(238, 114, 62, 2, 0x1a1e1c);
  // Shimenawa rope and shide.
  for (let x = 246; x <= 292; x += 1) {
    const sag = Math.round(Math.sin(((x - 246) / 46) * Math.PI) * 2);
    p.px(x, 116 + sag, x % 3 === 0 ? 0x8a7546 : 0xb39a5e);
    p.px(x, 117 + sag, 0x8a7546);
  }
  for (const sx of [256, 269, 282]) {
    const zig = [0, 0, 1, 1, 0, 0, 1, 1];
    zig.forEach((dx, i) => p.rect(sx + dx, 119 + i, 2, 1, i % 4 === 3 ? 0xb3a88c : 0xe6ddc7));
  }
}

function stoneLantern(p: PixelCanvas, x: number): void {
  p.rect(x - 6, 144, 13, 6, STONE.mid);
  p.rect(x - 6, 144, 13, 1, STONE.light);
  p.rect(x - 2, 130, 5, 14, STONE.mid);
  p.rect(x - 2, 130, 1, 14, STONE.light);
  p.rect(x - 6, 127, 13, 3, STONE.mid);
  p.rect(x - 4, 119, 9, 8, STONE.mid);
  p.rect(x - 2, 121, 5, 4, 0x1a1712); // fire window (lit by an emissive sprite)
  for (let i = 0; i < 6; i += 1) p.span(x - 7 + i, x + 7 - i, 118 - i, i === 0 ? STONE.dark : STONE.mid);
  p.rect(x - 1, 110, 3, 3, STONE.mid);
  p.px(x, 109, STONE.light);
  p.px(x - 5, 118, 0x456b4c);
  p.px(x + 4, 117, 0x456b4c);
}

function rock(p: PixelCanvas, x: number, y: number, w: number, h: number): void {
  for (let row = 0; row < h; row += 1) {
    const inset = Math.round(((h - row) / h) ** 2 * (w / 3));
    p.span(x + inset, x + w - inset, y + row, row < 2 ? STONE.light : STONE.mid);
  }
  p.span(x + 1, x + w - 1, y + h - 1, STONE.dark);
  p.px(x + Math.round(w / 3), y + 1, 0x739a75);
}

export function paintMainLayer(): PixelCanvas {
  const p = layer();
  const r = rng(53);
  const grass = { dark: 0x24402e, mid: 0x456b4c, light: 0x739a75 };
  groundStrip(p, r, WORLD.ground, 0x2a3a2c, grass, 0x3b5a40);

  // Stone approach from the torii to the shrine steps.
  for (let x = 164; x < 258; x += 8) {
    p.rect(x, 151, 7, 3, STONE.mid);
    p.rect(x, 151, 7, 1, STONE.light);
  }
  // Earthen path that leaves the clearing to the right.
  for (let x = 304; x < WORLD.x + WORLD.width; x += 1) {
    const w = 5 + Math.round(Math.sin(x * 0.05) * 1.5);
    p.rect(x, 151, 1, w, 0x5a4c36);
    if ((x * 13) % 7 === 0) p.px(x, 151 + w, 0x7a6a4c);
  }

  const bark: [number, number] = [0x5a4030, 0x34241a];
  const canopy = { dark: 0x1d3527, mid: 0x2a4a36, light: 0x3d6648 };
  for (const [x, w] of [[30, 14], [118, 18], [392, 16], [540, 20], [690, 15], [840, 19], [990, 16]] as const) {
    cedar(p, r, x, 151, 260, 54, canopy, bark, w);
  }

  torii(p);
  shrine(p, r);
  stoneLantern(p, 330);
  rock(p, 222, 142, 11, 8);
  rock(p, 345, 144, 9, 6);
  rock(p, 470, 143, 14, 8);
  // Ferns along the clearing edge.
  for (const fx of [150, 236, 352, 420, 505, 610]) blob(p, r, fx, 147, 6, 4, grass, 0.2);
  return p;
}

export function paintForeground(): PixelCanvas {
  const p = layer();
  const r = rng(71);
  const c = { dark: 0x0b120e, mid: 0x111d16, light: 0x1b2c21 };
  for (const [x, y, rx, ry] of [
    [60, 196, 70, 46],
    [190, 206, 50, 40],
    [300, 200, 40, 34],
    [380, 202, 56, 44],
    [470, 196, 60, 46],
    [560, 204, 48, 40],
    [640, 198, 60, 42],
    [800, 200, 66, 46],
  ] as const) {
    blob(p, r, x, y, rx, ry, c, -0.1);
  }
  // Overhanging branches with hanging leaves.
  for (const [x, len] of [[130, 120], [420, 140], [700, 120]] as const) {
    for (let i = 0; i < len; i += 1) p.rect(x + i, -10 + Math.round(Math.sin(i / 30) * 6 + i * 0.12), 1, 3, 0x0d1410);
    for (let i = 0; i < len; i += 18) blob(p, r, x + i, 6 + i * 0.12, 9, 7, c, -0.1);
  }
  return p;
}

/** Horizontal fog bank: translucent pixel columns quantised to four densities; tinted at runtime. */
export function paintFog(seed: number, y: number, thickness: number): PixelCanvas {
  const p = layer();
  const r = rng(seed);
  const waves = Array.from({ length: 3 }, () => r() * 6);
  for (let x = WORLD.x; x < WORLD.x + WORLD.width; x += 2) {
    const local = thickness * (0.45 + 0.55 * Math.abs(Math.sin(x * 0.013 + (waves[0] ?? 0)) * Math.sin(x * 0.006 + (waves[1] ?? 0))));
    const lift = Math.round(Math.sin(x * 0.021 + (waves[2] ?? 0)) * 3);
    for (let dy = -thickness; dy <= thickness; dy += 1) {
      const density = 1 - Math.abs(dy) / Math.max(1, local);
      if (density > 0) p.rect(x, y + dy + lift, 2, 1, 0xffffff, (Math.ceil(density * 4) / 4) ** 2 * 0.5);
    }
  }
  return p;
}

/** Quantised radial glow — banded rings read as pixel-art light. */
export function paintGlow(radius: number, color: number): PixelCanvas {
  const size = radius * 2 + 1;
  const p = new PixelCanvas(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = Math.hypot(x - radius, y - radius) / radius;
      if (d >= 1) continue;
      const band = Math.ceil((1 - d) * 5) / 5;
      p.px(x, y, color, band * band * 0.38);
    }
  }
  return p;
}

/** A single firefly: hot core with a plus-shaped halo. */
export function paintFirefly(): PixelCanvas {
  const p = new PixelCanvas(3, 3);
  p.px(1, 1, 0xfff3b0);
  for (const [x, y] of [[0, 1], [2, 1], [1, 0], [1, 2]] as const) p.px(x, y, 0xd9c35a, 0.55);
  return p;
}
