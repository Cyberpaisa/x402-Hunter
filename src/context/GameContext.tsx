import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type { Duck, GameState, GameStats, GameLevel } from '../types/game';
import type { DogState } from '../components/Dog';
import { LEVELS, SUCCESS_RATIO } from '../game/levels';
import { INITIAL_LIVES, HIT_RADIUS, RAPID_FIRE_DURATION, DUCK_FLIGHT_TIME, DUCKS_PER_SPAWN, BULLETS_PER_DUCK, POWERUP_COOLDOWN, DUCK_TYPE_CHANCES } from '../game/constants';
import { createDuck, updateDuckPosition, updateFallingDuck, pointDistance, checkDuckEscaped } from '../game/utils';
import sounds from '../game/sounds';

interface GameContextState {
  gameState: GameState;
  stats: GameStats;
  ducks: Duck[];
  currentLevel: GameLevel;
  timeRemaining: number;
  isPaid: boolean;
  walletConnected: boolean;
  walletAddress: string | null;
  dogState: DogState;
  dogDucksHeld: number;
}

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SET_PAID'; paid: boolean }
  | { type: 'SET_WALLET'; address: string | null }
  | { type: 'SHOOT'; x: number; y: number }
  | { type: 'UPDATE_DUCKS'; deltaTime: number }
  | { type: 'SPAWN_DUCKS' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'END_WAVE' }
  | { type: 'NEXT_WAVE' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'GAME_OVER' }
  | { type: 'VICTORY' }
  | { type: 'BUY_LIFE' }
  | { type: 'CONTINUE_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_TIME'; time: number }
  | { type: 'GO_TO_MENU' }
  | { type: 'REQUEST_PAYMENT' }
  | { type: 'SET_DOG_STATE'; dogState: DogState; ducksHeld?: number };

const initialStats: GameStats = {
  score: 0,
  level: 1,
  wave: 1,
  bullets: DUCKS_PER_SPAWN * BULLETS_PER_DUCK,
  ducksShot: 0,
  ducksMissed: 0,
  lives: INITIAL_LIVES,
  totalDucksShot: 0,
  rapidFireUntil: 0,
  ducksSpawned: 0,
  badDucksEscaped: 0,
  gameOverReason: null,
  lastPowerupSpawn: 0,
};

