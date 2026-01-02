import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type { Duck, GameState, GameStats, GameLevel } from '../types/game';
import { LEVELS, SUCCESS_RATIO } from '../game/levels';
import { INITIAL_LIVES, HIT_RADIUS } from '../game/constants';
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
  | { type: 'REQUEST_PAYMENT' };

const initialStats: GameStats = {
  score: 0,
  level: 1,
  wave: 1,
  bullets: 5,
  ducksShot: 0,
  ducksMissed: 0,
  lives: INITIAL_LIVES,
  totalDucksShot: 0,
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
          bullets: level.bulletsPerWave,
        },
        ducks: [],
        currentLevel: level,
        timeRemaining: level.timePerWave,
      };
    }

    case 'SPAWN_DUCKS': {
      const newDucks: Duck[] = [];
      for (let i = 0; i < state.currentLevel.ducksPerWave; i++) {
        newDucks.push(createDuck(state.currentLevel.duckSpeed));
      }
      return { ...state, ducks: newDucks };
    }

    case 'SHOOT': {
      if (state.stats.bullets <= 0 || state.gameState !== 'playing') return state;

      const clickPos = { x: action.x, y: action.y };
      let ducksHit = 0;
      const updatedDucks = state.ducks.map((duck) => {
        if (duck.state === 'flying') {
          const duckCenter = {
            x: duck.position.x + 30,
            y: duck.position.y + 30,
          };
          if (pointDistance(clickPos, duckCenter) < HIT_RADIUS) {
            ducksHit++;
            sounds.play('duckHit');
            return { ...duck, state: 'shot' as const };
          }
        }
        return duck;
      });

      if (ducksHit === 0) {
        sounds.play('gunshot');
      }

      return {
        ...state,
        stats: {
          ...state.stats,
          bullets: state.stats.bullets - 1,
          ducksShot: state.stats.ducksShot + ducksHit,
          totalDucksShot: state.stats.totalDucksShot + ducksHit,
          score: state.stats.score + ducksHit * state.currentLevel.pointsPerDuck,
        },
        ducks: updatedDucks,
      };
    }

    case 'UPDATE_DUCKS': {
      const updatedDucks = state.ducks.map((duck) => {
        if (duck.state === 'flying') {
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
      const escapedDucks = state.ducks.filter((d) => d.state === 'escaped' || d.state === 'flying').length;
      const newMissed = state.stats.ducksMissed + escapedDucks;

      return {
        ...state,
        gameState: 'wave-end',
        stats: {
          ...state.stats,
          ducksMissed: newMissed,
        },
      };
    }

    case 'NEXT_WAVE': {
      const nextWave = state.stats.wave + 1;
      if (nextWave > state.currentLevel.waves) {
        const totalDucks = state.currentLevel.waves * state.currentLevel.ducksPerWave;
        const hitRatio = state.stats.ducksShot / totalDucks;

        if (hitRatio < SUCCESS_RATIO) {
          const newLives = state.stats.lives - 1;
          if (newLives <= 0) {
            sounds.play('gameOver');
            return { ...state, gameState: 'game-over' };
          }
          return {
            ...state,
            stats: { ...state.stats, lives: newLives },
            gameState: 'wave-end',
          };
        }

        sounds.play('levelUp');
        return { ...state, gameState: 'wave-end' };
      }

      return {
        ...state,
        gameState: 'playing',
        stats: {
          ...state.stats,
          wave: nextWave,
          bullets: state.currentLevel.bulletsPerWave,
          ducksShot: 0,
        },
        ducks: [],
        timeRemaining: state.currentLevel.timePerWave,
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
          bullets: nextLevel.bulletsPerWave,
          ducksShot: 0,
          ducksMissed: 0,
        },
        currentLevel: nextLevel,
        ducks: [],
        timeRemaining: nextLevel.timePerWave,
      };
    }

    case 'BUY_LIFE': {
      return {
        ...state,
        stats: {
          ...state.stats,
          lives: state.stats.lives + 1,
        },
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
          bullets: state.currentLevel.bulletsPerWave,
          ducksShot: 0,
        },
        ducks: [],
        timeRemaining: state.currentLevel.timePerWave,
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
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const waveStartTimeRef = useRef<number>(0);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
    waveStartTimeRef.current = performance.now();
    setTimeout(() => dispatch({ type: 'SPAWN_DUCKS' }), 500);
  }, []);

  const shoot = useCallback((x: number, y: number) => {
    dispatch({ type: 'SHOOT', x, y });
  }, []);

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const nextWave = useCallback(() => {
    dispatch({ type: 'NEXT_WAVE' });
    waveStartTimeRef.current = performance.now();
    setTimeout(() => dispatch({ type: 'SPAWN_DUCKS' }), 500);
  }, []);
  const nextLevel = useCallback(() => {
    dispatch({ type: 'NEXT_LEVEL' });
    waveStartTimeRef.current = performance.now();
    setTimeout(() => dispatch({ type: 'SPAWN_DUCKS' }), 500);
  }, []);
  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);
  const buyLife = useCallback(() => dispatch({ type: 'BUY_LIFE' }), []);
  const continueGame = useCallback(() => {
    dispatch({ type: 'CONTINUE_GAME' });
    waveStartTimeRef.current = performance.now();
    setTimeout(() => dispatch({ type: 'SPAWN_DUCKS' }), 500);
  }, []);
  const setWallet = useCallback((address: string | null) => dispatch({ type: 'SET_WALLET', address }), []);
  const setPaid = useCallback((paid: boolean) => dispatch({ type: 'SET_PAID', paid }), []);
  const requestPayment = useCallback(() => dispatch({ type: 'REQUEST_PAYMENT' }), []);
  const goToMenu = useCallback(() => dispatch({ type: 'GO_TO_MENU' }), []);

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

      dispatch({ type: 'UPDATE_DUCKS', deltaTime });

      const elapsed = (currentTime - waveStartTimeRef.current) / 1000;
      const remaining = Math.max(0, state.currentLevel.timePerWave - elapsed);
      dispatch({ type: 'UPDATE_TIME', time: remaining });

      const allDucksProcessed = state.ducks.length > 0 &&
        state.ducks.every((d) => d.state === 'escaped' || (d.state as string) === 'dead');
      const outOfBullets = state.stats.bullets <= 0;
      const timeUp = remaining <= 0;

      if (allDucksProcessed || (outOfBullets && state.ducks.some((d) => d.state === 'flying')) || timeUp) {
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
  }, [state.gameState, state.ducks, state.stats.bullets, state.currentLevel.timePerWave]);

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
