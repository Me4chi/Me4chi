import { Sprite, type Texture } from 'pixi.js';
import type { PoseId } from '../animation/types';
import { paintMap } from '../engine/pixel';

/**
 * The protagonist: 14×24 world px, side view authored facing right.
 * Sprites are assembled from head (7 rows) + body (11 rows) + legs (6 rows).
 */
const PALETTE: Readonly<Record<string, number>> = {
  k: 0x10151c, // outline
  h: 0x1d1c26, // hair
  s: 0xe6c9a8, // skin
  S: 0xb98f73, // skin shade
  e: 0x10151c, // eye
  w: 0xe6ddc7, // parchment scarf
  W: 0xb3a88c, // scarf shade
  c: 0x456b4c, // moss cloak
  C: 0x203a2d, // cloak shade
  r: 0xa8433b, // red cord
  p: 0x2a2f3a, // trousers
  b: 0x1a1c22, // boots
};

const HEADS = {
  side: [
    '.....kkkk.....',
    '....khhhhk....',
    '...khhhhhhk...',
    '...khhhhsssk..',
    '...khhhssesk..',
    '...khhhsssSk..',
    '....khhSSSk...',
  ],
  bow: [
    '..............',
    '.....kkkk.....',
    '....khhhhk....',
    '...khhhhhhk...',
    '...khhhhhhhk..',
    '...khhhhhssk..',
    '....khhhSSk...',
  ],
  lookUp: [
    '.....kkkk.....',
    '....khhhhkk...',
    '...khhhhhssk..',
    '...khhhhsesk..',
    '...khhhssssk..',
    '...khhhsSSk...',
    '....khhkkk....',
  ],
  front: [
    '.....kkkk.....',
    '....khhhhk....',
    '...khhhhhhk...',
    '...khsssshk...',
    '...khsesehk...',
    '...khsSSshk...',
    '....khSShk....',
  ],
} as const;

const BODY = [
  '....kwwwwwk...',
  '...kwwwwWWWk..',
  '..kcccwcccck..',
  '..kcccccccck..',
  '..kccccccsck..',
  '..kcCcccccck..',
  '..kcCccccrck..',
  '..kcCcccccck..',
  '..kcCCcccCck..',
  '...kCCcccCk...',
  '...kCCCCCCk...',
] as const;

/** Wind catches the scarf tail — the idle loop's only change. */
const BODY_WIND = [BODY[0], '.kWWwwwWWWk...', ...BODY.slice(2)] as const;

const LEGS = {
  stand: ['....kppkppk...', '....kppkppk...', '....kppkppk...', '....kbbkbbk...', '...kbbbkbbbk..', '...kkkk.kkkk..'],
  stride: ['...kppkkppk...', '..kppk..kppk..', '.kppk....kppk.', '.kbbk....kbbk.', 'kbbbk....kbbbk', 'kkkk......kkkk'],
  pass: ['....kppkppk...', '....kppkppk...', '....kppkpk....', '....kbbkbbk...', '...kbbbkkk....', '...kkkk.......'],
} as const;

type FrameId = Exclude<PoseId, 'walk'> | 'idleWind' | 'walk0' | 'walk1' | 'walk2' | 'walk3';

function frame(head: readonly string[], legs: readonly string[], body: readonly string[] = BODY): Texture {
  return paintMap([...head, ...body, ...legs], PALETTE).toTexture();
}

/** Distance in world px the character covers per walk frame. */
const STRIDE = 5;

export class Character {
  readonly sprite: Sprite;
  private readonly frames: Record<FrameId, Texture>;

  constructor() {
    this.frames = {
      bow: frame(HEADS.bow, LEGS.stand),
      lookUp: frame(HEADS.lookUp, LEGS.stand),
      idle: frame(HEADS.side, LEGS.stand),
      idleWind: frame(HEADS.side, LEGS.stand, BODY_WIND),
      front: frame(HEADS.front, LEGS.stand),
      walk0: frame(HEADS.side, LEGS.stand),
      walk1: frame(HEADS.side, LEGS.stride),
      walk2: frame(HEADS.side, LEGS.pass),
      walk3: frame(HEADS.side, LEGS.stride),
    };
    this.sprite = new Sprite(this.frames.bow);
    this.sprite.anchor.set(0.5, 1);
  }

  /**
   * Pose and position come from scroll progress (deterministic in both directions);
   * only the scarf flutter of the idle pose runs on wall-clock time.
   */
  update(pose: PoseId, facing: -1 | 0 | 1, x: number, groundY: number, time: number, ambient: boolean): void {
    let texture: Texture;
    if (pose === 'walk') {
      // Walk frame derived from distance travelled, so feet never slide when scrubbing.
      const step = Math.floor(x / STRIDE) % 4;
      texture = this.frames[`walk${step}` as 'walk0' | 'walk1' | 'walk2' | 'walk3'];
    } else if (pose === 'idle' && ambient && Math.sin(time * 1.7) > 0.4) {
      texture = this.frames.idleWind;
    } else {
      texture = this.frames[pose];
    }
    if (this.sprite.texture !== texture) this.sprite.texture = texture;
    this.sprite.scale.x = facing === -1 ? -1 : 1;
    this.sprite.position.set(Math.round(x), groundY);
  }
}
