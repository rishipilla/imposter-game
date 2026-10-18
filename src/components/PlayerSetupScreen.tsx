/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, GameSettings, Difficulty } from '../types/game';
import { CATEGORIES } from '../game/wordBank';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface PlayerSetupScreenProps {
  players: Player[];
  settings: GameSettings;
  onUpdatePlayers: (players: Player[]) => void;
  onUpdateSettings: (settings: GameSettings) => void;
  onStartGame: () => void;
  onBackToTitle: () => void;
}

export const PlayerSetupScreen: React.FC<PlayerSetupScreenProps> = ({
  players,
  settings,
  onUpdatePlayers,
  onUpdateSettings,
  onStartGame,
  onBackToTitle,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (!trimmed) {
      setValidationError('Please enter a player name.');
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setValidationError(`"${trimmed}" is already in the game!`);
      return;
    }

    setValidationError(null);
    sound.playBlip(550);
    const newPlayer: Player = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      score: 0,
    };
    onUpdatePlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 3) {
      setValidationError('A minimum of 3 players is required for deduction.');
      return;
    }
    setValidationError(null);
    sound.playBlip(380);
    onUpdatePlayers(players.filter((p) => p.id !== id));
  };

  const handleApplyPreset = (presetNames: string[]) => {
    sound.playBlip(550);
    setValidationError(null);
    const newPlayers: Player[] = presetNames.map((name, i) => ({
      id: 'preset_' + i + '_' + Date.now(),
      name,
      score: 0,
    }));
    onUpdatePlayers(newPlayers);
  };

  const canStart = players.length >= 3;

  return (
    <div className="relative w-full h-full flex flex-col p-4 sm:p-6 overflow-y-auto select-none bg-zinc-950 text-zinc-100">
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-zinc-800">
        <button
          onClick={() => {
            sound.playBlip();
            onBackToTitle();
          }}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer transition-colors"
        >
          <span>← Title Screen</span>
        </button>
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
            Player Setup & Rules
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            {players.length} Players Configured · Minimum 3
          </p>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-6">
        {/* Left Column: Player Names & Roster (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Add Player Box */}
          <form
            onSubmit={handleAddPlayer}
            className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <label htmlFor="playerNameInput" className="text-xs uppercase font-mono tracking-wider text-zinc-300 font-bold">
                Add Player Name
              </label>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <span>Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['Alex', 'Sam', 'Jordan'])}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                >
                  3 Players
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['Alex', 'Sam', 'Jordan', 'Taylor'])}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                >
                  4 Players
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Chris'])}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                >
                  6 Players
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="playerNameInput"
                type="text"
                value={newPlayerName}
                onChange={(e) => {
                  setNewPlayerName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter player name..."
                maxLength={20}
                className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                + Add
              </button>
            </div>

            {validationError && (
              <p className="text-xs text-zinc-300 font-medium flex items-center gap-1">
                <span>⚠️</span> {validationError}
              </p>
            )}
          </form>

          {/* Current Players Grid */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Players ({players.length})</span>
              <span>Pass-and-play order</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="relative group p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex flex-col items-center justify-between transition-all"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    title={`Remove ${player.name}`}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    ×
                  </button>

                  <PlayerAvatar name={player.name} size="md" />

                  <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                    {player.score > 0 ? `${player.score} pts` : 'Ready'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Game Rules & Settings (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs uppercase font-mono tracking-wider text-zinc-300 font-bold">
              Round Settings
            </h3>

            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="categorySelect" className="text-xs text-zinc-300 font-medium">
                Word Category
              </label>
              <select
                id="categorySelect"
                value={settings.category}
                onChange={(e) => {
                  sound.playBlip(480);
                  onUpdateSettings({ ...settings, category: e.target.value });
                }}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-zinc-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-300 font-medium">Difficulty</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      sound.playBlip(480);
                      onUpdateSettings({ ...settings, difficulty: diff });
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer border ${
                      settings.difficulty === diff
                        ? 'bg-white text-zinc-950 border-white font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Imposter Count */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">Imposter Count</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {settings.imposterCount === 1 ? '1 Imposter' : '2 Imposters'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBlip(480);
                    onUpdateSettings({ ...settings, imposterCount: 1 });
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                    settings.imposterCount === 1
                      ? 'bg-white text-zinc-950 border-white font-bold'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  1 Imposter
                </button>
                <button
                  type="button"
                  disabled={players.length < 5}
                  onClick={() => {
                    sound.playBlip(480);
                    onUpdateSettings({ ...settings, imposterCount: 2 });
                  }}
                  title={players.length < 5 ? 'Requires 5+ players' : '2 Imposters'}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                    players.length < 5
                      ? 'opacity-40 cursor-not-allowed bg-zinc-950 text-zinc-600 border-zinc-900'
                      : settings.imposterCount === 2
                      ? 'bg-white text-zinc-950 border-white font-bold'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  2 Imposters {players.length < 5 && '(5+ pls)'}
                </button>
              </div>
            </div>

            {/* Turn Clue Timer */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-300 font-medium">Clue Timer per Speaker</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      sound.playBlip(480);
                      onUpdateSettings({ ...settings, timerSecondsPerClue: sec });
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                      settings.timerSecondsPerClue === sec
                        ? 'bg-white text-zinc-950 border-white font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {sec === 0 ? 'Off' : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Rules Toggles */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Imposter Guess Steal Rule</span>
                <input
                  type="checkbox"
                  checked={settings.allowImposterGuess}
                  onChange={(e) => {
                    sound.playBlip(480);
                    onUpdateSettings({ ...settings, allowImposterGuess: e.target.checked });
                  }}
                  className="rounded accent-zinc-200 cursor-pointer w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer pt-1">
                <span>Avoid Recently Used Words</span>
                <input
                  type="checkbox"
                  checked={settings.avoidRecentWords}
                  onChange={(e) => {
                    sound.playBlip(480);
                    onUpdateSettings({ ...settings, avoidRecentWords: e.target.checked });
                  }}
                  className="rounded accent-zinc-200 cursor-pointer w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Primary Start Match CTA */}
          <button
            data-start="true"
            disabled={!canStart}
            onClick={() => {
              if (!canStart) return;
              sound.playBlip(650);
              onStartGame();
            }}
            className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
              canStart
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 cursor-pointer shadow-sm'
                : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-50'
            }`}
          >
            <span>{canStart ? 'Deal Words & Start Round' : 'Need 3+ Players to Start'}</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
