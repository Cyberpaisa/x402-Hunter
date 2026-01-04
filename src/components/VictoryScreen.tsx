import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { PAYMENT_CONFIG } from '../game/constants';
import { awardGoldenTicket, CURRENT_SEASON, getSeasonStats } from '../game/season';
import { getRaffleEntries, type GoldenTicket } from '../types/season';
import './VictoryScreen.css';

export const VictoryScreen: React.FC = () => {
  const { gameState, stats, walletAddress, resetGame, goToMenu } = useGame();
  const [ticket, setTicket] = useState<GoldenTicket | null>(null);
  const [seasonStats, setSeasonStats] = useState({ totalFinishers: 0, totalRaffleEntries: 0 });

  // Award Golden Ticket on victory
  useEffect(() => {
    if (gameState === 'victory' && !ticket) {
      const newTicket = awardGoldenTicket(
        walletAddress || 'anonymous',
        stats.score,
        stats.totalDucksShot,
        Date.now() // Would track actual completion time in real implementation
      );
      setTicket(newTicket);
      setSeasonStats(getSeasonStats());
    }
  }, [gameState, ticket, walletAddress, stats.score, stats.totalDucksShot]);

  // Reset ticket when leaving victory screen
  useEffect(() => {
    if (gameState !== 'victory') {
      setTicket(null);
    }
  }, [gameState]);

  if (gameState !== 'victory') return null;

  const raffleEntries = getRaffleEntries(stats.score);

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

        {/* Golden Ticket Award */}
        <div className="golden-ticket">
          <div className="ticket-header">
            <span className="ticket-icon">🎫</span>
            <span className="ticket-title">GOLDEN TICKET</span>
          </div>
          <div className="ticket-body">
            <div className="ticket-id">{ticket?.id || 'Generating...'}</div>
            <div className="ticket-season">{CURRENT_SEASON.name}</div>
            <div className="ticket-raffle">
              <span className="raffle-entries">{raffleEntries}x</span>
              <span className="raffle-label">Raffle Entries</span>
            </div>
          </div>
        </div>

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

        {/* Season Stats */}
        <div className="season-info">
          <div className="season-stat">
            <span className="season-value">{seasonStats.totalFinishers}</span>
            <span className="season-label">Total Finishers</span>
          </div>
          <div className="season-stat">
            <span className="season-value">{seasonStats.totalRaffleEntries}</span>
            <span className="season-label">Raffle Pool</span>
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
