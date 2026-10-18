/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Player,
  GameSettings,
  GamePhase,
  WordPair,
  PlayerAssignment,
  RoundResult,
} from './types/game';
import { selectWordPair, assignRoles, resolveRound } from './game/gameEngine';
import { sound } from './utils/audio';

import { TitleScreen } from './components/TitleScreen';
import { PlayerSetupScreen } from './components/PlayerSetupScreen';
import { WordRevealScreen } from './components/WordRevealScreen';
import { DiscussionScreen } from './components/DiscussionScreen';
import { VotingScreen } from './components/VotingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { WordBankModal } from './components/WordBankModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { HistoryModal } from './components/HistoryModal';

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p_1', name: 'Alex', score: 0 },
  { id: 'p_2', name: 'Sam', score: 0 },
  { id: 'p_3', name: 'Jordan', score: 0 },
  { id: 'p_4', name: 'Taylor', score: 0 },
];

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'all',
  category: 'All Categories',
  imposterCount: 1,
  timerSecondsPerClue: 45,
  allowImposterGuess: true,
  avoidRecentWords: true,
  soundEnabled: true,
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('title');
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const stored = localStorage.getItem('imposter_players_clean');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_PLAYERS;
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const stored = localStorage.getItem('imposter_settings_clean');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [usedPairIds, setUsedPairIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('imposter_used_pairs_clean');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  const [customWordPairs, setCustomWordPairs] = useState<WordPair[]>(() => {
    try {
      const stored = localStorage.getItem('imposter_custom_words_clean');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  const [matchHistory, setMatchHistory] = useState<RoundResult[]>(() => {
    try {
      const stored = localStorage.getItem('imposter_match_history_clean');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  // Current Round State
  const [currentWordPair, setCurrentWordPair] = useState<WordPair | null>(null);
  const [currentAssignments, setCurrentAssignments] = useState<PlayerAssignment[]>([]);
  const [currentImposterIds, setCurrentImposterIds] = useState<string[]>([]);
  const [currentStartingPlayerId, setCurrentStartingPlayerId] = useState<string>('');
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'none' | 'wordbank' | 'howtoplay' | 'history' | 'pause'
  >('none');
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('imposter_players_clean', JSON.stringify(players));
    } catch {}
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem('imposter_settings_clean', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('imposter_used_pairs_clean', JSON.stringify(usedPairIds));
    } catch {}
  }, [usedPairIds]);

  useEffect(() => {
    try {
      localStorage.setItem('imposter_custom_words_clean', JSON.stringify(customWordPairs));
    } catch {}
  }, [customWordPairs]);

  useEffect(() => {
    try {
      localStorage.setItem('imposter_match_history_clean', JSON.stringify(matchHistory));
    } catch {}
  }, [matchHistory]);

  // Sync state to body dataset
  useEffect(() => {
    const datasetState =
      phase === 'title'
        ? 'title'
        : phase === 'results'
        ? 'gameover'
        : activeModal === 'pause'
        ? 'paused'
        : 'playing';
    document.body.dataset.state = datasetState;
  }, [phase, activeModal]);

  // Autostart URL parameter support (?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setPhase('setup');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        const newMuted = sound.toggleMute();
        setIsMuted(newMuted);
      }
      if (e.key === 'Escape') {
        if (phase !== 'title') {
          setActiveModal((prev) => (prev === 'pause' ? 'none' : 'pause'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // Start new round
  const startNewRound = useCallback(() => {
    const { wordPair } = selectWordPair(
      settings.category,
      settings.difficulty,
      settings.avoidRecentWords ? usedPairIds : []
    );

    const roleResult = assignRoles(players, wordPair, settings.imposterCount);

    setCurrentWordPair(wordPair);
    setCurrentAssignments(roleResult.assignments);
    setCurrentImposterIds(roleResult.imposterIds);
    setCurrentStartingPlayerId(roleResult.startingPlayerId);
    setCurrentRevealIndex(0);
    setRoundResult(null);

    setUsedPairIds((prev) => [...prev, wordPair.id]);
    setPhase('reveal');
  }, [players, settings, usedPairIds]);

  // Finish voting & calculate outcome
  const handleCompleteVoting = (votes: Record<string, string>) => {
    if (!currentWordPair) return;

    const result = resolveRound({
      roundId: 'round_' + Date.now(),
      players,
      wordPair: currentWordPair,
      imposterIds: currentImposterIds,
      startingPlayerId: currentStartingPlayerId,
      votes,
      allowImposterGuess: settings.allowImposterGuess,
    });

    setRoundResult(result);

    setPlayers((prev) =>
      prev.map((player) => ({
        ...player,
        score: player.score + (result.playerPoints[player.id] || 0),
      }))
    );

    setMatchHistory((prev) => [...prev, result]);
    setPhase('results');
  };

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleAddCustomPair = (pair: WordPair) => {
    setCustomWordPairs((prev) => [...prev, pair]);
  };

  const startingPlayerObj =
    players.find((p) => p.id === currentStartingPlayerId) || players[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 flex flex-col">
      {/* Top HUD Utility Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          {phase !== 'title' && (
            <button
              onClick={() => {
                sound.playBlip();
                setPhase('title');
              }}
              className="text-xs font-mono font-bold tracking-wider text-zinc-400 hover:text-white px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            >
              Imposter Word Game
            </button>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute audio [M]' : 'Mute audio [M]'}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={() => {
              sound.playBlip();
              setActiveModal('howtoplay');
            }}
            title="How to Play"
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer font-mono"
          >
            ?
          </button>

          {phase !== 'title' && (
            <button
              onClick={() => {
                sound.playBlip();
                setActiveModal('pause');
              }}
              title="Pause Menu [Esc]"
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Menu</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Game Shell Viewport */}
      <main className="relative w-full h-full flex-1 overflow-hidden pt-12">
        {phase === 'title' && (
          <TitleScreen
            onStart={() => setPhase('setup')}
            onOpenWordBank={() => setActiveModal('wordbank')}
            onOpenHowToPlay={() => setActiveModal('howtoplay')}
            onOpenHistory={() => setActiveModal('history')}
            historyCount={matchHistory.length}
          />
        )}

        {phase === 'setup' && (
          <PlayerSetupScreen
            players={players}
            settings={settings}
            onUpdatePlayers={setPlayers}
            onUpdateSettings={setSettings}
            onStartGame={startNewRound}
            onBackToTitle={() => setPhase('title')}
          />
        )}

        {phase === 'reveal' && currentWordPair && (
          <WordRevealScreen
            players={players}
            assignments={currentAssignments}
            wordPair={currentWordPair}
            currentRevealIndex={currentRevealIndex}
            onConfirmReveal={() => setCurrentRevealIndex((prev) => prev + 1)}
            onFinishAllReveals={() => setPhase('discussion')}
          />
        )}

        {phase === 'discussion' && currentWordPair && (
          <DiscussionScreen
            players={players}
            startingPlayer={startingPlayerObj}
            settings={settings}
            wordPair={currentWordPair}
            onProceedToVoting={() => setPhase('voting')}
          />
        )}

        {phase === 'voting' && (
          <VotingScreen players={players} onCompleteVoting={handleCompleteVoting} />
        )}

        {phase === 'results' && roundResult && currentWordPair && (
          <ResultsScreen
            roundResult={roundResult}
            players={players}
            wordPair={currentWordPair}
            settings={settings}
            onPlayNextRound={startNewRound}
            onNewGameSetup={() => setPhase('setup')}
            onReturnToTitle={() => setPhase('title')}
            onUpdateRoundResult={setRoundResult}
          />
        )}
      </main>

      {/* MODALS */}
      {activeModal === 'wordbank' && (
        <WordBankModal
          onClose={() => setActiveModal('none')}
          customPairs={customWordPairs}
          onAddCustomPair={handleAddCustomPair}
        />
      )}

      {activeModal === 'howtoplay' && (
        <HowToPlayModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'history' && (
        <HistoryModal
          history={matchHistory}
          onClose={() => setActiveModal('none')}
          onClearHistory={() => setMatchHistory([])}
        />
      )}

      {/* Pause Menu Modal */}
      {activeModal === 'pause' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col items-center text-center space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              Game Paused
            </h3>
            <p className="text-xs text-zinc-400">
              Pass-and-play round paused
            </p>

            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveModal('none');
                }}
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
              >
                Resume Game
              </button>

              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveModal('none');
                  startNewRound();
                }}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs cursor-pointer border border-zinc-700"
              >
                Deal New Word Pair
              </button>

              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveModal('none');
                  setPhase('setup');
                }}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs cursor-pointer border border-zinc-700"
              >
                Squad Setup & Rules
              </button>

              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveModal('none');
                  setPhase('title');
                }}
                className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs cursor-pointer border border-zinc-800"
              >
                Exit to Title Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
