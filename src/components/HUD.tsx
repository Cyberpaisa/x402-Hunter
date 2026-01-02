import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatTime } from '../game/utils';
import './HUD.css';

export const HUD: React.FC = () => {
  const { stats, currentLevel, timeRemaining, pause, gameState } = useGame();
  const [rapidFireRemaining, setRapidFireRemaining] = useState(0);

  // Update rapid fire countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, stats.rapidFireUntil - Date.now());
      setRapidFireRemaining(remaining);
    }, 100);
    return () => clearInterval(interval);
  }, [stats.rapidFireUntil]);

  if (gameState !== 'playing') return null;

  const isRapidFireActive = rapidFireRemaining > 0;

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hud-left">
          <div className="hud-item">
            <span className="hud-label">SCORE</span>
            <span className="hud-value">{stats.score.toLocaleString()}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">LEVEL</span>
            <span className="hud-value">{currentLevel.title}</span>
          </div>
        </div>

        <div className="hud-center">
          <div className="hud-timer">
            <span className="timer-value">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="hud-right">
          <div className="hud-item">
            <span className="hud-label">WAVE</span>
            <span className="hud-value">{stats.wave}/{currentLevel.waves}</span>
          </div>
          <button className="pause-btn" onClick={pause} title="Pause (P)">
            II
          </button>
        </div>
      </div>

      <div className="hud-bottom">
        <div className={`bullets-display ${isRapidFireActive ? 'rapid-fire' : ''}`}>
          {isRapidFireActive ? (
            <div className="rapid-fire-indicator">
              <span className="rapid-fire-icon">⚡</span>
              <span className="rapid-fire-text">RAPID FIRE!</span>
              <span className="rapid-fire-timer">{(rapidFireRemaining / 1000).toFixed(1)}s</span>
            </div>
          ) : (
            Array.from({ length: stats.bullets }).map((_, i) => (
              <div key={i} className="bullet" />
            ))
          )}
        </div>

        <div className="lives-display">
          {Array.from({ length: stats.lives }).map((_, i) => (
            <div key={i} className="life-heart">❤️</div>
          ))}
        </div>

        <div className="ducks-counter">
          <span className="ducks-shot">🦆 {stats.ducksShot}</span>
          <span className="ducks-separator">/</span>
          <span className="ducks-total">{currentLevel.ducksPerWave}</span>
        </div>
      </div>
    </div>
  );
};

export default HUD;
