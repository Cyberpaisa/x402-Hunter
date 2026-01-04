import type { GameLevel } from '../types/game';

export const LEVELS: GameLevel[] = [
  {
    id: 1,
    title: 'Beginner',
    waves: 3,
    ducksPerWave: 4,
    duckSpeed: 2.5,
    bulletsPerWave: 8,
    timePerWave: 20,
    pointsPerDuck: 100,
  },
  {
    id: 2,
    title: 'Easy',
    waves: 4,
    ducksPerWave: 5,
    duckSpeed: 3,
    bulletsPerWave: 10,
    timePerWave: 18,
    pointsPerDuck: 150,
  },
  {
    id: 3,
    title: 'Medium',
    waves: 4,
    ducksPerWave: 6,
    duckSpeed: 3.5,
    bulletsPerWave: 10,
    timePerWave: 16,
    pointsPerDuck: 200,
  },
  {
    id: 4,
    title: 'Hard',
    waves: 5,
    ducksPerWave: 7,
    duckSpeed: 4,
    bulletsPerWave: 12,
    timePerWave: 15,
    pointsPerDuck: 250,
  },
  {
    id: 5,
    title: 'Expert',
    waves: 5,
    ducksPerWave: 8,
    duckSpeed: 4.5,
    bulletsPerWave: 14,
    timePerWave: 15,
    pointsPerDuck: 300,
  },
  {
    id: 6,
    title: 'Master',
    waves: 6,
    ducksPerWave: 10,
    duckSpeed: 5,
    bulletsPerWave: 16,
    timePerWave: 15, // Consistent with Hard/Expert levels
    pointsPerDuck: 500,
  },
];

export const SUCCESS_RATIO = 0.5; // 50% de patos necesarios para pasar
