
import { Game, Group } from './types';

/**
 * @fileOverview Utility functions for calculating Magic: The Gathering performance stats.
 */

/**
 * Returns a set of all player IDs associated with the current user across all groups.
 */
export function getUserPlayerIds(groups: Group[]) {
  return new Set(groups.flatMap(g => g.players.filter(p => p.isUser).map(p => p.id)));
}

/**
 * Main calculation engine for player and group statistics.
 */
export function calculateStats(user: any, games: Game[], groups: Group[]) {
  if (!user || games.length === 0) {
    return {
      winRate: 0,
      winRateFormatted: '0',
      totalGames: games.length,
      activeGroups: groups.length,
      topCommander: 'N/A',
      myWins: 0,
      myGamesCount: 0,
      mostPlayedCommander: 'N/A',
      strongestColor: 'N/A',
      commanderPerformance: {} as Record<string, { games: number; wins: number }>,
      colorPerformance: {} as Record<string, { games: number; wins: number }>
    };
  }

  const userPlayerIds = getUserPlayerIds(groups);
  
  // Filter games where the user actually participated
  const myGames = games.filter(g => g.participants.some(p => userPlayerIds.has(p.playerId)));
  const myWins = myGames.filter(g => userPlayerIds.has(g.winnerPlayerId));
  
  const winRate = myGames.length > 0 ? (myWins.length / myGames.length) * 100 : 0;

  const commanderPerformance: Record<string, { games: number; wins: number }> = {};
  const colorPerformance: Record<string, { games: number; wins: number }> = {};

  myGames.forEach(game => {
    const participant = game.participants.find(p => userPlayerIds.has(p.playerId));
    if (participant) {
      const isWinner = userPlayerIds.has(game.winnerPlayerId);
      
      // Track Commander Stats
      if (!commanderPerformance[participant.commanderName]) {
        commanderPerformance[participant.commanderName] = { games: 0, wins: 0 };
      }
      commanderPerformance[participant.commanderName].games++;
      if (isWinner) commanderPerformance[participant.commanderName].wins++;

      // Track Color Identity Stats
      if (!colorPerformance[participant.colorIdentity]) {
        colorPerformance[participant.colorIdentity] = { games: 0, wins: 0 };
      }
      colorPerformance[participant.colorIdentity].games++;
      if (isWinner) colorPerformance[participant.colorIdentity].wins++;
    }
  });

  // Derived metrics
  const mostPlayedCommander = Object.entries(commanderPerformance)
    .sort((a, b) => b[1].games - a[1].games)[0]?.[0] || 'N/A';
    
  const strongestColor = Object.entries(colorPerformance)
    .sort((a, b) => (b[1].wins / b[1].games) - (a[1].wins / a[1].games))[0]?.[0] || 'N/A';

  return {
    winRate,
    winRateFormatted: winRate.toFixed(1),
    totalGames: games.length,
    activeGroups: groups.length,
    topCommander: mostPlayedCommander,
    myWins: myWins.length,
    myGamesCount: myGames.length,
    mostPlayedCommander,
    strongestColor,
    commanderPerformance,
    colorPerformance
  };
}
