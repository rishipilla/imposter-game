/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, PlayerAssignment, WordPair } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface WordRevealScreenProps {
  players: Player[];
  assignments: PlayerAssignment[];
  wordPair: WordPair;
  currentRevealIndex: number;
  onConfirmReveal: () => void;
  onFinishAllReveals: () => void;
}

export const WordRevealScreen: React.FC<WordRevealScreenProps> = ({
  players,
  assignments,
  wordPair,
  currentRevealIndex,
  onConfirmReveal,
  onFinishAllReveals,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = players[currentRevealIndex];
  const currentAssignment = assignments.find((a) => a.playerId === currentPlayer?.id);
  const isLastPlayer = currentRevealIndex === players.length - 1;

  if (!currentPlayer || !currentAssignment) {
    return null;
  }

  const handleReveal = () => {
    sound.playCardFlip();
    setIsRevealed(true);
  };

  const handleHideAndPass = () => {
    sound.playBlip(500);
    setIsRevealed(false);
    if (isLastPlayer) {
      onFinishAllReveals();
    } else {
      onConfirmReveal();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 select-none bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Progress Bar & Status Cluster */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="uppercase tracking-wider">Secret Word Distribution</span>
          <span className="text-white font-bold">
            Player {currentRevealIndex + 1} of {players.length}
          </span>
        </div>
        {/* Step segments */}
        <div className="flex gap-1.5 w-full">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx < currentRevealIndex
                  ? 'bg-zinc-200'
                  : idx === currentRevealIndex
                  ? 'bg-zinc-400 animate-pulse'
                  : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Secret Card Container */}
      <div className="relative z-10 my-auto w-full max-w-sm flex flex-col items-center">
        {!isRevealed ? (
          /* Handoff Privacy Shield Stage */
          <div className="w-full flex flex-col items-center p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl text-center space-y-6">
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-950 rounded-full border border-zinc-800">
                Pass Device To
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                {currentPlayer.name}
              </h2>
            </div>

            {/* Player Avatar */}
            <div className="py-2">
              <PlayerAvatar name={currentPlayer.name} size="lg" highlight />
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
              🔒 <strong className="text-zinc-200">Keep screen private.</strong> Only{' '}
              <span className="text-white font-semibold">{currentPlayer.name}</span> should view
              the next card.
            </div>

            {/* Tap to Reveal Button */}
            <button
              onClick={handleReveal}
              className="w-full py-4 px-6 rounded-2xl bg-white text-zinc-950 font-bold text-sm tracking-wide uppercase shadow-sm hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Tap to Reveal Word</span>
            </button>
          </div>
        ) : (
          /* Revealed Secret Word Stage */
          <div className="w-full flex flex-col items-center p-6 sm:p-8 rounded-3xl bg-zinc-900 border-2 border-zinc-700 shadow-2xl text-center space-y-6 animate-scale-in">
            {/* Role Header */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-mono tracking-wider uppercase text-zinc-400">
                Category: <strong className="text-white">{wordPair.category}</strong>
              </span>

              {/* Imposter vs Innocent Badge */}
              {currentAssignment.isImposter ? (
                <div className="mt-1 px-3.5 py-1 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-200 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  You are the IMPOSTER
                </div>
              ) : (
                <div className="mt-1 px-3.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  You are INNOCENT
                </div>
              )}
            </div>

            {/* Secret Word Display */}
            <div className="w-full py-6 px-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center shadow-inner">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                Your Secret Word
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-wide uppercase break-words">
                {currentAssignment.word}
              </div>
              <span className="text-xs text-zinc-500 mt-2 italic">
                Clue hint: "{wordPair.hint}"
              </span>
            </div>

            {/* Role Advice Notice */}
            <div className="text-xs text-zinc-400 leading-relaxed px-2">
              {currentAssignment.isImposter ? (
                <p>
                  Everyone else has a slightly different word. Listen closely to their clues,
                  blend in with a plausible clue, and avoid suspicion!
                </p>
              ) : (
                <p>
                  Give a subtle clue showing you know the word without giving it away to the
                  secret imposter!
                </p>
              )}
            </div>

            {/* Hide Word and Continue Action */}
            <button
              onClick={handleHideAndPass}
              className="w-full py-4 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs tracking-wide uppercase border border-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-400">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <span>{isLastPlayer ? 'Hide & Begin Clues' : 'Hide Word & Pass Phone'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer safe margin hint */}
      <div className="relative z-10 text-center text-xs text-zinc-500 font-mono">
        Pass the device privately · Do not say your word out loud
      </div>
    </div>
  );
};
