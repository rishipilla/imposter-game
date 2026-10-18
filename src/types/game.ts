/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface WordPair {
  id: string;
  normalWord: string;
  imposterWord: string;
  category: string;
  difficulty: Difficulty;
  hint: string;
}

export interface GameSettings {
  difficulty: 'all' | Difficulty;
  category: string;
  imposterCount: 1 | 2;
  timerSecondsPerClue: number; // 0 = off, 30, 45, 60
  allowImposterGuess: boolean;
  avoidRecentWords: boolean;
  soundEnabled: boolean;
}

export interface PlayerAssignment {
  playerId: string;
  word: string;
  isImposter: boolean;
  hasViewed: boolean;
}

export interface VoteTally {
  suspectId: string;
  voterIds: string[];
  count: number;
}

export interface RoundResult {
  roundId: string;
  timestamp: number;
  wordPair: WordPair;
  imposters: Player[];
  innocents: Player[];
  startingPlayer: Player;
  votes: Record<string, string>; // voterId -> suspectId
  tally: VoteTally[];
  mostVotedPlayerIds: string[];
  isTie: boolean;
  imposterCaught: boolean;
  imposterGuess?: string;
  imposterGuessedCorrectly?: boolean;
  winner: 'innocents' | 'imposter';
  playerPoints: Record<string, number>;
}

export type GamePhase =
  | 'title'
  | 'setup'
  | 'reveal'
  | 'discussion'
  | 'voting'
  | 'results'
  | 'wordbank'
  | 'history';

export interface ActiveSession {
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  currentWordPair: WordPair | null;
  currentAssignments: PlayerAssignment[];
  currentImposterIds: string[];
  currentStartingPlayerId: string;
  currentRevealIndex: number;
  roundResult: RoundResult | null;
  savedVotes?: Record<string, string>;
  savedVoterIndex?: number;
  lastUpdated: number;
}
