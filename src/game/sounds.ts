import { Howl } from 'howler';

const soundEffects = {
  gunshot: new Howl({
    src: ['/sounds/gunshot.mp3'],
    volume: 0.5,
  }),
  duckHit: new Howl({
    src: ['/sounds/duck-hit.mp3'],
    volume: 0.6,
  }),
  duckFall: new Howl({
    src: ['/sounds/duck-fall.mp3'],
    volume: 0.4,
  }),
  duckEscape: new Howl({
    src: ['/sounds/duck-escape.mp3'],
    volume: 0.3,
  }),
  levelUp: new Howl({
    src: ['/sounds/level-up.mp3'],
    volume: 0.6,
  }),
  gameOver: new Howl({
    src: ['/sounds/game-over.mp3'],
    volume: 0.5,
  }),
  victory: new Howl({
    src: ['/sounds/victory.mp3'],
    volume: 0.6,
  }),
  click: new Howl({
    src: ['/sounds/click.mp3'],
    volume: 0.3,
  }),
  payment: new Howl({
    src: ['/sounds/payment.mp3'],
    volume: 0.5,
  }),
};

let muted = false;

export const sounds = {
  play: (sound: keyof typeof soundEffects) => {
    if (!muted && soundEffects[sound]) {
      soundEffects[sound].play();
    }
  },
  mute: (value: boolean) => {
    muted = value;
    Object.values(soundEffects).forEach((s) => s.mute(value));
  },
  isMuted: () => muted,
  toggle: () => {
    muted = !muted;
    Object.values(soundEffects).forEach((s) => s.mute(muted));
    return muted;
  },
};

export default sounds;