const initialState: GameContextState = {
  gameState: 'menu',
  stats: initialStats,
  ducks: [],
  currentLevel: LEVELS[0],
  timeRemaining: LEVELS[0].timePerWave,
  isPaid: false,
  walletConnected: false,
  walletAddress: null,
  dogState: 'hidden',
  dogDucksHeld: 0,
};

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_PAID':
      return { ...state, isPaid: action.paid };

    case 'SET_WALLET':
      return {
        ...state,
        walletConnected: !!action.address,
        walletAddress: action.address,
      };

    case 'REQUEST_PAYMENT':
      return { ...state, gameState: 'payment' };

    case 'START_GAME': {
      const level = LEVELS[0];
      return {
        ...state,
        gameState: 'playing',
        stats: {
          ...initialStats,
          bullets: DUCKS_PER_SPAWN * BULLETS_PER_DUCK,
          ducksSpawned: 0,
        },
        ducks: [],
        currentLevel: level,
        timeRemaining: level.timePerWave,
        dogState: 'hidden',
      };
    }

    case 'SPAWN_DUCKS': {
      const totalDucks = state.currentLevel.ducksPerWave;
      const alreadySpawned = state.stats.ducksSpawned;
      const remaining = totalDucks - alreadySpawned;

      // Don't spawn if all ducks already spawned
      if (remaining <= 0) return state;

      // Spawn 2 ducks at a time (like original Duck Hunt)
      const toSpawn = Math.min(DUCKS_PER_SPAWN, remaining);
      const newDucks: Duck[] = [];
      const now = Date.now();
      const canSpawnPowerup = now - state.stats.lastPowerupSpawn >= POWERUP_COOLDOWN;
      let spawnedPowerup = false;

      for (let i = 0; i < toSpawn; i++) {
        const duckIndex = alreadySpawned + i;

        // Determine duck type with powerup cooldown
        let forcedType: 'powerup' | 'bad' | null = null;
        const rand = Math.random();

        if (rand < DUCK_TYPE_CHANCES.normal) {
          forcedType = null; // normal
        } else if (rand < DUCK_TYPE_CHANCES.normal + DUCK_TYPE_CHANCES.powerup) {
          // Only allow powerup if cooldown has passed and we haven't spawned one this batch
          if (canSpawnPowerup && !spawnedPowerup) {
            forcedType = 'powerup';
            spawnedPowerup = true;
          } else {
            forcedType = null; // Convert to normal if on cooldown
          }
        } else {
          forcedType = 'bad';
        }

        // Pass currentLives so powerup can adjust health chance
        newDucks.push(createDuck(state.currentLevel.duckSpeed, duckIndex, totalDucks, forcedType, state.stats.lives));
      }

      return {
        ...state,
        ducks: [...state.ducks, ...newDucks],
        stats: {
          ...state.stats,
          ducksSpawned: alreadySpawned + toSpawn,
          bullets: toSpawn * BULLETS_PER_DUCK,
          lastPowerupSpawn: spawnedPowerup ? now : state.stats.lastPowerupSpawn,
        },
        // Dog sniffs when new ducks appear (only on first spawn of wave)
        dogState: alreadySpawned === 0 ? 'sniffing' : state.dogState,
      };
    }

    case 'SHOOT': {
      // Check if rapid fire is active (unlimited bullets during power-up)
      const isRapidFire = Date.now() < state.stats.rapidFireUntil;
      if (state.stats.bullets <= 0 && !isRapidFire) return state;
      if (state.gameState !== 'playing') return state;

      const clickPos = { x: action.x, y: action.y };
      let ducksHit = 0;
      let healthPowerup = false;
      let rapidFirePowerup = false;
      let badDucksHit = 0;

      const updatedDucks = state.ducks.map((duck) => {
        if (duck.state === 'flying') {
          const duckCenter = {
            x: duck.position.x + 30,
            y: duck.position.y + 30,
          };
          if (pointDistance(clickPos, duckCenter) < HIT_RADIUS) {
            ducksHit++;

            // Handle different duck types
            if (duck.duckType === 'powerup') {
              // Use the pre-determined powerup effect
              if (duck.powerupEffect === 'health') {
                healthPowerup = true;
                sounds.play('healthUp');
              } else {
                rapidFirePowerup = true;
                sounds.play('powerUp');
              }
            } else if (duck.duckType === 'bad') {
              badDucksHit++;
              sounds.play('duckHit');
            } else {
              sounds.play('duckHit');
            }
            return { ...duck, state: 'shot' as const };
          }
        }
        return duck;
      });

      if (ducksHit === 0) {
        sounds.play('gunshot');
      }

      // Calculate effects based on duck types hit
      let newRapidFireUntil = state.stats.rapidFireUntil;
      let newLives = state.stats.lives;
      let bonusPoints = 0;

      if (healthPowerup) {
        // Power-up gives extra life
        newLives = Math.min(newLives + 1, 5); // Max 5 lives
        bonusPoints += 300;
      }

      if (rapidFirePowerup) {
        // Power-up gives rapid fire
        newRapidFireUntil = Math.max(state.stats.rapidFireUntil, Date.now()) + RAPID_FIRE_DURATION;
        bonusPoints += 500;
      }

      if (badDucksHit > 0) {
        // Bad ducks give small reward when shot (+50 pts instead of normal points)
        // Subtract the normal points they would get, add 50 per bad duck
        bonusPoints += badDucksHit * (50 - state.currentLevel.pointsPerDuck);
      }

      return {
        ...state,
        stats: {
          ...state.stats,
          bullets: isRapidFire ? state.stats.bullets : state.stats.bullets - 1,
          ducksShot: state.stats.ducksShot + ducksHit,
          totalDucksShot: state.stats.totalDucksShot + ducksHit,
          score: Math.max(0, state.stats.score + ducksHit * state.currentLevel.pointsPerDuck + bonusPoints),
          rapidFireUntil: newRapidFireUntil,
          lives: newLives,
        },
        ducks: updatedDucks,
        // Dog only appears at END_WAVE, not during gameplay
      };
    }

    case 'UPDATE_DUCKS': {
      const now = Date.now();
      const updatedDucks = state.ducks.map((duck) => {
        if (duck.state === 'flying') {
          // Check individual duck timeout (Duck Hunt style)
          const flightTime = now - duck.spawnTime;
          if (flightTime >= DUCK_FLIGHT_TIME) {
            sounds.play('duckEscape');
            return { ...duck, state: 'escaped' as const };
          }

          const updated = updateDuckPosition(duck, action.deltaTime);
          if (checkDuckEscaped(updated)) {
            sounds.play('duckEscape');
            return { ...updated, state: 'escaped' as const };
          }
          return updated;
        }
        if (duck.state === 'shot') {
          return { ...duck, state: 'falling' as const };
        }
        if (duck.state === 'falling') {
          return updateFallingDuck(duck, action.deltaTime);
        }
        return duck;
      });

      return { ...state, ducks: updatedDucks };
    }

    case 'UPDATE_TIME': {
      return { ...state, timeRemaining: action.time };
    }

    case 'END_WAVE': {
      const escapedDucks = state.ducks.filter((d) => d.state === 'escaped' || d.state === 'flying');
      const shotDucks = state.ducks.filter((d) => d.state === 'falling' || d.state === 'shot' || d.state === 'dead');
      const newMissed = state.stats.ducksMissed + escapedDucks.length;

      // Bad ducks that escape damage the player
      const escapedBadDucks = escapedDucks.filter((d) => d.duckType === 'bad').length;
      const damageFromBadDucks = escapedBadDucks; // Each bad duck that escapes removes 1 life
      const newLives = Math.max(0, state.stats.lives - damageFromBadDucks);

      // Play damage sound if bad ducks escaped
      if (escapedBadDucks > 0) {
        sounds.play('damage');
      }

      // Dog reaction at end of wave:
      // - Celebrates if ducks were shot and none escaped
      // - Laughs if any ducks escaped
      let dogReaction: DogState = 'hidden';
      let ducksHeld = 0;

      if (escapedDucks.length > 0) {
        dogReaction = 'laughing';
      } else if (shotDucks.length > 0) {
        dogReaction = 'celebrating';
        ducksHeld = shotDucks.length;
      }

      // Check if game over from bad ducks
      if (newLives <= 0) {
        sounds.play('gameOver');
        return {
          ...state,
          gameState: 'game-over',
          stats: {
            ...state.stats,
            ducksMissed: newMissed,
            lives: 0,
            badDucksEscaped: state.stats.badDucksEscaped + escapedBadDucks,
            gameOverReason: 'bad_ducks',
          },
          dogState: 'laughing',
          dogDucksHeld: 0,
        };
      }

      return {
        ...state,
        gameState: 'wave-end',
        stats: {
          ...state.stats,
          ducksMissed: newMissed,
          lives: newLives,
          badDucksEscaped: state.stats.badDucksEscaped + escapedBadDucks,
        },
        dogState: dogReaction,
        dogDucksHeld: ducksHeld,
      };
    }

    case 'NEXT_WAVE': {
      const nextWave = state.stats.wave + 1;

      // Check if current wave was successful (per-wave accuracy check)
      const requiredDucks = Math.ceil(state.currentLevel.ducksPerWave * SUCCESS_RATIO);
      const waveSuccess = state.stats.ducksShot >= requiredDucks;

      // If wave failed, repeat it (no life penalty)
      if (!waveSuccess) {
        sounds.play('damage');
        return {
          ...state,
          gameState: 'playing',
          stats: {
            ...state.stats,
            ducksShot: 0,
            ducksSpawned: 0,
            bullets: DUCKS_PER_SPAWN * BULLETS_PER_DUCK,
          },
          ducks: [],
          timeRemaining: state.currentLevel.timePerWave,
          dogState: 'hidden',
        };
      }

      // Wave successful - check if level complete
      if (nextWave > state.currentLevel.waves) {
        sounds.play('levelUp');
        return { ...state, gameState: 'wave-end' };
      }

      return {
        ...state,
        gameState: 'playing',
        stats: {
          ...state.stats,
          wave: nextWave,
          bullets: DUCKS_PER_SPAWN * BULLETS_PER_DUCK,
          ducksShot: 0,
          ducksSpawned: 0,
        },
        ducks: [],
        timeRemaining: state.currentLevel.timePerWave,
        dogState: 'hidden',
      };
    }

    case 'NEXT_LEVEL': {
      const nextLevelIndex = state.stats.level;
      if (nextLevelIndex >= LEVELS.length) {
        sounds.play('victory');
        return { ...state, gameState: 'victory' };
      }

      const nextLevel = LEVELS[nextLevelIndex];
      return {
        ...state,
        gameState: 'playing',
        stats: {
          ...state.stats,
          level: nextLevelIndex + 1,
          wave: 1,
          bullets: DUCKS_PER_SPAWN * BULLETS_PER_DUCK,
          ducksShot: 0,
          ducksMissed: 0,
          ducksSpawned: 0,
        },
        currentLevel: nextLevel,
        ducks: [],
        timeRemaining: nextLevel.timePerWave,
        dogState: 'hidden',
      };
    }

    case 'BUY_LIFE': {
      // Add a life and restart the current wave
      return {
        ...state,
        gameState: 'playing',
        stats: {
          ...state.stats,
          lives: state.stats.lives + 1,
          wave: 1,
          ducksShot: 0,
          ducksSpawned: 0,
          bullets: DUCKS_PER_SPAWN * BULLETS_PER_DUCK,
        },
        ducks: [],
        timeRemaining: state.currentLevel.timePerWave,
        dogState: 'hidden',
      };
    }

    case 'CONTINUE_GAME': {
      return {
        ...state,
        gameState: 'playing',
        stats: {
          ...state.stats,
          lives: INITIAL_LIVES,
          wave: 1,
          bullets: DUCKS_PER_SPAWN * BULLETS_PER_DUCK,
          ducksShot: 0,
          ducksSpawned: 0,
        },
        ducks: [],
        timeRemaining: state.currentLevel.timePerWave,
        dogState: 'hidden',
      };
    }

    case 'PAUSE':
      return { ...state, gameState: 'paused' };

    case 'RESUME':
      return { ...state, gameState: 'playing' };

    case 'GAME_OVER':
      sounds.play('gameOver');
      return { ...state, gameState: 'game-over' };

    case 'VICTORY':
      sounds.play('victory');
      return { ...state, gameState: 'victory' };

    case 'GO_TO_MENU':
      return { ...state, gameState: 'menu' };

    case 'RESET_GAME':
      return {
        ...initialState,
        isPaid: state.isPaid,
        walletConnected: state.walletConnected,
        walletAddress: state.walletAddress,
      };

    case 'SET_DOG_STATE':
      return {
        ...state,
        dogState: action.dogState,
        dogDucksHeld: action.ducksHeld ?? 0,
      };

    default:
      return state;
  }
}

