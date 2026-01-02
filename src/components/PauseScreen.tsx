import React from 'react';
import { useGame } from '../context/GameContext';
import sounds from '../game/sounds';
import './PauseScreen.css';

export const PauseScreen: React.FC = () => {
  const { gameState, stats, currentLevel, resume, goToMenu } = useGame();
  const [isMuted, setIsMuted] = React.useState(sounds.isMuted());

  if (gameState !== 'paused') return null;

  const handleToggleMute = () => {
    const newMuted = sounds.toggle();
    setIsMuted(newMuted);
  };

  return (
    <div className="pause-overlay">
      <div className="pause-container">
        <h1 className="pause-title">PAUSED</h1>

        <div className="pause-info">
          <div className="info-row">
            <span className="info-label">Level</span>
            <span className="info-value">{currentLevel.title}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Wave</span>
            <span className="info-value">{stats.wave} / {currentLevel.waves}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Score</span>
            <span className="info-value">{stats.score.toLocaleString()}</span>
          </div>
        </div>

        <div className="pause-actions">
          <button className="pause-button resume-btn" onClick={resume}>
            Resume (P)
          </button>

          <button className="pause-button mute-btn" onClick={handleToggleMute}>
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>

          <button className="pause-button quit-btn" onClick={goToMenu}>
            Quit to Menu
          </button>
        </div>

        <div className="pause-controls">
          <h3>Controls</h3>
          <p>Click - Shoot</p>
          <p>P - Pause/Resume</p>
        </div>
      </div>
    </div>
  );
};

export default PauseScreen;
