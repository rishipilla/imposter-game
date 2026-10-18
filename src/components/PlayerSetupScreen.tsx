/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  onResetScores: () => void;
}

export const PlayerSetupScreen: React.FC<PlayerSetupScreenProps> = ({
  players,
  settings,
  onUpdatePlayers,
  onUpdateSettings,
  onStartGame,
  onBackToTitle,
  onResetScores,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Name editing state
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>('Changes auto-saved to session');

  useEffect(() => {
    const t = setTimeout(() => {
      setSavedNotice(null);
    }, 2500);
    return () => clearTimeout(t);
  }, [players, settings]);

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Auto-commit any currently active inline edit first
    if (editingPlayerId) {
      commitEditIfValid(editingPlayerId, editNameValue);
    }

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
    setSavedNotice('Added player and saved');
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 3) {
      setValidationError('A minimum of 3 players is required for deduction.');
      return;
    }
    setValidationError(null);
    sound.playBlip(380);
    if (editingPlayerId === id) {
      setEditingPlayerId(null);
    }
    onUpdatePlayers(players.filter((p) => p.id !== id));
    setSavedNotice('Removed player and saved');
  };

  const handleStartEdit = (player: Player) => {
    // If another player was being edited, commit it first
    if (editingPlayerId && editingPlayerId !== player.id) {
      commitEditIfValid(editingPlayerId, editNameValue);
    }
    sound.playBlip(520);
    setValidationError(null);
    setEditingPlayerId(player.id);
    setEditNameValue(player.name);
  };

  const commitEditIfValid = (playerId: string, value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      // Revert if empty
      setEditingPlayerId(null);
      return false;
    }

    const isDuplicate = players.some(
      (p) => p.id !== playerId && p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setValidationError(`"${trimmed}" is already used by another player.`);
      return false;
    }

    // Only update if changed
    const current = players.find((p) => p.id === playerId);
    if (current && current.name !== trimmed) {
      sound.playBlip(600);
      onUpdatePlayers(
        players.map((p) => (p.id === playerId ? { ...p, name: trimmed } : p))
      );
      setSavedNotice(`Saved name: ${trimmed}`);
    }
    setEditingPlayerId(null);
    setValidationError(null);
    return true;
  };

  const handleSaveEdit = (playerId: string) => {
    commitEditIfValid(playerId, editNameValue);
  };

  const handleCancelEdit = () => {
    sound.playBlip(400);
    setValidationError(null);
    setEditingPlayerId(null);
  };

  const handleApplyPreset = (presetNames: string[]) => {
    sound.playBlip(550);
    setValidationError(null);
    setEditingPlayerId(null);
    const newPlayers: Player[] = presetNames.map((name, i) => ({
      id: 'preset_' + i + '_' + Date.now(),
      name,
      score: 0,
    }));
    onUpdatePlayers(newPlayers);
    setSavedNotice(`Loaded preset: ${presetNames.length} players`);
  };

  const handleStartWithSave = () => {
    if (editingPlayerId) {
      const ok = commitEditIfValid(editingPlayerId, editNameValue);
      if (!ok) return;
    }
    onStartGame();
  };

  const canStart = players.length >= 3;
  const hasScores = players.some((p) => p.score > 0);

  return (
    <div className="relative w-full h-full flex flex-col p-4 sm:p-6 overflow-y-auto select-none bg-zinc-950 text-zinc-100">
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-zinc-800">
        <button
          onClick={() => {
            if (editingPlayerId) commitEditIfValid(editingPlayerId, editNameValue);
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
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono">
            <span>{players.length} Players Configured</span>
            {savedNotice && (
              <span className="text-emerald-400 font-medium text-[11px] animate-fade-in flex items-center gap-1">
                <span>✓</span> {savedNotice}
              </span>
            )}
          </div>
        </div>

        <div className="w-20 text-right">
          {hasScores && (
            <button
              onClick={() => {
                if (window.confirm('Reset all player points to 0? Player names will be kept.')) {
                  onResetScores();
                  setSavedNotice('Scores reset to 0');
                }
              }}
              title="Reset scores to 0 while keeping player names"
              className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors cursor-pointer"
            >
              Reset Points
            </button>
          )}
        </div>
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
                placeholder="Enter new player name..."
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

          {/* Current Players Grid with Inline Name Editing */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="font-bold text-zinc-300">Players ({players.length})</span>
              <span className="text-[11px] text-zinc-400">Click any name or ✎ to edit</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map((player) => {
                const isEditing = editingPlayerId === player.id;

                return (
                  <div
                    key={player.id}
                    className={`relative p-3 rounded-xl bg-zinc-950 border transition-all flex flex-col items-center justify-between min-h-[140px] ${
                      isEditing
                        ? 'border-white ring-1 ring-white'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Remove Player Button */}
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      title={`Remove ${player.name}`}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs opacity-60 hover:opacity-100 transition-all cursor-pointer"
                    >
                      ×
                    </button>

                    {/* Monogram Avatar (updates initials live) */}
                    <PlayerAvatar
                      name={isEditing && editNameValue ? editNameValue : player.name}
                      size="md"
                      showLabel={false}
                    />

                    {/* Editable Name Section */}
                    {isEditing ? (
                      <div className="w-full mt-2 flex flex-col items-center gap-1.5 animate-fade-in">
                        <input
                          autoFocus
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onBlur={() => {
                            // Auto-save on blur if non-empty
                            commitEditIfValid(player.id, editNameValue);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit(player.id);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                          }}
                          maxLength={20}
                          placeholder="Player name..."
                          className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-white font-medium"
                        />
                        <div className="flex items-center gap-1 w-full justify-center">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(player.id)}
                            title="Save name (Enter)"
                            className="px-2.5 py-0.5 rounded bg-white text-zinc-950 font-bold text-[11px] hover:bg-zinc-200 cursor-pointer shadow-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            title="Cancel (Esc)"
                            className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full mt-1.5 flex flex-col items-center text-center">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(player)}
                          title="Click to edit name"
                          className="group/name flex items-center justify-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-900 transition-colors cursor-pointer max-w-full"
                        >
                          <span className="text-sm font-semibold text-zinc-100 truncate max-w-[95px] group-hover/name:text-white">
                            {player.name}
                          </span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3 h-3 text-zinc-500 group-hover/name:text-zinc-200 shrink-0"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {player.score > 0 ? `${player.score} pts` : 'Click to edit'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
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
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-300 cursor-pointer"
              >
                <option value="All Categories">All Categories (280+ Words & Things)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-300 font-medium">Difficulty Level</label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      sound.playBlip(500);
                      onUpdateSettings({ ...settings, difficulty: diff });
                    }}
                    className={`py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                      settings.difficulty === diff
                        ? 'bg-white text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {diff === 'all' ? 'Any' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Imposter Count Toggle */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">Imposters</span>
                <span className="text-zinc-500 font-mono">
                  {settings.imposterCount === 1 ? '1 Imposter' : '2 Imposters'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBlip(500);
                    onUpdateSettings({ ...settings, imposterCount: 1 });
                  }}
                  className={`py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    settings.imposterCount === 1
                      ? 'bg-white text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  1 Imposter
                </button>
                <button
                  type="button"
                  disabled={players.length < 5}
                  onClick={() => {
                    sound.playBlip(500);
                    onUpdateSettings({ ...settings, imposterCount: 2 });
                  }}
                  className={`py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    settings.imposterCount === 2
                      ? 'bg-white text-zinc-950 font-bold'
                      : players.length < 5
                      ? 'text-zinc-600 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={players.length < 5 ? 'Requires 5+ players' : ''}
                >
                  2 Imposters {players.length < 5 ? '(5+ req)' : ''}
                </button>
              </div>
            </div>

            {/* Discussion Timer Setting */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-300 font-medium">Clue Speaker Timer</label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                {[0, 30, 45, 60].map((seconds) => (
                  <button
                    key={seconds}
                    type="button"
                    onClick={() => {
                      sound.playBlip(500);
                      onUpdateSettings({ ...settings, timerSecondsPerClue: seconds });
                    }}
                    className={`py-1.5 text-xs font-semibold tracking-wider rounded-lg transition-colors cursor-pointer ${
                      settings.timerSecondsPerClue === seconds
                        ? 'bg-white text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {seconds === 0 ? 'Off' : `${seconds}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
              <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                <span className="text-zinc-300">Imposter Word Guess Rule</span>
                <input
                  type="checkbox"
                  checked={settings.allowImposterGuess}
                  onChange={(e) => {
                    sound.playBlip();
                    onUpdateSettings({ ...settings, allowImposterGuess: e.target.checked });
                  }}
                  className="rounded border-zinc-700 text-white focus:ring-0 cursor-pointer accent-white"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                <span className="text-zinc-300">Avoid Recently Used Words</span>
                <input
                  type="checkbox"
                  checked={settings.avoidRecentWords}
                  onChange={(e) => {
                    sound.playBlip();
                    onUpdateSettings({ ...settings, avoidRecentWords: e.target.checked });
                  }}
                  className="rounded border-zinc-700 text-white focus:ring-0 cursor-pointer accent-white"
                />
              </label>
            </div>
          </div>

          {/* Start CTA */}
          <button
            onClick={handleStartWithSave}
            disabled={!canStart}
            className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              canStart
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-98'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span>DEAL WORDS & START ROUND</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
