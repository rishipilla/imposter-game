/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStart: () => void;
  onOpenWordBank: () => void;
  onOpenHowToPlay: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenWordBank,
  onOpenHowToPlay,
  onOpenHistory,
  historyCount,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playBlip(520);
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-12 select-none overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Subtle minimalist grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs tracking-wider uppercase text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          <span>Single-Device Party Edition · 280+ Things & Words</span>
        </div>
        <div className="flex items-center gap-2">
          {historyCount > 0 && (
            <button
              onClick={() => {
                sound.playBlip();
                onOpenHistory();
              }}
              className="hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800"
            >
              History ({historyCount})
            </button>
          )}
          <button
            onClick={() => {
              sound.playBlip();
              onOpenHowToPlay();
            }}
            className="hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800"
          >
            How to Play
          </button>
        </div>
      </div>

      {/* Centerpiece: Minimalist Title Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-xl px-4 space-y-6">
        {/* Sleek Minimalist Emblem */}
        <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-lg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="w-8 h-8 text-zinc-200"
          >
            {/* Minimalist eye & secret word emblem */}
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 text-[11px] font-mono tracking-widest uppercase rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
            Social Word Deduction
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-sans">
            Imposter
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-normal max-w-md mx-auto pt-1 leading-relaxed">
            Most players receive the exact same secret word. One player receives a related but
            different word. Describe, listen, and vote to uncover the imposter.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <button
            data-start="true"
            onClick={() => {
              sound.playBlip(600);
              onStart();
            }}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider uppercase bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Start Game</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Auxiliary Links */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={() => {
              sound.playBlip();
              onOpenWordBank();
            }}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            Word Bank (280+)
          </button>
          <button
            onClick={() => {
              sound.playBlip();
              onOpenHowToPlay();
            }}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            Rules Guide
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line */}
      <div className="relative z-10 w-full text-center text-xs text-zinc-500 font-mono tracking-wide">
        [Space / Enter] Start Game · [P] Pass Device · [M] Mute Audio
      </div>
    </div>
  );
};
