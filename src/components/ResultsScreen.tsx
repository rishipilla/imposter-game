/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, WordPair, RoundResult, GameSettings } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { checkWordGuess } from '../game/gameEngine';
import { sound } from '../utils/audio';

interface ResultsScreenProps {
  roundResult: RoundResult;
  players: Player[];
  wordPair: WordPair;
  settings: GameSettings;
  onPlayNextRound: () => void;
  onNewGameSetup: () => void;
  onReturnToTitle: () => void;
  onUpdateRoundResult: (updated: RoundResult) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  roundResult,
  players,
  wordPair,
  settings,
  onPlayNextRound,
  onNewGameSetup,
  onReturnToTitle,
  onUpdateRoundResult,
}) => {
  const [imposterGuessInput, setImposterGuessInput] = useState('');
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'outcome' | 'votes' | 'scores'>('outcome');

  const { imposters, innocents, winner, imposterCaught, isTie, tally } = roundResult;
  const primaryImposter = imposters[0];

  useEffect(() => {
    if (winner === 'innocents') {
      sound.playVictoryFanfare();
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a'],
        });
      } catch {
        // ignore
      }
    } else {
      sound.playRevealGong();
    }
  }, [winner]);

  const handleImposterGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imposterGuessInput.trim() || guessSubmitted) return;

    sound.playBlip(600);
    const isCorrect = checkWordGuess(imposterGuessInput, wordPair.normalWord);
    setGuessSubmitted(true);

    if (isCorrect) {
      sound.playVictoryFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#ffffff', '#d4d4d8', '#71717a'],
        });
      } catch {
        // ignore
      }
    } else {
      sound.playImposterCaught();
    }

    const updatedWinner = isCorrect ? ('imposter' as const) : ('innocents' as const);
    const updatedPoints = { ...roundResult.playerPoints };

    if (isCorrect) {
      for (const inn of innocents) {
        updatedPoints[inn.id] = 0;
      }
      for (const imp of imposters) {
        updatedPoints[imp.id] = 25;
      }
    }

    onUpdateRoundResult({
      ...roundResult,
      imposterGuess: imposterGuessInput,
      imposterGuessedCorrectly: isCorrect,
      winner: updatedWinner,
      playerPoints: updatedPoints,
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none bg-zinc-950 text-zinc-100 overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          <span className="text-white font-bold uppercase tracking-wider">
            Round Summary & Results
          </span>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          {(['outcome', 'votes', 'scores'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sound.playBlip();
                setActiveTab(tab);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'bg-white text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="w-full max-w-2xl my-auto py-4 flex flex-col items-center space-y-6">
        {activeTab === 'outcome' && (
          <div className="w-full flex flex-col items-center space-y-6">
            {/* Outcome Banner */}
            <div className="text-center space-y-2">
              <div
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest font-black border ${
                  winner === 'innocents'
                    ? 'bg-zinc-900 text-white border-zinc-700'
                    : 'bg-zinc-800 text-white border-zinc-500'
                }`}
              >
                {winner === 'innocents'
                  ? 'Innocents Win'
                  : roundResult.imposterGuessedCorrectly
                  ? 'Imposter Guessed the Word & Stole Victory'
                  : 'Imposter Escaped & Wins'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {imposterCaught
                  ? roundResult.imposterGuessedCorrectly
                    ? `${primaryImposter.name} stole the win with a correct guess!`
                    : 'The Imposter was unmasked!'
                  : isTie
                  ? 'The vote was a Tie! Imposter Escaped!'
                  : 'An Innocent was wrongly accused!'}
              </h2>
            </div>

            {/* Unmasked Imposter Showcase */}
            <div className="w-full p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col items-center text-center gap-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                The Secret Imposter
              </span>

              <div className="py-2">
                <PlayerAvatar
                  name={primaryImposter.name}
                  size="xl"
                  highlight
                  isImposterGlitch
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">
                  {primaryImposter.name}
                </h3>
                <p className="text-xs text-zinc-400 font-medium font-mono">
                  Role: Imposter
                </p>
              </div>
            </div>

            {/* Side-by-Side Secret Words Reveal */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Innocents Word Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center gap-1 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  Innocents' Word
                </span>
                <span className="text-2xl font-black text-white uppercase tracking-wide">
                  {wordPair.normalWord}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Assigned to {innocents.length} players
                </span>
              </div>

              {/* Imposter Word Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center gap-1 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  Imposter's Word
                </span>
                <span className="text-2xl font-black text-zinc-300 uppercase tracking-wide">
                  {wordPair.imposterWord}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Assigned to {primaryImposter.name}
                </span>
              </div>
            </div>

            {/* Imposter Guess Minigame */}
            {settings.allowImposterGuess && imposterCaught && !guessSubmitted && (
              <form
                onSubmit={handleImposterGuessSubmit}
                className="w-full p-5 rounded-2xl bg-zinc-900 border border-zinc-700 flex flex-col gap-3 shadow-md"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">
                    Last Chance: Guess the Secret Word
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {primaryImposter.name}, if you can guess what word the innocents had, you steal
                    the victory!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={imposterGuessInput}
                    onChange={(e) => setImposterGuessInput(e.target.value)}
                    placeholder="Enter what you think their word was..."
                    className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-zinc-300 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wide cursor-pointer active:scale-95 transition-all"
                  >
                    Submit Guess
                  </button>
                </div>
              </form>
            )}

            {guessSubmitted && roundResult.imposterGuess && (
              <div
                className={`w-full p-4 rounded-2xl border text-center text-xs font-mono font-bold uppercase ${
                  roundResult.imposterGuessedCorrectly
                    ? 'bg-zinc-900 border-white text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                {roundResult.imposterGuessedCorrectly
                  ? `Correct! ${primaryImposter.name} guessed "${roundResult.imposterGuess}" and stole the win!`
                  : `Guess "${roundResult.imposterGuess}" was incorrect. Real word was "${wordPair.normalWord}".`}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Vote Breakdown */}
        {activeTab === 'votes' && (
          <div className="w-full flex flex-col gap-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-white">Vote Tally</h3>
              <p className="text-xs text-zinc-400">
                Detailed breakdown of who voted for whom
              </p>
            </div>

            <div className="space-y-2.5">
              {tally.map((item) => {
                const suspect = players.find((p) => p.id === item.suspectId);
                if (!suspect) return null;
                const isActualImposter = imposters.some((imp) => imp.id === suspect.id);
                const voters = item.voterIds
                  .map((id) => players.find((p) => p.id === id)?.name)
                  .filter(Boolean);

                return (
                  <div
                    key={item.suspectId}
                    className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={suspect.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{suspect.name}</span>
                          {isActualImposter && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold uppercase border border-zinc-700">
                              Imposter
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">
                          {voters.length > 0
                            ? `Voted by: ${voters.join(', ')}`
                            : 'No votes received'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-mono font-bold text-white">
                        {item.count}
                      </span>
                      <span className="text-xs text-zinc-500 ml-1">
                        {item.count === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Match Scores */}
        {activeTab === 'scores' && (
          <div className="w-full flex flex-col gap-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-white">Scoreboard</h3>
              <p className="text-xs text-zinc-400">
                Scores across rounds on this device
              </p>
            </div>

            <div className="space-y-2">
              {players
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((player, idx) => {
                  const roundGain = roundResult.playerPoints[player.id] || 0;

                  return (
                    <div
                      key={player.id}
                      className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 font-mono font-bold text-zinc-400 text-sm">
                          #{idx + 1}
                        </span>
                        <PlayerAvatar name={player.name} size="sm" />
                        <div>
                          <p className="text-sm font-bold text-white">{player.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-mono font-bold text-white">
                          {player.score} pts
                        </span>
                        {roundGain > 0 && (
                          <span className="text-xs text-zinc-400 block font-mono">
                            +{roundGain} this round
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2 pt-2">
        <button
          onClick={() => {
            sound.playBlip(600);
            onPlayNextRound();
          }}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 active:scale-95 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Play Next Round</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={() => {
            sound.playBlip();
            onNewGameSetup();
          }}
          className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-zinc-800 transition-colors cursor-pointer"
        >
          Change Squad
        </button>

        <button
          onClick={() => {
            sound.playBlip();
            onReturnToTitle();
          }}
          className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-zinc-800 transition-colors cursor-pointer"
        >
          Title Screen
        </button>
      </div>
    </div>
  );
};
