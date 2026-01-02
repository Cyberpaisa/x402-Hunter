import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PaymentModal } from './PaymentModal';
import { PAYMENT_CONFIG } from '../game/constants';
import './GameOverScreen.css';

export const GameOverScreen: React.FC = () => {
  const { gameState, stats, resetGame, goToMenu } = useGame();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'life' | 'continue'>('continue');

  if (gameState !== 'game-over') return null;

  const handleBuyLife = () => {
    setPaymentType('life');
    setShowPayment(true);
  };

  const handleContinue = () => {
    setPaymentType('continue');
    setShowPayment(true);
  };

  return (
    <>
      <div className="gameover-overlay">
        <div className="gameover-container">
          <h1 className="gameover-title">GAME OVER</h1>

          <div className="gameover-stats">
            <div className="stat-row">
              <span className="stat-label">Final Score</span>
              <span className="stat-value score">{stats.score.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Ducks Shot</span>
              <span className="stat-value">{stats.totalDucksShot}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Level Reached</span>
              <span className="stat-value">{stats.level}</span>
            </div>
          </div>

          <div className="gameover-actions">
            <button className="action-button continue-btn" onClick={handleContinue}>
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Continue</span>
              <span className="btn-price">${PAYMENT_CONFIG.priceToContinue}</span>
            </button>

            <button className="action-button life-btn" onClick={handleBuyLife}>
              <span className="btn-icon">❤️</span>
              <span className="btn-text">Buy Life</span>
              <span className="btn-price">${PAYMENT_CONFIG.pricePerLife}</span>
            </button>

            <button className="action-button newgame-btn" onClick={resetGame}>
              <span className="btn-icon">🎮</span>
              <span className="btn-text">New Game</span>
              <span className="btn-price">${PAYMENT_CONFIG.pricePerGame}</span>
            </button>

            <button className="action-button menu-btn" onClick={goToMenu}>
              <span className="btn-text">Back to Menu</span>
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          type={paymentType}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
};

export default GameOverScreen;
