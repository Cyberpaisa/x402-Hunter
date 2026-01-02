import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { GameCanvas } from './components/GameCanvas';
import { Menu } from './components/Menu';
import { PauseScreen } from './components/PauseScreen';
import { WaveEndScreen } from './components/WaveEndScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { PaymentModal } from './components/PaymentModal';
import './App.css';

const GameContent: React.FC = () => {
  const { gameState, goToMenu } = useGame();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="game-wrapper">
      <GameCanvas />
      <Menu />
      <PauseScreen />
      <WaveEndScreen />
      <GameOverScreen />
      <VictoryScreen />

      {gameState === 'payment' && (
        <PaymentModal
          type="game"
          onClose={goToMenu}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          type="game"
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <div className="app">
        <GameContent />
      </div>
    </GameProvider>
  );
}

export default App;
