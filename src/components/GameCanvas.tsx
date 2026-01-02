import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { DuckComponent } from './Duck';
import { HUD } from './HUD';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import './GameCanvas.css';

export const GameCanvas: React.FC = () => {
  const { gameState, ducks, shoot, pause, resume } = useGame();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    shoot(x, y);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
          pause();
        } else if (gameState === 'paused') {
          resume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, pause, resume]);

  return (
    <div
      ref={canvasRef}
      className="game-canvas"
      onClick={handleClick}
      style={{ cursor: gameState === 'playing' ? 'crosshair' : 'default' }}
    >
      <div className="game-background">
        <div className="sky" />
        <div className="clouds">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
        </div>
        <div className="sun" />
        <div className="mountains" />
        <div className="trees" />
        <div className="grass" />
      </div>

      <div className="game-entities">
        {ducks.map((duck) => (
          <DuckComponent key={duck.id} duck={duck} />
        ))}
      </div>

      <HUD />
    </div>
  );
};

export default GameCanvas;
