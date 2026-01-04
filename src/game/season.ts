import type { Season, GoldenTicket, LeaderboardEntry } from '../types/season';
import { getRaffleEntries } from '../types/season';

// Current active season
export const CURRENT_SEASON: Season = {
  id: 'season-01',
  name: 'Season 01: Genesis Hunt',
  startDate: '2025-01-01',
  endDate: '2025-02-28',
  isActive: true,
};

// Local storage keys
const GOLDEN_TICKETS_KEY = 'x402_golden_tickets';
const LEADERBOARD_KEY = 'x402_leaderboard';

// Generate unique ticket ID
function generateTicketId(): string {
  return `GT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Award Golden Ticket on game completion
export function awardGoldenTicket(
  walletAddress: string,
  finalScore: number,
  totalDucksShot: number,
  completionTimeMs: number
): GoldenTicket {
  const ticket: GoldenTicket = {
    id: generateTicketId(),
    seasonId: CURRENT_SEASON.id,
    walletAddress,
    earnedAt: Date.now(),
    finalScore,
    totalDucksShot,
    completionTimeMs,
  };

  // Store in localStorage (would be API call in production)
  const existingTickets = getGoldenTickets();
  existingTickets.push(ticket);
  localStorage.setItem(GOLDEN_TICKETS_KEY, JSON.stringify(existingTickets));

  // Also add to leaderboard
  addToLeaderboard(walletAddress, finalScore, ticket.id);

  return ticket;
}

// Get all golden tickets
export function getGoldenTickets(): GoldenTicket[] {
  try {
    const stored = localStorage.getItem(GOLDEN_TICKETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Get tickets for a specific wallet
export function getWalletTickets(walletAddress: string): GoldenTicket[] {
  return getGoldenTickets().filter(t => t.walletAddress === walletAddress);
}

// Add entry to leaderboard
function addToLeaderboard(walletAddress: string, score: number, _ticketId: string): void {
  const leaderboard = getLeaderboard();

  const entry: LeaderboardEntry = {
    rank: 0, // Will be calculated
    walletAddress,
    score,
    completedAt: Date.now(),
    hasGoldenTicket: true,
  };

  leaderboard.push(entry);

  // Sort by score descending and assign ranks
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.forEach((e, i) => e.rank = i + 1);

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

// Get leaderboard
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Get top N from leaderboard
export function getTopPlayers(count: number = 10): LeaderboardEntry[] {
  return getLeaderboard().slice(0, count);
}

// Calculate total raffle entries for all finishers
export function getTotalRaffleEntries(): number {
  const tickets = getGoldenTickets();
  return tickets.reduce((total, ticket) => total + getRaffleEntries(ticket.finalScore), 0);
}

// Get season stats
export function getSeasonStats() {
  const tickets = getGoldenTickets();
  const currentSeasonTickets = tickets.filter(t => t.seasonId === CURRENT_SEASON.id);

  return {
    totalFinishers: currentSeasonTickets.length,
    totalRaffleEntries: currentSeasonTickets.reduce(
      (total, t) => total + getRaffleEntries(t.finalScore),
      0
    ),
    highestScore: currentSeasonTickets.length > 0
      ? Math.max(...currentSeasonTickets.map(t => t.finalScore))
      : 0,
    averageScore: currentSeasonTickets.length > 0
      ? Math.round(currentSeasonTickets.reduce((sum, t) => sum + t.finalScore, 0) / currentSeasonTickets.length)
      : 0,
  };
}

// Reset leaderboard for new season
export function resetSeasonData(): void {
  localStorage.removeItem(GOLDEN_TICKETS_KEY);
  localStorage.removeItem(LEADERBOARD_KEY);
}
