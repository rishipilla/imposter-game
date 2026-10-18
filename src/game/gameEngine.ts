/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, WordPair, Difficulty, PlayerAssignment, VoteTally, RoundResult } from '../types/game';
import { WORD_BANK, getFilteredWordPairs } from './wordBank';

export interface AssignRolesResult {
  wordPair: WordPair;
  assignments: PlayerAssignment[];
  imposterIds: string[];
  innocentIds: string[];
  startingPlayerId: string;
}

/**
 * Selects an unused word pair matching the chosen difficulty and category.
 * If all pairs are used up, resets the used list.
 */
export function selectWordPair(
  category: string = 'All Categories',
  difficulty: 'all' | Difficulty = 'all',
  usedPairIds: string[] = []
): { wordPair: WordPair; didResetUsed: boolean } {
  let pool = getFilteredWordPairs(category, difficulty);
  if (pool.length === 0) {
    // Fallback to all words if filter has no entries
    pool = WORD_BANK;
  }

  const unused = pool.filter((p) => !usedPairIds.includes(p.id));
  let didResetUsed = false;
  let targetPool = unused;

  if (unused.length === 0) {
    targetPool = pool;
    didResetUsed = true;
  }

  const randomIndex = Math.floor(Math.random() * targetPool.length);
  return {
    wordPair: targetPool[randomIndex],
    didResetUsed,
  };
}

/**
 * Randomly selects imposters and assigns secret words to all players.
 * Also selects a random starting player independently.
 */
export function assignRoles(
  players: Player[],
  wordPair: WordPair,
  imposterCount: 1 | 2 = 1
): AssignRolesResult {
  if (players.length < 3) {
    throw new Error('At least 3 players are required to play.');
  }

  const effectiveImposterCount = Math.min(
    imposterCount,
    Math.max(1, Math.floor(players.length / 2) - 1 || 1)
  );

  // Shuffle players copy
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const imposterPlayers = shuffled.slice(0, effectiveImposterCount);
  const imposterIds = imposterPlayers.map((p) => p.id);
  const innocentIds = shuffled.slice(effectiveImposterCount).map((p) => p.id);

  // Assignments
  const assignments: PlayerAssignment[] = players.map((player) => {
    const isImposter = imposterIds.includes(player.id);
    return {
      playerId: player.id,
      word: isImposter ? wordPair.imposterWord : wordPair.normalWord,
      isImposter,
      hasViewed: false,
    };
  });

  // Random starting player chosen independently
  const startingPlayerIndex = Math.floor(Math.random() * players.length);
  const startingPlayerId = players[startingPlayerIndex].id;

  return {
    wordPair,
    assignments,
    imposterIds,
    innocentIds,
    startingPlayerId,
  };
}

/**
 * Tallies player votes and detects ties.
 */
export function tallyVotes(
  votes: Record<string, string>, // voterId -> suspectId
  players: Player[]
): {
  tallies: VoteTally[];
  maxVotes: number;
  mostVotedIds: string[];
  isTie: boolean;
} {
  const counts: Record<string, string[]> = {};
  for (const player of players) {
    counts[player.id] = [];
  }

  for (const [voterId, suspectId] of Object.entries(votes)) {
    if (counts[suspectId]) {
      counts[suspectId].push(voterId);
    }
  }

  const tallies: VoteTally[] = Object.entries(counts).map(([suspectId, voterIds]) => ({
    suspectId,
    voterIds,
    count: voterIds.length,
  }));

  tallies.sort((a, b) => b.count - a.count);

  const maxVotes = tallies.length > 0 ? tallies[0].count : 0;
  const mostVotedIds = tallies
    .filter((t) => t.count === maxVotes && maxVotes > 0)
    .map((t) => t.suspectId);

  const isTie = mostVotedIds.length > 1;

  return {
    tallies,
    maxVotes,
    mostVotedIds,
    isTie,
  };
}

/**
 * Checks whether an imposter's guess for the normal word is correct.
 * Normalizes punctuation and casing.
 */
export function checkWordGuess(guess: string, targetWord: string): boolean {
  const cleanGuess = guess.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTarget = targetWord.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanGuess.length > 0 && cleanGuess === cleanTarget;
}

/**
 * Resolves the round's outcome, winner, and calculates scores.
 */
export function resolveRound(params: {
  roundId: string;
  players: Player[];
  wordPair: WordPair;
  imposterIds: string[];
  startingPlayerId: string;
  votes: Record<string, string>;
  imposterGuess?: string;
  allowImposterGuess?: boolean;
}): RoundResult {
  const {
    roundId,
    players,
    wordPair,
    imposterIds,
    startingPlayerId,
    votes,
    imposterGuess,
    allowImposterGuess = true,
  } = params;

  const tallyResult = tallyVotes(votes, players);
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const imposters = imposterIds
    .map((id) => playerMap.get(id))
    .filter((p): p is Player => Boolean(p));
  const innocents = players.filter((p) => !imposterIds.includes(p.id));
  const startingPlayer = playerMap.get(startingPlayerId) || players[0];

  // Imposter caught if exactly one person received max votes and they are an imposter
  // or in case of ties, tie means imposter escaped!
  const topSuspectIsImposter =
    !tallyResult.isTie &&
    tallyResult.mostVotedIds.length === 1 &&
    imposterIds.includes(tallyResult.mostVotedIds[0]);

  let imposterGuessedCorrectly = false;
  if (topSuspectIsImposter && allowImposterGuess && imposterGuess) {
    imposterGuessedCorrectly = checkWordGuess(imposterGuess, wordPair.normalWord);
  }

  // Determine winner:
  // If imposter caught and couldn't guess word -> innocents win!
  // If imposter caught but correctly guessed the secret word -> imposter steals victory!
  // If imposter not caught (or tie) -> imposter wins!
  let winner: 'innocents' | 'imposter';
  if (topSuspectIsImposter && !imposterGuessedCorrectly) {
    winner = 'innocents';
  } else {
    winner = 'imposter';
  }

  // Points calculation
  const playerPoints: Record<string, number> = {};
  for (const player of players) {
    playerPoints[player.id] = 0;
  }

  if (winner === 'innocents') {
    for (const inn of innocents) {
      playerPoints[inn.id] += 10;
      // Bonus if they personally voted for the actual imposter
      if (votes[inn.id] && imposterIds.includes(votes[inn.id])) {
        playerPoints[inn.id] += 5;
      }
    }
  } else {
    for (const imp of imposters) {
      playerPoints[imp.id] += 15;
      if (imposterGuessedCorrectly) {
        playerPoints[imp.id] += 10; // Mastermind theft bonus!
      }
    }
  }

  return {
    roundId,
    timestamp: Date.now(),
    wordPair,
    imposters,
    innocents,
    startingPlayer,
    votes,
    tally: tallyResult.tallies,
    mostVotedPlayerIds: tallyResult.mostVotedIds,
    isTie: tallyResult.isTie,
    imposterCaught: topSuspectIsImposter,
    imposterGuess,
    imposterGuessedCorrectly,
    winner,
    playerPoints,
  };
}
