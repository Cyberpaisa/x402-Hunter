import React from 'react';
import { useGame } from '../context/GameContext';
import { PAYMENT_CONFIG } from '../game/constants';
import './VictoryScreen.css';

export const VictoryScreen: React.FC = () => {
  const { gameState, stats, resetGame, goToMenu } = useGame();

  if (gameState !== 'victory') return null;

  const getVictoryMessage = () => {
    const accuracy = stats.totalDucksShot > 0 ? Math.round((stats.totalDucksShot / (stats.totalDucksShot + stats.ducksMissed)) * 100) : 0;

    if (accuracy >= 95) return 'LEGENDARY HUNTER!';
    if (accuracy >= 85) return 'MASTER HUNTER!';
    if (accuracy >= 70) return 'SKILLED HUNTER!';
    return 'VICTORIOUS!';
  };

  return (
    <div className="victory-overlay">
      <div className="victory-container">
        <div className="victory-confetti">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`confetti confetti-${i % 5}`} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
          ))}
        </div>

        <h1 className="victory-title">VICTORY!</h1>
        <h2 className="victory-subtitle">{getVictoryMessage()}</h2>

        <div className="victory-trophy">🏆</div>

        <div className="victory-stats">
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <span className="stat-value">{stats.score.toLocaleString()}</span>
            <span className="stat-label">Final Score</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🦆</span>
            <span className="stat-value">{stats.totalDucksShot}</span>
            <span className="stat-label">Ducks Shot</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{stats.lives}</span>
            <span className="stat-label">Lives Left</span>
          </div>
        </div>

        <div className="victory-actions">
          <button className="victory-button play-again" onClick={resetGame}>
            Play Again (${PAYMENT_CONFIG.pricePerGame})
          </button>
          <button className="victory-button menu-button" onClick={goToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
