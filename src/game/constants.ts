export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const DUCK_WIDTH = 60;
export const DUCK_HEIGHT = 60;

export const HIT_RADIUS = 50;

export const INITIAL_LIVES = 3;

export const DUCK_COLORS = ['red', 'blue', 'green'] as const;

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
