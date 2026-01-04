export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const DUCK_WIDTH = 60;
export const DUCK_HEIGHT = 60;

export const HIT_RADIUS = 50;

export const INITIAL_LIVES = 3;

export const DUCK_COLORS = ['red', 'blue', 'green'] as const;

// Duck type chances (must sum to 1.0)
export const DUCK_TYPE_CHANCES = {
  normal: 0.60,   // 60% - Patos normales (dan puntos)
  powerup: 0.15,  // 15% - Patos dorados (más raros, se sienten especiales)
  bad: 0.25,      // 25% - Patos morados (más riesgo y tensión)
};

export const RAPID_FIRE_DURATION = 5000; // 5 seconds in milliseconds
export const POWERUP_COOLDOWN = 10000; // 10 seconds between golden duck spawns
// Base health chance is 30%, increases as lives decrease (see getDynamicHealthChance in utils.ts)
export const BASE_HEALTH_CHANCE = 0.3;

// Retry penalty: -10% score per retry, max -30%
export const RETRY_SCORE_PENALTY = 0.10; // 10% per retry
export const MAX_RETRY_PENALTY = 0.30; // Cap at 30%

// Duck Hunt style mechanics
export const DUCK_FLIGHT_TIME = 7000; // 7 seconds before duck is removed
export const DUCK_ESCAPE_TIME = 5000; // After 5 seconds, duck tries to escape upward
export const BAD_DUCK_DASH_TIME = 2000; // Last 2 seconds - bad ducks get erratic
export const DUCK_SPAWN_INTERVAL = 3000; // 3 seconds between duck spawns
export const DUCKS_PER_SPAWN = 2; // Spawn 2 ducks at a time (like original)
export const BULLETS_PER_DUCK = 2; // 2 bullets per duck (so 2 ducks = 4 bullets)

export const PAYMENT_CONFIG = {
  pricePerGame: '0.10',
  pricePerLife: '0.05',
  priceToContinue: '0.15',
  recipient: import.meta.env.VITE_PAYMENT_RECIPIENT || '0x209693BC6afC0C5328bA36FAF03c514eaD62d1B0',
  chain: 'avalanche' as const,
};

export const FACILITATOR_URL = import.meta.env.VITE_FACILITATOR_URL || 'https://facilitator.ultravioletadao.xyz';

// Set to 'false' in production to enable real payments
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
