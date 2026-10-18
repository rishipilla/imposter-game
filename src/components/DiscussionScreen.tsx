/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, GameSettings, WordPair } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface DiscussionScreenProps {
  players: Player[];
  startingPlayer: Player;
  settings: GameSettings;
  wordPair: WordPair;
  onProceedToVoting: () => void;
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({
  players,
  startingPlayer,
  settings,
  wordPair,
  onProceedToVoting,
}) => {
  const startingIndex = players.findIndex((p) => p.id === startingPlayer.id);
  const orderedPlayers = [
    ...players.slice(startingIndex),
    ...players.slice(0, startingIndex),
  ];

  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(settings.timerSecondsPerClue);
  const [isTimerRunning, setIsTimerRunning] = useState(settings.timerSecondsPerClue > 0);

  useEffect(() => {
    sound.playVictoryFanfare();
  }, []);

  useEffect(() => {
    if (!isTimerRunning || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          sound.playImposterCaught();
          return 0;
        }
        if (prev <= 5) {
          sound.playTick(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, secondsRemaining]);

  const activePlayer = orderedPlayers[activeSpeakerIndex];

  const handleNextSpeaker = () => {
    sound.playBlip(540);
    const nextIdx = (activeSpeakerIndex + 1) % orderedPlayers.length;
    setActiveSpeakerIndex(nextIdx);
    setSecondsRemaining(settings.timerSecondsPerClue);
    setIsTimerRunning(settings.timerSecondsPerClue > 0);
  };

  const handlePrevSpeaker = () => {
    sound.playBlip(460);
    const prevIdx = (activeSpeakerIndex - 1 + orderedPlayers.length) % orderedPlayers.length;
    setActiveSpeakerIndex(prevIdx);
    setSecondsRemaining(settings.timerSecondsPerClue);
    setIsTimerRunning(settings.timerSecondsPerClue > 0);
  };

  const timerTotal = settings.timerSecondsPerClue || 30;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    settings.timerSecondsPerClue > 0
      ? circumference - (secondsRemaining / timerTotal) * circumference
      : 0;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none bg-zinc-950 text-zinc-100 overflow-y-auto">
      {/* Top Bar: Category Info */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          <span className="text-zinc-400">Word Category:</span>
          <span className="text-white font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            {wordPair.category}
          </span>
        </div>
        <div className="text-zinc-400">
          Clue Phase · Round in Progress
        </div>
      </div>

      {/* Main Center Area */}
      <div className="w-full max-w-xl flex flex-col items-center my-auto py-4 space-y-6">
        {/* Spotlight Starting Player Header */}
        <div className="text-center space-y-1">
          <div className="inline-block px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-full">
            First Clue: {startingPlayer.name}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Discussion & Clues
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Take turns describing your secret word. Do not say the word itself!
          </p>
        </div>

        {/* Active Speaker Spotlight Card */}
        <div className="relative w-full p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full text-xs font-mono text-zinc-400">
            <span>Speaker {activeSpeakerIndex + 1} of {orderedPlayers.length}</span>
            <span className="text-zinc-300 font-semibold">Active Turn</span>
          </div>

          <div className="py-2">
            <PlayerAvatar name={activePlayer.name} size="lg" highlight />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white tracking-wide">
              {activePlayer.name}'s Turn to Give a Clue
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Speak one short clue or phrase to the group
            </p>
          </div>

          {/* Countdown Timer in clean white/grey */}
          {settings.timerSecondsPerClue > 0 && (
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 w-full justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-zinc-800"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${
                      secondsRemaining <= 5 ? 'text-zinc-100 animate-pulse' : 'text-zinc-300'
                    }`}
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-mono text-base font-bold text-white">
                  {secondsRemaining}s
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer"
                >
                  {isTimerRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => setSecondsRemaining(settings.timerSecondsPerClue)}
                  className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-400 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between w-full gap-2 pt-2">
            <button
              onClick={handlePrevSpeaker}
              disabled={activeSpeakerIndex === 0}
              className={`px-3 py-2 rounded-xl text-xs font-medium border cursor-pointer transition-colors ${
                activeSpeakerIndex === 0
                  ? 'opacity-30 border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              ← Previous
            </button>
            <button
              onClick={handleNextSpeaker}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              {activeSpeakerIndex === orderedPlayers.length - 1
                ? '↺ Loop to Start'
                : 'Next Speaker →'}
            </button>
          </div>
        </div>

        {/* Turn Order Avatar Queue */}
        <div className="w-full flex items-center justify-center gap-2 overflow-x-auto py-2 px-1">
          {orderedPlayers.map((player, idx) => (
            <button
              key={player.id}
              onClick={() => {
                sound.playBlip(500);
                setActiveSpeakerIndex(idx);
                setSecondsRemaining(settings.timerSecondsPerClue);
              }}
              className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                idx === activeSpeakerIndex
                  ? 'bg-zinc-900 border-zinc-300 ring-1 ring-zinc-300'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 opacity-60 hover:opacity-100'
              }`}
            >
              <PlayerAvatar name={player.name} size="sm" />
              <span className="text-[11px] font-medium text-zinc-300 mt-1 max-w-[65px] truncate">
                {player.name}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono">#{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Action: Proceed to Voting */}
      <div className="w-full max-w-md pt-2">
        <button
          onClick={() => {
            sound.playBlip(620);
            onProceedToVoting();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-200 active:scale-95 text-zinc-950 font-bold text-sm tracking-wide uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <span>All Clues Given · Start Voting</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
