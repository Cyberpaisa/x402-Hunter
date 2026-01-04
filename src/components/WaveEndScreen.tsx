import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PaymentModal } from './PaymentModal';
import { PAYMENT_CONFIG } from '../game/constants';
import { SUCCESS_RATIO, LEVELS } from '../game/levels';
import './WaveEndScreen.css';

export const WaveEndScreen: React.FC = () => {
  const { gameState, stats, currentLevel, nextWave, nextLevel } = useGame();
  const [showPayment, setShowPayment] = useState(false);

  if (gameState !== 'wave-end') return null;

  const isLastWave = stats.wave >= currentLevel.waves;
  const requiredDucks = Math.ceil(currentLevel.ducksPerWave * SUCCESS_RATIO);
  const waveSuccess = stats.ducksShot >= requiredDucks;
  const levelComplete = isLastWave && waveSuccess;
  const isLastLevel = stats.level >= LEVELS.length;
  const nextLevelData = !isLastLevel ? LEVELS[stats.level] : null;

  const getMessage = () => {
    if (levelComplete && isLastLevel) {
      return { title: '🏆 GAME COMPLETE!', subtitle: 'You are a Master Hunter!', type: 'victory' };
    }
    if (levelComplete) {
      return {
        title: '⭐ LEVEL COMPLETE!',
        subtitle: `${currentLevel.title} finished! Next: ${nextLevelData?.title}`,
        type: 'level-complete'
      };
    }
    if (waveSuccess) {
      return {
        title: '✓ WAVE CLEAR!',
        subtitle: `Wave ${stats.wave}/${currentLevel.waves} • Level: ${currentLevel.title}`,
        type: 'success'
      };
    }
    if (stats.lives > 0) {
      return { title: 'WAVE OVER', subtitle: 'Some ducks escaped! Try again', type: 'neutral' };
    }
    return { title: '💔 NO LIVES LEFT', subtitle: 'Buy a life to continue', type: 'fail' };
  };

  const message = getMessage();

  const handleNext = () => {
    if (levelComplete) {
      nextLevel();
    } else {
      nextWave();
    }
  };

  const handleBuyLife = () => {
    setShowPayment(true);
  };

  const canContinue = stats.lives > 0;

  // Calculate what's next
  const nextWaveNum = stats.wave + 1;
  const showNextWaveInfo = !isLastWave && waveSuccess;
  const showNextLevelInfo = levelComplete && nextLevelData;

  return (
    <>
      <div className="waveend-overlay">
        <div className={`waveend-container ${message.type}`}>
          <h1 className="waveend-title">{message.title}</h1>
          <p className="waveend-subtitle">{message.subtitle}</p>

          {/* Current Progress */}
          <div className="level-progress-bar">
            <div className="level-info">
              Level {stats.level}: {currentLevel.title}
            </div>
            <div className="wave-dots">
              {Array.from({ length: currentLevel.waves }).map((_, i) => (
                <span
                  key={i}
                  className={`wave-dot ${i < stats.wave ? 'completed' : ''} ${i === stats.wave - 1 ? 'current' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="waveend-stats">
            <div className="stat-box">
              <span className="stat-number">{stats.ducksShot}</span>
              <span className="stat-text">Ducks Shot</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{currentLevel.ducksPerWave}</span>
              <span className="stat-text">Total Ducks</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.score.toLocaleString()}</span>
              <span className="stat-text">Score</span>
            </div>
          </div>

          <div className="lives-remaining">
            <span className="lives-label">Lives: </span>
            {stats.lives > 0 ? (
              Array.from({ length: stats.lives }).map((_, i) => (
                <span key={i} className="life-icon">❤️</span>
              ))
            ) : (
              <span className="no-lives">None!</span>
            )}
          </div>

          {/* Next Wave Info */}
          {showNextWaveInfo && (
            <div className="next-info">
              <div className="next-label">Next Wave ({nextWaveNum}/{currentLevel.waves})</div>
              <div className="next-details">
                {currentLevel.ducksPerWave} ducks • {currentLevel.timePerWave}s time
              </div>
            </div>
          )}

          {/* Next Level Info - Show difficulty changes */}
          {showNextLevelInfo && (
            <div className="next-info level-up">
              <div className="next-label">🆙 Next Level: {nextLevelData.title}</div>
              <div className="difficulty-changes">
                <div className="change-item">
                  <span className="change-icon">🦆</span>
                  <span>{currentLevel.ducksPerWave} → {nextLevelData.ducksPerWave} ducks</span>
                </div>
                <div className="change-item">
                  <span className="change-icon">⚡</span>
                  <span>Speed +{Math.round((nextLevelData.duckSpeed - currentLevel.duckSpeed) / currentLevel.duckSpeed * 100)}%</span>
                </div>
                <div className="change-item">
                  <span className="change-icon">⏱️</span>
                  <span>{nextLevelData.timePerWave}s per wave</span>
                </div>
                <div className="change-item">
                  <span className="change-icon">💰</span>
                  <span>{nextLevelData.pointsPerDuck} pts/duck</span>
                </div>
              </div>
            </div>
          )}

          <div className="waveend-actions">
            {canContinue && (
              <button className="waveend-button next-btn" onClick={handleNext}>
                {levelComplete ? `Start ${nextLevelData?.title || 'Victory'} →` : `Wave ${nextWaveNum} →`}
              </button>
            )}

            {!canContinue && (
              <button className="waveend-button life-btn" onClick={handleBuyLife}>
                ❤️ Buy Life (${PAYMENT_CONFIG.pricePerLife})
              </button>
            )}
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          type="life"
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
};

export default WaveEndScreen;
