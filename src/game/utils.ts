import type { Position, Direction, Duck, DuckState, DuckType, PowerupEffect } from '../types/game';
import { GAME_WIDTH, GAME_HEIGHT, DUCK_WIDTH, DUCK_HEIGHT, DUCK_COLORS, DUCK_TYPE_CHANCES, POWERUP_HEALTH_CHANCE } from './constants';

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

export function createDuck(speed: number, index: number = 0, _total: number = 1, forcedType: 'powerup' | 'bad' | null = null): Duck {
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
  let powerupEffect: PowerupEffect | undefined;
  if (duckType === 'powerup') {
    powerupEffect = Math.random() < POWERUP_HEALTH_CHANCE ? 'health' : 'rapidfire';
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

  let newX = duck.position.x + duck.velocity.x * deltaTime * 60;
  let newY = duck.position.y + duck.velocity.y * deltaTime * 60;
  let newVx = duck.velocity.x;
  let newVy = duck.velocity.y;

  if (newX <= 0 || newX >= GAME_WIDTH - DUCK_WIDTH) {
    newVx = -newVx;
    newX = Math.max(0, Math.min(GAME_WIDTH - DUCK_WIDTH, newX));
  }

  if (newY <= 0) {
    newVy = Math.abs(newVy) * 0.8;
    newY = 0;
  }

  if (newY >= GAME_HEIGHT - DUCK_HEIGHT) {
    newVy = -Math.abs(newVy);
    newY = GAME_HEIGHT - DUCK_HEIGHT;
  }

  if (Math.random() < 0.02) {
    const angleChange = (Math.random() - 0.5) * 0.5;
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
