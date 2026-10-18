/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
              How to Play Imposter
            </h3>
            <p className="text-xs text-zinc-400">
              Pass-and-play social deduction game for 3 or more players
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm text-zinc-300">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-white text-zinc-950 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                1
              </span>
              <div>
                <h4 className="font-bold text-white">Enter Player Names</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enter at least 3 players. Use quick preset buttons for fast 3, 4, or 6 player setups.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-white text-zinc-950 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                2
              </span>
              <div>
                <h4 className="font-bold text-white">Secret Word Reveal</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pass the device to each player privately. Most players receive the exact same
                  word (e.g. <em>Spoon</em>). The Imposter secretly receives a closely related word
                  (e.g. <em>Fork</em>).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-white text-zinc-950 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                3
              </span>
              <div>
                <h4 className="font-bold text-white">Describe & Listen</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  The designated starting player goes first. Each player gives <strong>one subtle clue</strong>{' '}
                  about their word. If your clue is too obvious, the imposter figures out the real word;
                  if it's too vague, the group will suspect you!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="w-6 h-6 rounded-full bg-white text-zinc-950 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                4
              </span>
              <div>
                <h4 className="font-bold text-white">Vote & Unmask</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Players vote on who they believe is the Imposter. If the imposter is identified, the
                  Innocents win. If an Innocent is voted out or if there is a tie, the Imposter wins!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-700">
              <span className="w-6 h-6 rounded-full bg-zinc-700 text-white font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                ★
              </span>
              <div>
                <h4 className="font-bold text-white">The Imposter's Final Guess</h4>
                <p className="text-xs text-zinc-300 mt-0.5">
                  If caught, the Imposter gets one chance to guess the Innocents' real word. If they
                  guess correctly, they steal the victory and score bonus points!
                </p>
              </div>
            </div>
          </div>

          {/* Strategy Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs font-bold text-white uppercase font-mono block mb-1">
                Innocent Strategy
              </span>
              <p className="text-xs text-zinc-400">
                Focus on material, texture, or specific everyday contexts that only people holding
                the exact object would know.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs font-bold text-zinc-300 uppercase font-mono block mb-1">
                Imposter Strategy
              </span>
              <p className="text-xs text-zinc-400">
                Listen to the early clues. If you notice your word feels slightly off, pivot your
                descriptions to be versatile and confident.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
