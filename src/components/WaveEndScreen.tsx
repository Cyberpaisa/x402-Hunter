import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PaymentModal } from './PaymentModal';
import { PAYMENT_CONFIG } from '../game/constants';
import { SUCCESS_RATIO } from '../game/levels';
import './WaveEndScreen.css';

export const WaveEndScreen: React.FC = () => {
  const { gameState, stats, currentLevel, nextWave, nextLevel } = useGame();
  const [showPayment, setShowPayment] = useState(false);

  if (gameState !== 'wave-end') return null;

  const isLastWave = stats.wave >= currentLevel.waves;
  const totalDucksInLevel = currentLevel.waves * currentLevel.ducksPerWave;
  const requiredDucks = Math.ceil(totalDucksInLevel * SUCCESS_RATIO);
  const waveSuccess = stats.ducksShot >= Math.ceil(currentLevel.ducksPerWave * SUCCESS_RATIO);
  const levelComplete = isLastWave && stats.ducksShot >= requiredDucks;

  const getMessage = () => {
    if (levelComplete) {
      return { title: 'LEVEL COMPLETE!', subtitle: 'Ready for the next challenge?', type: 'success' };
    }
    if (isLastWave && !levelComplete) {
      if (stats.lives > 0) {
        return { title: 'NOT ENOUGH DUCKS', subtitle: 'You need more accuracy!', type: 'warning' };
      }
      return { title: 'LEVEL FAILED', subtitle: 'Try again or buy a life', type: 'fail' };
    }
    if (waveSuccess) {
      return { title: 'WAVE CLEAR!', subtitle: `Wave ${stats.wave} complete`, type: 'success' };
    }
    return { title: 'WAVE OVER', subtitle: 'Keep shooting!', type: 'neutral' };
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

  return (
    <>
      <div className="waveend-overlay">
        <div className={`waveend-container ${message.type}`}>
          <h1 className="waveend-title">{message.title}</h1>
          <p className="waveend-subtitle">{message.subtitle}</p>

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

          {isLastWave && (
            <div className="level-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(100, (stats.ducksShot / requiredDucks) * 100)}%` }}
                />
              </div>
              <span className="progress-text">
                {stats.ducksShot} / {requiredDucks} ducks needed ({Math.round(SUCCESS_RATIO * 100)}%)
              </span>
            </div>
          )}

          <div className="waveend-actions">
            {!isLastWave && (
              <button className="waveend-button next-btn" onClick={handleNext}>
                Next Wave →
              </button>
            )}

            {levelComplete && (
              <button className="waveend-button next-btn" onClick={handleNext}>
                Next Level →
              </button>
            )}

            {isLastWave && !levelComplete && stats.lives <= 1 && (
              <button className="waveend-button life-btn" onClick={handleBuyLife}>
                ❤️ Buy Life (${PAYMENT_CONFIG.pricePerLife})
              </button>
            )}

            {isLastWave && !levelComplete && stats.lives > 1 && (
              <button className="waveend-button retry-btn" onClick={nextWave}>
                Try Again
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