interface GameContextValue extends GameContextState {
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  shoot: (x: number, y: number) => void;
  pause: () => void;
  resume: () => void;
  nextWave: () => void;
  nextLevel: () => void;
  resetGame: () => void;
  buyLife: () => void;
  continueGame: () => void;
  setWallet: (address: string | null) => void;
  setPaid: (paid: boolean) => void;
  requestPayment: () => void;
  goToMenu: () => void;
  setDogState: (dogState: DogState, ducksHeld?: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const waveStartTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
    waveStartTimeRef.current = performance.now();
    lastSpawnTimeRef.current = 0; // Reset to 0 so game loop spawns immediately
  }, []);

  const shoot = useCallback((x: number, y: number) => {
    dispatch({ type: 'SHOOT', x, y });
  }, []);

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const nextWave = useCallback(() => {
    dispatch({ type: 'NEXT_WAVE' });
    waveStartTimeRef.current = performance.now();
    lastSpawnTimeRef.current = 0;
  }, []);
  const nextLevel = useCallback(() => {
    dispatch({ type: 'NEXT_LEVEL' });
    waveStartTimeRef.current = performance.now();
    lastSpawnTimeRef.current = 0;
  }, []);
  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);
  const buyLife = useCallback(() => {
    dispatch({ type: 'BUY_LIFE' });
    waveStartTimeRef.current = performance.now();
    lastSpawnTimeRef.current = 0;
  }, []);
  const continueGame = useCallback(() => {
    dispatch({ type: 'CONTINUE_GAME' });
    waveStartTimeRef.current = performance.now();
    lastSpawnTimeRef.current = 0;
  }, []);
  const setWallet = useCallback((address: string | null) => dispatch({ type: 'SET_WALLET', address }), []);
  const setPaid = useCallback((paid: boolean) => dispatch({ type: 'SET_PAID', paid }), []);
  const requestPayment = useCallback(() => dispatch({ type: 'REQUEST_PAYMENT' }), []);
  const goToMenu = useCallback(() => dispatch({ type: 'GO_TO_MENU' }), []);
  const setDogState = useCallback((dogState: DogState, ducksHeld?: number) => {
    dispatch({ type: 'SET_DOG_STATE', dogState, ducksHeld });
  }, []);

  // Refs to access current state values in game loop without causing re-renders
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (state.gameState !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Update duck positions
      dispatch({ type: 'UPDATE_DUCKS', deltaTime });

      // Update timer
      const elapsed = (currentTime - waveStartTimeRef.current) / 1000;
      const timePerWave = stateRef.current.currentLevel.timePerWave;
      const remaining = Math.max(0, timePerWave - elapsed);
      dispatch({ type: 'UPDATE_TIME', time: remaining });

      // Check current state
      const currentDucks = stateRef.current.ducks;
      const ducksSpawned = stateRef.current.stats.ducksSpawned;
      const totalDucksInWave = stateRef.current.currentLevel.ducksPerWave;

      const activeDucks = currentDucks.filter((d) => d.state === 'flying' || d.state === 'shot' || d.state === 'falling').length;
      const moreDucksToSpawn = ducksSpawned < totalDucksInWave;

      // Spawn next batch ONLY when all current ducks are completely done (not flying, not falling)
      // This ensures we wait for the player to deal with current ducks before spawning more
      const shouldSpawnMore = moreDucksToSpawn && activeDucks === 0;

      if (shouldSpawnMore) {
        // Add a small delay before spawning to let animations finish
        const timeSinceLastSpawn = currentTime - lastSpawnTimeRef.current;
        if (timeSinceLastSpawn >= 500) { // 500ms delay between batches
          lastSpawnTimeRef.current = currentTime;
          dispatch({ type: 'SPAWN_DUCKS' });
        }
      }

      // End wave conditions - only when ALL ducks are spawned AND dealt with
      const allDucksSpawned = ducksSpawned >= totalDucksInWave;
      const allDucksDone = allDucksSpawned && activeDucks === 0;
      const timeUp = remaining <= 0;

      // Don't end wave for "out of bullets" if there are more ducks to spawn
      // Player gets new bullets with each spawn batch
      if (allDucksDone || timeUp) {
        dispatch({ type: 'END_WAVE' });
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = 0;
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [state.gameState]);

  const value: GameContextValue = {
    ...state,
    dispatch,
    startGame,
    shoot,
    pause,
    resume,
    nextWave,
    nextLevel,
    resetGame,
    buyLife,
    continueGame,
    setWallet,
    setPaid,
    requestPayment,
    goToMenu,
    setDogState,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
