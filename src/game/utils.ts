import type { Position, Direction, Duck, DuckState } from '../types/game';
import { GAME_WIDTH, GAME_HEIGHT, DUCK_WIDTH, DUCK_HEIGHT, DUCK_COLORS } from './constants';

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

export function createDuck(speed: number): Duck {
  const startX = Math.random() * (GAME_WIDTH - DUCK_WIDTH * 2) + DUCK_WIDTH;
  const angle = Math.random() * Math.PI - Math.PI / 2;

  const baseSpeed = 2 + speed * 0.5;
  const vx = Math.cos(angle) * baseSpeed * (Math.random() > 0.5 ? 1 : -1);
  const vy = -Math.abs(Math.sin(angle) * baseSpeed);

  const velocity = { x: vx, y: vy };

  return {
    id: generateId(),
    position: { x: startX, y: GAME_HEIGHT - DUCK_HEIGHT },
    velocity,
    state: 'flying',
    color: DUCK_COLORS[Math.floor(Math.random() * DUCK_COLORS.length)],
    direction: getDirection(velocity),
    animationFrame: 0,
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

  if (newY >= GAME_HEIGHT) {
    return { ...duck, state: 'escaped' as DuckState };
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
