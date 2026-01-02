type SoundName = 'gunshot' | 'duckHit' | 'duckFall' | 'duckEscape' | 'levelUp' | 'gameOver' | 'victory' | 'click' | 'payment' | 'powerUp';

let audioContext: AudioContext | null = null;
let muted = false;

const getAudioContext = (): AudioContext | null => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.3) => {
  const ctx = getAudioContext();
  if (!ctx || muted) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

const playNoise = (duration: number, volume: number = 0.3) => {
  const ctx = getAudioContext();
  if (!ctx || muted) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);

  noise.buffer = buffer;
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
};

const soundEffects: Record<SoundName, () => void> = {
  gunshot: () => {
    playNoise(0.15, 0.5);
    playTone(150, 0.1, 'square', 0.3);
  },
  duckHit: () => {
    playTone(800, 0.1, 'square', 0.3);
    setTimeout(() => playTone(600, 0.1, 'square', 0.2), 50);
  },
  duckFall: () => {
    playTone(400, 0.3, 'sine', 0.2);
    setTimeout(() => playTone(200, 0.2, 'sine', 0.15), 150);
  },
  duckEscape: () => {
    playTone(300, 0.1, 'square', 0.2);
    setTimeout(() => playTone(400, 0.1, 'square', 0.2), 100);
    setTimeout(() => playTone(500, 0.15, 'square', 0.2), 200);
  },
  levelUp: () => {
    playTone(523, 0.15, 'square', 0.3);
    setTimeout(() => playTone(659, 0.15, 'square', 0.3), 150);
    setTimeout(() => playTone(784, 0.2, 'square', 0.3), 300);
  },
  gameOver: () => {
    playTone(400, 0.3, 'square', 0.3);
    setTimeout(() => playTone(300, 0.3, 'square', 0.3), 300);
    setTimeout(() => playTone(200, 0.5, 'square', 0.3), 600);
  },
  victory: () => {
    playTone(523, 0.15, 'square', 0.3);
    setTimeout(() => playTone(659, 0.15, 'square', 0.3), 150);
    setTimeout(() => playTone(784, 0.15, 'square', 0.3), 300);
    setTimeout(() => playTone(1047, 0.3, 'square', 0.3), 450);
  },
  click: () => {
    playTone(1000, 0.05, 'square', 0.2);
  },
  payment: () => {
    playTone(880, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.3), 100);
  },
  powerUp: () => {
    // Exciting power-up sound - ascending arpeggio
    playTone(440, 0.1, 'sine', 0.4);
    setTimeout(() => playTone(554, 0.1, 'sine', 0.4), 80);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.4), 160);
    setTimeout(() => playTone(880, 0.2, 'sine', 0.5), 240);
  },
};

export const sounds = {
  play: (sound: SoundName) => {
    if (!muted && soundEffects[sound]) {
      try {
        soundEffects[sound]();
      } catch {
        // Silently fail if sound cannot play
      }
    }
  },
  mute: (value: boolean) => {
    muted = value;
  },
  isMuted: () => muted,
  toggle: () => {
    muted = !muted;
    return muted;
  },
};

export default sounds;
