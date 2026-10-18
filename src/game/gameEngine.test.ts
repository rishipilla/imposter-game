/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectWordPair,
  assignRoles,
  tallyVotes,
  checkWordGuess,
  resolveRound,
} from './gameEngine.ts';
import { WORD_BANK } from './wordBank.ts';
import { Player, WordPair } from '../types/game.ts';

const mockPlayers: Player[] = [
  { id: 'p1', name: 'Alex', score: 0 },
  { id: 'p2', name: 'Sam', score: 0 },
  { id: 'p3', name: 'Jordan', score: 0 },
  { id: 'p4', name: 'Taylor', score: 0 },
];

const mockPair: WordPair = {
  id: 'test_01',
  normalWord: 'Spoon',
  imposterWord: 'Fork',
  category: 'Things & Everyday Objects',
  difficulty: 'easy',
  hint: 'Dining utensil',
};

test('selectWordPair returns a valid pair and respects category filtering', () => {
  const result = selectWordPair('Things & Everyday Objects', 'easy', []);
  assert.ok(result.wordPair);
  assert.equal(result.wordPair.category, 'Things & Everyday Objects');
  assert.equal(result.wordPair.difficulty, 'easy');
});

test('assignRoles enforces at least 3 players', () => {
  assert.throws(() => {
    assignRoles(mockPlayers.slice(0, 2), mockPair, 1);
  }, /At least 3 players/);
});

test('assignRoles assigns exactly one imposter and correct words for 4 players', () => {
  const roleResult = assignRoles(mockPlayers, mockPair, 1);
  assert.equal(roleResult.imposterIds.length, 1);
  assert.equal(roleResult.assignments.length, 4);

  const imposterAssignment = roleResult.assignments.find((a) => a.isImposter);
  assert.ok(imposterAssignment);
  assert.equal(imposterAssignment.word, 'Fork');

  const innocentAssignments = roleResult.assignments.filter((a) => !a.isImposter);
  assert.equal(innocentAssignments.length, 3);
  for (const inn of innocentAssignments) {
    assert.equal(inn.word, 'Spoon');
  }

  assert.ok(roleResult.startingPlayerId);
  assert.ok(mockPlayers.some((p) => p.id === roleResult.startingPlayerId));
});

test('tallyVotes correctly tallies votes and detects a decisive suspect', () => {
  const votes = {
    p1: 'p2',
    p3: 'p2',
    p4: 'p2',
    p2: 'p1',
  };

  const tallyResult = tallyVotes(votes, mockPlayers);
  assert.equal(tallyResult.maxVotes, 3);
  assert.deepEqual(tallyResult.mostVotedIds, ['p2']);
  assert.equal(tallyResult.isTie, false);
});

test('tallyVotes identifies ties correctly', () => {
  const votes = {
    p1: 'p2',
    p3: 'p2',
    p2: 'p1',
    p4: 'p1',
  };

  const tallyResult = tallyVotes(votes, mockPlayers);
  assert.equal(tallyResult.maxVotes, 2);
  assert.equal(tallyResult.mostVotedIds.length, 2);
  assert.equal(tallyResult.isTie, true);
});

test('checkWordGuess normalizes casing and punctuation', () => {
  assert.equal(checkWordGuess('spoon', 'Spoon'), true);
  assert.equal(checkWordGuess('   SPOON!  ', 'Spoon'), true);
  assert.equal(checkWordGuess('knife', 'Spoon'), false);
  assert.equal(checkWordGuess('', 'Spoon'), false);
});

test('resolveRound awards victory to innocents when imposter is caught and cannot guess word', () => {
  const imposterId = 'p2';
  const votes = {
    p1: imposterId,
    p3: imposterId,
    p4: imposterId,
    p2: 'p1',
  };

  const result = resolveRound({
    roundId: 'r1',
    players: mockPlayers,
    wordPair: mockPair,
    imposterIds: [imposterId],
    startingPlayerId: 'p1',
    votes,
    imposterGuess: 'Knife',
    allowImposterGuess: true,
  });

  assert.equal(result.imposterCaught, true);
  assert.equal(result.imposterGuessedCorrectly, false);
  assert.equal(result.winner, 'innocents');
  assert.equal(result.playerPoints['p1'], 15);
  assert.equal(result.playerPoints[imposterId], 0);
});

test('resolveRound lets caught imposter steal victory with correct guess', () => {
  const imposterId = 'p2';
  const votes = {
    p1: imposterId,
    p3: imposterId,
    p4: imposterId,
    p2: 'p1',
  };

  const result = resolveRound({
    roundId: 'r2',
    players: mockPlayers,
    wordPair: mockPair,
    imposterIds: [imposterId],
    startingPlayerId: 'p1',
    votes,
    imposterGuess: 'Spoon',
    allowImposterGuess: true,
  });

  assert.equal(result.imposterCaught, true);
  assert.equal(result.imposterGuessedCorrectly, true);
  assert.equal(result.winner, 'imposter');
  assert.equal(result.playerPoints[imposterId], 25);
  assert.equal(result.playerPoints['p1'], 0);
});

test('WORD_BANK contains over 250 curated pairs including concrete things', () => {
  assert.ok(WORD_BANK.length >= 250, `Expected at least 250 words, got ${WORD_BANK.length}`);
});
