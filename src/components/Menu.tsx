import React from 'react';
import { useGame } from '../context/GameContext';
import { PAYMENT_CONFIG } from '../game/constants';
import './Menu.css';

export const Menu: React.FC = () => {
  const { gameState, isPaid, walletConnected, requestPayment, startGame } = useGame();

  if (gameState !== 'menu') return null;

  const handleStartGame = () => {
    if (!isPaid) {
      requestPayment();
    } else {
      startGame();
    }
  };

  return (
    <div className="menu-overlay">
      <div className="menu-container">
        <h1 className="menu-title">
          <span className="title-x">x</span>
          <span className="title-402">402</span>
          <span className="title-hunter">-Hunter</span>
        </h1>

        <div className="menu-duck-animation">
          <div className="animated-duck">🦆</div>
          <div className="animated-duck delay-1">🦆</div>
          <div className="animated-duck delay-2">🦆</div>
        </div>

        <div className="menu-description">
          <p>Hunt the ducks! Shoot them before they escape!</p>
          <p className="menu-hint">Click to shoot • Press P to pause</p>
        </div>

        <div className="menu-pricing">
          <div className="price-item">
            <span className="price-label">Game</span>
            <span className="price-value">${PAYMENT_CONFIG.pricePerGame} USDC</span>
          </div>
          <div className="price-item">
            <span className="price-label">Extra Life</span>
            <span className="price-value">${PAYMENT_CONFIG.pricePerLife} USDC</span>
          </div>
          <div className="price-item">
            <span className="price-label">Continue</span>
            <span className="price-value">${PAYMENT_CONFIG.priceToContinue} USDC</span>
          </div>
        </div>

        <button className="menu-button start-button" onClick={handleStartGame}>
          {!walletConnected ? 'Connect Wallet & Play' : isPaid ? 'START GAME' : `Pay $${PAYMENT_CONFIG.pricePerGame} & Play`}
        </button>

        {walletConnected && (
          <div className="wallet-status">
            <span className="wallet-connected">✓ Wallet Connected</span>
          </div>
        )}

        <div className="menu-footer">
          <p>Powered by x402 Protocol</p>
          <p className="footer-link">Gasless payments on Base</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
