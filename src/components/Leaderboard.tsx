import React, { useEffect, useState } from 'react';
import { getTopPlayers, getSeasonStats, CURRENT_SEASON } from '../game/season';
import type { LeaderboardEntry } from '../types/season';
import './Leaderboard.css';

interface LeaderboardProps {
  compact?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ compact = false }) => {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [seasonStats, setSeasonStats] = useState({
    totalFinishers: 0,
    totalRaffleEntries: 0,
    highestScore: 0,
    averageScore: 0,
  });

  useEffect(() => {
    setTopPlayers(getTopPlayers(compact ? 5 : 10));
    setSeasonStats(getSeasonStats());
  }, [compact]);

  const formatWalletAddress = (address: string): string => {
    if (address === 'anonymous') return 'Anonymous';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`leaderboard ${compact ? 'leaderboard-compact' : ''}`}>
      <div className="leaderboard-header">
        <span className="leaderboard-icon">🏆</span>
        <h3 className="leaderboard-title">{CURRENT_SEASON.name}</h3>
      </div>

      <div className="season-overview">
        <div className="season-stat-mini">
          <span className="stat-mini-value">{seasonStats.totalFinishers}</span>
          <span className="stat-mini-label">Hunters</span>
        </div>
        <div className="season-stat-mini">
          <span className="stat-mini-value">{seasonStats.totalRaffleEntries}</span>
          <span className="stat-mini-label">Raffle Pool</span>
        </div>
        <div className="season-stat-mini">
          <span className="stat-mini-value">{seasonStats.highestScore.toLocaleString()}</span>
          <span className="stat-mini-label">High Score</span>
        </div>
      </div>

      {topPlayers.length > 0 ? (
        <div className="leaderboard-list">
          {topPlayers.map((player) => (
            <div key={`${player.walletAddress}-${player.completedAt}`} className="leaderboard-entry">
              <span className={`entry-rank rank-${player.rank}`}>
                {player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : `#${player.rank}`}
              </span>
              <span className="entry-wallet">{formatWalletAddress(player.walletAddress)}</span>
              <span className="entry-score">{player.score.toLocaleString()}</span>
              {player.hasGoldenTicket && <span className="entry-ticket">🎫</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="leaderboard-empty">
          <p>No hunters yet this season!</p>
          <p className="empty-hint">Be the first to complete the hunt</p>
        </div>
      )}

      <div className="leaderboard-footer">
        <span className="season-dates">
          {new Date(CURRENT_SEASON.startDate).toLocaleDateString()} - {new Date(CURRENT_SEASON.endDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default Leaderboard;
