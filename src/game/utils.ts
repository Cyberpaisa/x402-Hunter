import type { Position, Direction, Duck, DuckState, DuckType, PowerupEffect } from '../types/game';
import { GAME_WIDTH, GAME_HEIGHT, DUCK_WIDTH, DUCK_HEIGHT, DUCK_COLORS, DUCK_TYPE_CHANCES, BASE_HEALTH_CHANCE, INITIAL_LIVES, DUCK_FLIGHT_TIME, DUCK_ESCAPE_TIME, BAD_DUCK_DASH_TIME } from './constants';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function pointDistance(p1: Position, p2: Position): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function getDirection(velocity: Position): Direction {
  const goingUp = velocity.y < 0;
  const goingLeft = velocity.x < 0;

  if (goingUp) {
    return goingLeft ? 'top-left' : 'top-right';
  }
  return goingLeft ? 'left' : 'right';
}

// Determine duck type based on chances
function getDuckType(): DuckType {
  const rand = Math.random();
  if (rand < DUCK_TYPE_CHANCES.normal) {
    return 'normal';
  } else if (rand < DUCK_TYPE_CHANCES.normal + DUCK_TYPE_CHANCES.powerup) {
    return 'powerup';
  }
  return 'bad';
}

// Get color based on duck type
function getDuckColor(duckType: DuckType): 'red' | 'blue' | 'green' | 'golden' | 'purple' {
  switch (duckType) {
    case 'powerup':
      return 'golden';
    case 'bad':
      return 'purple';
    default:
      return DUCK_COLORS[Math.floor(Math.random() * DUCK_COLORS.length)];
  }
}

// Calculate health powerup chance based on current lives
// Lower lives = higher chance of health (30% base, up to 80% at 1 life)
export function getDynamicHealthChance(currentLives: number): number {
  const maxLives = 5;
  const livesRatio = currentLives / maxLives;
  // At 5 lives: 30%, at 3 lives: 50%, at 1 life: 80%
  return BASE_HEALTH_CHANCE + (1 - livesRatio) * 0.5;
}

export function createDuck(speed: number, index: number = 0, _total: number = 1, forcedType: 'powerup' | 'bad' | null = null, currentLives: number = INITIAL_LIVES): Duck {
  // Distribute ducks across different spawn positions
  const spawnSide = index % 3; // 0 = left, 1 = center, 2 = right
  let startX: number;
  let startY: number;

  const margin = DUCK_WIDTH * 2;
  const usableWidth = GAME_WIDTH - margin * 2;

  switch (spawnSide) {
    case 0: // Left side
      startX = margin + Math.random() * (usableWidth * 0.3);
      startY = GAME_HEIGHT - DUCK_HEIGHT - Math.random() * 100;
      break;
    case 1: // Center/bottom
      startX = margin + usableWidth * 0.3 + Math.random() * (usableWidth * 0.4);
      startY = GAME_HEIGHT - DUCK_HEIGHT;
      break;
    case 2: // Right side
      startX = margin + usableWidth * 0.7 + Math.random() * (usableWidth * 0.3);
      startY = GAME_HEIGHT - DUCK_HEIGHT - Math.random() * 100;
      break;
    default:
      startX = Math.random() * (GAME_WIDTH - DUCK_WIDTH * 2) + DUCK_WIDTH;
      startY = GAME_HEIGHT - DUCK_HEIGHT;
  }

  // More varied angles for better movement
  const angle = (Math.random() * 0.8 + 0.1) * Math.PI; // Between 18° and 162° (mostly upward)

  const baseSpeed = 2 + speed * 0.5;
  const speedVariation = 0.7 + Math.random() * 0.6; // 70% to 130% of base speed
  const finalSpeed = baseSpeed * speedVariation;

  // Direction based on spawn position
  let vx: number;
  if (spawnSide === 0) {
    vx = Math.abs(Math.cos(angle) * finalSpeed); // Go right from left
  } else if (spawnSide === 2) {
    vx = -Math.abs(Math.cos(angle) * finalSpeed); // Go left from right
  } else {
    vx = Math.cos(angle) * finalSpeed * (Math.random() > 0.5 ? 1 : -1);
  }

  const vy = -Math.abs(Math.sin(angle) * finalSpeed); // Always go up initially

  const velocity = { x: vx, y: vy };

  // Determine duck type (normal, powerup, or bad)
  const duckType = forcedType || getDuckType();

  // Determine powerup effect at creation time (not when shot)
  // Health chance increases when player has fewer lives
  let powerupEffect: PowerupEffect | undefined;
  if (duckType === 'powerup') {
    const healthChance = getDynamicHealthChance(currentLives);
    powerupEffect = Math.random() < healthChance ? 'health' : 'rapidfire';
  }

  return {
    id: generateId(),
    position: { x: startX, y: startY },
    velocity,
    state: 'flying',
    color: getDuckColor(duckType),
    direction: getDirection(velocity),
    animationFrame: 0,
    duckType,
    powerupEffect,
    spawnTime: Date.now(),
  };
}

