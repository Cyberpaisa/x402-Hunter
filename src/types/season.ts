// Season and rewards system types

export interface Season {
  id: string;
  name: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  isActive: boolean;
}

export interface GoldenTicket {
  id: string;
  seasonId: string;
  walletAddress: string;
  earnedAt: number; // timestamp
  finalScore: number;
  totalDucksShot: number;
  completionTimeMs: number;
}

export interface RaffleEntry {
  ticketId: string;
  walletAddress: string;
  entries: number; // Number of raffle entries (based on score tiers)
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  score: number;
  completedAt: number;
  hasGoldenTicket: boolean;
}

// Score tiers for raffle entries
// Higher score = more entries in raffle
export const RAFFLE_TIERS = [
  { minScore: 0, entries: 1 },      // Base entry for completion
  { minScore: 5000, entries: 2 },   // 2 entries
  { minScore: 10000, entries: 3 },  // 3 entries
  { minScore: 20000, entries: 5 },  // 5 entries
  { minScore: 50000, entries: 10 }, // 10 entries (top players)
];

export function getRaffleEntries(score: number): number {
  let entries = 1;
  for (const tier of RAFFLE_TIERS) {
    if (score >= tier.minScore) {
      entries = tier.entries;
    }
  }
  return entries;
}
