export interface Position {
  x: number;
  y: number;
}

// Duck types: normal (points), powerup (health/rapid fire), bad (damage)
export type DuckType = 'normal' | 'powerup' | 'bad';
export type PowerupEffect = 'health' | 'rapidfire';

export interface Duck {
  id: string;
  position: Position;
  velocity: Position;
  state: DuckState;
  color: 'red' | 'blue' | 'green' | 'golden' | 'purple';
  direction: Direction;
  animationFrame: number;
  duckType: DuckType;
  powerupEffect?: PowerupEffect; // Only for powerup ducks
  spawnTime: number; // Timestamp when duck appeared (for individual timeout)
}

export type DuckState = 'flying' | 'shot' | 'falling' | 'escaped';
export type Direction = 'left' | 'right' | 'top-left' | 'top-right';

export type GameState = 'menu' | 'payment' | 'playing' | 'paused' | 'wave-end' | 'game-over' | 'victory';

export interface GameLevel {
  id: number;
  title: string;
  waves: number;
  ducksPerWave: number;
  duckSpeed: number;
  bulletsPerWave: number;
  timePerWave: number;
  pointsPerDuck: number;
}

export interface GameStats {
  score: number;
  level: number;
  wave: number;
  bullets: number;
  ducksShot: number;
  ducksMissed: number;
  lives: number;
  totalDucksShot: number;
  rapidFireUntil: number;
  ducksSpawned: number; // Track how many ducks have been spawned in current wave
}

export interface PaymentConfig {
  pricePerGame: string;
  pricePerLife: string;
  priceToContinue: string;
  recipient: string;
}