export function updateDuckPosition(duck: Duck, deltaTime: number): Duck {
  if (duck.state !== 'flying') return duck;

  const flightTime = Date.now() - duck.spawnTime;

  // Check if duck is trying to escape (after DUCK_ESCAPE_TIME)
  const isTryingToEscape = flightTime >= DUCK_ESCAPE_TIME;

  // Check if bad duck is in "late dash" mode (last 2 seconds)
  const isLateDash = duck.duckType === 'bad' && flightTime >= (DUCK_FLIGHT_TIME - BAD_DUCK_DASH_TIME);

  // Speed multiplier: late dash = 1.5x, escaping = 1.3x
  const speedMultiplier = isLateDash ? 1.5 : (isTryingToEscape ? 1.3 : 1.0);

  let newX = duck.position.x + duck.velocity.x * deltaTime * 60 * speedMultiplier;
  let newY = duck.position.y + duck.velocity.y * deltaTime * 60 * speedMultiplier;
  let newVx = duck.velocity.x;
  let newVy = duck.velocity.y;

  // Horizontal bounds - always bounce
  if (newX <= 0 || newX >= GAME_WIDTH - DUCK_WIDTH) {
    newVx = -newVx;
    newX = Math.max(0, Math.min(GAME_WIDTH - DUCK_WIDTH, newX));
  }

  // Top bound - bounce only if not trying to escape
  if (newY <= 0 && !isTryingToEscape) {
    newVy = Math.abs(newVy) * 0.8;
    newY = 0;
  }

  // Bottom bound - always bounce
  if (newY >= GAME_HEIGHT - DUCK_HEIGHT) {
    newVy = -Math.abs(newVy);
    newY = GAME_HEIGHT - DUCK_HEIGHT;
  }

  // When trying to escape, force upward movement
  if (isTryingToEscape && newVy > -2) {
    newVy = -Math.abs(newVy) - 2; // Ensure strong upward velocity
  }

  // More erratic movement for bad ducks in late dash (20% chance vs 2% normal)
  // Don't change direction randomly when escaping (they should go straight up)
  const directionChangeChance = isLateDash ? 0.20 : (isTryingToEscape ? 0 : 0.02);
  if (Math.random() < directionChangeChance) {
    // Bigger angle changes during late dash
    const angleChange = isLateDash
      ? (Math.random() - 0.5) * 1.5  // Up to 85° change
      : (Math.random() - 0.5) * 0.5; // Normal ~30° change
    const speed = Math.sqrt(newVx * newVx + newVy * newVy);
    const currentAngle = Math.atan2(newVy, newVx);
    newVx = Math.cos(currentAngle + angleChange) * speed;
    newVy = Math.sin(currentAngle + angleChange) * speed;
  }

  const newVelocity = { x: newVx, y: newVy };

  return {
    ...duck,
    position: { x: newX, y: newY },
    velocity: newVelocity,
    direction: getDirection(newVelocity),
    animationFrame: (duck.animationFrame + 1) % 3,
  };
}

export function updateFallingDuck(duck: Duck, deltaTime: number): Duck {
  if (duck.state !== 'falling') return duck;

  const gravity = 15;
  const newY = duck.position.y + gravity * deltaTime * 60;

  // When shot duck hits the ground, it's DEAD not escaped
  if (newY >= GAME_HEIGHT) {
    return { ...duck, state: 'dead' as DuckState };
  }

  return {
    ...duck,
    position: { ...duck.position, y: newY },
    animationFrame: (duck.animationFrame + 1) % 2,
  };
}

export function checkDuckEscaped(duck: Duck): boolean {
  return duck.position.y <= -DUCK_HEIGHT && duck.state === 'flying';
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
