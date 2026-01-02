import { Howl } from 'howler';

type SoundName = 'gunshot' | 'duckHit' | 'duckFall' | 'duckEscape' | 'levelUp' | 'gameOver' | 'victory' | 'click' | 'payment';

const createSound = (src: string, volume: number): Howl | null => {
  try {
    return new Howl({
      src: [src],
      volume,
      onloaderror: () => {
        console.warn(`Sound file not found: ${src}`);
      },
    });
  } catch {
    console.warn(`Failed to create sound: ${src}`);
    return null;
  }
};

const soundEffects: Record<SoundName, Howl | null> = {
  gunshot: createSound('/sounds/gunshot.mp3', 0.5),
  duckHit: createSound('/sounds/duck-hit.mp3', 0.6),
  duckFall: createSound('/sounds/duck-fall.mp3', 0.4),
  duckEscape: createSound('/sounds/duck-escape.mp3', 0.3),
  levelUp: createSound('/sounds/level-up.mp3', 0.6),
  gameOver: createSound('/sounds/game-over.mp3', 0.5),
  victory: createSound('/sounds/victory.mp3', 0.6),
  click: createSound('/sounds/click.mp3', 0.3),
  payment: createSound('/sounds/payment.mp3', 0.5),
};

let muted = false;

export const sounds = {
  play: (sound: SoundName) => {
    if (!muted && soundEffects[sound]) {
      try {
        soundEffects[sound]?.play();
      } catch {
        // Silently fail if sound cannot play
      }
    }
  },
  mute: (value: boolean) => {
    muted = value;
    Object.values(soundEffects).forEach((s) => s?.mute(value));
  },
  isMuted: () => muted,
  toggle: () => {
    muted = !muted;
    Object.values(soundEffects).forEach((s) => s?.mute(muted));
    return muted;
  },
};

export default sounds;
