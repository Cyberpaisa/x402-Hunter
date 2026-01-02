export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const DUCK_WIDTH = 60;
export const DUCK_HEIGHT = 60;

export const HIT_RADIUS = 50;

export const INITIAL_LIVES = 3;

export const DUCK_COLORS = ['red', 'blue', 'green'] as const;

// Duck type chances (must sum to 1.0)
export const DUCK_TYPE_CHANCES = {
  normal: 0.55,   // 55% - Patos normales (dan puntos)
  powerup: 0.25,  // 25% - Patos dorados (dan salud o rapid fire)
  bad: 0.20,      // 20% - Patos morados (quitan salud si escapan)
};

export const RAPID_FIRE_DURATION = 5000; // 5 seconds in milliseconds
export const POWERUP_HEALTH_CHANCE = 0.4; // 40% chance powerup gives health instead of rapid fire

export const PAYMENT_CONFIG = {
  pricePerGame: '0.10',
  pricePerLife: '0.05',
  priceToContinue: '0.15',
  recipient: '0x209693BC6afC0C5328bA36FAF03c514eaD62d1B0',
  chain: 'avalanche' as const,
};

export const FACILITATOR_URL = 'https://facilitator.ultravioletadao.xyz';

// Set to true to skip payments during development/testing
export const DEV_MODE = true;
