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
  const requiredDucks = Math.ceil(currentLevel.ducksPerWave * SUCCESS_RATIO);
  const waveSuccess = stats.ducksShot >= requiredDucks;
  const levelComplete = isLastWave && waveSuccess;

  const getMessage = () => {
    if (levelComplete) {
      return { title: 'LEVEL COMPLETE!', subtitle: 'Ready for the next challenge?', type: 'success' };
    }
    if (waveSuccess) {
      return { title: 'WAVE CLEAR!', subtitle: `Wave ${stats.wave} complete`, type: 'success' };
    }
    // Wave failed but still have lives
    if (stats.lives > 0) {
      return { title: 'WAVE OVER', subtitle: 'Keep trying!', type: 'neutral' };
    }
    // No lives left
    return { title: 'NO LIVES LEFT', subtitle: 'Buy a life to continue', type: 'fail' };
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

  // Can always continue if you have lives (regardless of wave success)
  const canContinue = stats.lives > 0;

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

          <div className="wave-progress">
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

          <div className="waveend-actions">
            {canContinue && (
              <button className="waveend-button next-btn" onClick={handleNext}>
                {levelComplete ? 'Next Level →' : 'Next Wave →'}
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
