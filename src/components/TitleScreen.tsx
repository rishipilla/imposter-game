/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Player, GameSettings } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  players: Player[];
  settings: GameSettings;
  onStartSetup: () => void;
  onStartRoundDirectly: () => void;
  onResume?: () => void;
  hasActiveRound?: boolean;
  activePhaseName?: string;
  onOpenWordBank: () => void;
  onOpenHowToPlay: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onResetSession?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  players,
  settings,
  onStartSetup,
  onStartRoundDirectly,
  onResume,
  hasActiveRound = false,
  activePhaseName = 'Round',
  onOpenWordBank,
  onOpenHowToPlay,
  onOpenHistory,
  historyCount,
  onResetSession,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playBlip(520);
        if (hasActiveRound && onResume) {
          onResume();
        } else {
          onStartRoundDirectly();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasActiveRound, onResume, onStartRoundDirectly]);

  const hasScore = players.some((p) => p.score > 0);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-y-auto bg-zinc-950 text-zinc-100">
      {/* Subtle minimalist grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs tracking-wider uppercase text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Session Remembered ·</span>
          <span>{players.length} Players Ready</span>
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

      {/* Centerpiece: Title & Session Card */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-xl w-full px-2 py-4 space-y-5">
        {/* Sleek Minimalist Emblem */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-lg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-200"
          >
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="inline-block px-3 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
            Social Word Deduction
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-sans">
            Imposter
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-md mx-auto leading-relaxed">
            Describe, listen, and deduce. Most players receive the same word. One is the imposter with a related secret word.
          </p>
        </div>

        {/* Remembered Session Squad Card */}
        <div className="w-full max-w-md p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow-lg text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span className="font-bold text-zinc-300">Remembered Squad</span>
              <span>({players.length})</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {settings.category} · {settings.difficulty}
            </span>
          </div>

          {/* Player badges horizontal row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0"
              >
                <PlayerAvatar name={p.name} size="sm" showLabel={false} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white max-w-[85px] truncate">
                    {p.name}
                  </span>
                  {p.score > 0 ? (
                    <span className="text-[10px] text-zinc-400 font-mono leading-none">
                      {p.score} pts
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-mono leading-none">
                      Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasActiveRound && (
            <div className="px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-700/60 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Active Round in Progress
              </span>
              <span className="text-white font-bold">{activePhaseName}</span>
            </div>
          )}
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col items-center gap-2.5 w-full max-w-xs pt-1">
          {hasActiveRound && onResume ? (
            <>
              <button
                data-start="true"
                onClick={() => {
                  sound.playBlip(600);
                  onResume();
                }}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider uppercase bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Resume Round ({activePhaseName})</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  sound.playBlip(520);
                  onStartRoundDirectly();
                }}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs tracking-wider uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 transition-all cursor-pointer"
              >
                Start New Round with Squad
              </button>

              <button
                onClick={() => {
                  sound.playBlip(480);
                  onStartSetup();
                }}
                className="w-full py-2 px-4 rounded-xl font-normal text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✎ Edit Squad & Rules
              </button>
            </>
          ) : (
            <>
              <button
                data-start="true"
                onClick={() => {
                  sound.playBlip(600);
                  onStartRoundDirectly();
                }}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider uppercase bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Deal Words & Start</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  sound.playBlip(520);
                  onStartSetup();
                }}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs tracking-wider uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer"
              >
                ✎ Edit Squad & Settings
              </button>
            </>
          )}
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
          {onResetSession && (
            <button
              onClick={() => {
                if (window.confirm('Reset saved squad and scores to default?')) {
                  sound.playBlip(380);
                  onResetSession();
                }
              }}
              title="Reset squad to initial defaults"
              className="px-2.5 py-1.5 text-[11px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              Reset Session
            </button>
          )}
        </div>
      </div>

      {/* Flat Control Hint Line */}
      <div className="relative z-10 w-full text-center text-xs text-zinc-500 font-mono tracking-wide pb-1">
        [Space / Enter] {hasActiveRound ? 'Resume Round' : 'Start Round'} · [P] Pass Device · [M] Mute Audio
      </div>
    </div>
  );
};
