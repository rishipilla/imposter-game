/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoundResult } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface HistoryModalProps {
  history: RoundResult[];
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onClose,
  onClearHistory,
}) => {
  const totalRounds = history.length;
  const innocentWins = history.filter((r) => r.winner === 'innocents').length;
  const imposterWins = history.filter((r) => r.winner === 'imposter').length;

  const innocentWinPct = totalRounds > 0 ? Math.round((innocentWins / totalRounds) * 100) : 0;
  const imposterWinPct = totalRounds > 0 ? Math.round((imposterWins / totalRounds) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span>Match History & Stats</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {totalRounds} Rounds Played
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Persistent match records stored locally on this device
            </p>
          </div>
          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Win Rate Stats Banner */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Games</span>
            <span className="text-2xl font-black text-white font-mono">{totalRounds}</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Innocents Win Rate</span>
            <span className="text-2xl font-black text-zinc-200 font-mono">
              {innocentWinPct}% <span className="text-xs font-normal text-zinc-500">({innocentWins})</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">Imposter Win Rate</span>
            <span className="text-2xl font-black text-zinc-200 font-mono">
              {imposterWinPct}% <span className="text-xs font-normal text-zinc-500">({imposterWins})</span>
            </span>
          </div>
        </div>

        {/* Round List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length > 0 ? (
            history
              .slice()
              .reverse()
              .map((round, idx) => {
                const dateStr = new Date(round.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const primaryImposter = round.imposters[0];

                return (
                  <div
                    key={round.roundId || idx}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {primaryImposter && (
                        <PlayerAvatar name={primaryImposter.name} size="sm" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700 font-bold">
                            {round.winner === 'innocents' ? 'Innocents Won' : 'Imposter Won'}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">{dateStr}</span>
                        </div>
                        <p className="text-sm font-semibold text-white mt-1">
                          {round.wordPair.normalWord}{' '}
                          <span className="text-zinc-500 font-mono text-xs">vs</span>{' '}
                          <span className="text-zinc-300">{round.wordPair.imposterWord}</span>
                        </p>
                        <span className="text-xs text-zinc-500">
                          Imposter: <strong className="text-zinc-300">{primaryImposter?.name}</strong> · Category:{' '}
                          {round.wordPair.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 sm:text-right font-mono">
                      {round.imposterCaught ? (
                        round.imposterGuessedCorrectly ? (
                          <span className="text-white">Word Guessed (Theft)</span>
                        ) : (
                          <span className="text-zinc-300">Unmasked & Caught</span>
                        )
                      ) : round.isTie ? (
                        <span className="text-zinc-400">Vote Tie (Escaped)</span>
                      ) : (
                        <span className="text-zinc-400">Innocent Accused</span>
                      )}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono">
              No rounds recorded yet. Play a game to view round logs here.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {history.length > 0 && (
          <div className="p-3 border-t border-zinc-800 flex justify-end">
            <button
              onClick={() => {
                sound.playBlip();
                onClearHistory();
              }}
              className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer"
            >
              Clear Match History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
