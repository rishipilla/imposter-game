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
  ActiveSession,
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

const SESSION_STORAGE_KEY = 'imposter_active_session_v3';
const ROSTER_STORAGE_KEY = 'imposter_saved_roster_v3';
const SETTINGS_STORAGE_KEY = 'imposter_saved_settings_v3';
const USED_PAIRS_KEY = 'imposter_used_pairs_v3';
const CUSTOM_WORDS_KEY = 'imposter_custom_words_v3';
const HISTORY_KEY = 'imposter_match_history_v3';

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

function loadSavedSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.players) && parsed.settings) {
      return parsed as ActiveSession;
    }
  } catch {
    // ignore
  }
  return null;
}

function loadSavedRoster(): Player[] | null {
  try {
    const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed as Player[];
    }
  } catch {}
  return null;
}

function loadSavedSettings(): GameSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.difficulty === 'string') {
      return parsed as GameSettings;
    }
  } catch {}
  return null;
}

export default function App() {
  const initialSession = loadSavedSession();
  const initialRoster = loadSavedRoster();
  const initialSettings = loadSavedSettings();

  // Restore previous phase if game was in-progress, else title
  const [phase, setPhase] = useState<GamePhase>(() => {
    if (initialSession) {
      // If was in setup or active round, resume directly
      if (
        initialSession.phase === 'setup' ||
        (initialSession.currentWordPair &&
          ['reveal', 'discussion', 'voting', 'results'].includes(initialSession.phase))
      ) {
        return initialSession.phase;
      }
    }
    return 'title';
  });

  // Track the latest round phase so resuming from Title always goes to the exact right screen
  const [lastActiveRoundPhase, setLastActiveRoundPhase] = useState<GamePhase>(() => {
    if (
      initialSession?.currentWordPair &&
      ['reveal', 'discussion', 'voting', 'results'].includes(initialSession.phase)
    ) {
      return initialSession.phase;
    }
    return 'reveal';
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    if (initialSession?.players?.length) return initialSession.players;
    if (initialRoster?.length) return initialRoster;
    return DEFAULT_PLAYERS;
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    if (initialSession?.settings) return initialSession.settings;
    if (initialSettings) return initialSettings;
    return DEFAULT_SETTINGS;
  });

  const [usedPairIds, setUsedPairIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(USED_PAIRS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [customWordPairs, setCustomWordPairs] = useState<WordPair[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_WORDS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [matchHistory, setMatchHistory] = useState<RoundResult[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Active round state restored from session
  const [currentWordPair, setCurrentWordPair] = useState<WordPair | null>(
    () => initialSession?.currentWordPair || null
  );
  const [currentAssignments, setCurrentAssignments] = useState<PlayerAssignment[]>(
    () => initialSession?.currentAssignments || []
  );
  const [currentImposterIds, setCurrentImposterIds] = useState<string[]>(
    () => initialSession?.currentImposterIds || []
  );
  const [currentStartingPlayerId, setCurrentStartingPlayerId] = useState<string>(
    () => initialSession?.currentStartingPlayerId || ''
  );
  const [currentRevealIndex, setCurrentRevealIndex] = useState<number>(
    () => initialSession?.currentRevealIndex ?? 0
  );
  const [roundResult, setRoundResult] = useState<RoundResult | null>(
    () => initialSession?.roundResult || null
  );
  const [savedVotes, setSavedVotes] = useState<Record<string, string>>(
    () => initialSession?.savedVotes || {}
  );

  // Modals
  const [activeModal, setActiveModal] = useState<
    'none' | 'wordbank' | 'howtoplay' | 'history' | 'pause'
  >('none');
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  // Update lastActiveRoundPhase when entering an in-round phase
  useEffect(() => {
    if (['reveal', 'discussion', 'voting', 'results'].includes(phase)) {
      setLastActiveRoundPhase(phase);
    }
  }, [phase]);

  // Persist session state to localStorage on every change
  useEffect(() => {
    const sessionData: ActiveSession = {
      phase,
      players,
      settings,
      currentWordPair,
      currentAssignments,
      currentImposterIds,
      currentStartingPlayerId,
      currentRevealIndex,
      roundResult,
      savedVotes,
      lastUpdated: Date.now(),
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch {
      // storage unavailable or full
    }
  }, [
    phase,
    players,
    settings,
    currentWordPair,
    currentAssignments,
    currentImposterIds,
    currentStartingPlayerId,
    currentRevealIndex,
    roundResult,
    savedVotes,
  ]);

  // Persist dedicated roster so custom player names & scores are NEVER lost
  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(players));
    } catch {}
  }, [players]);

  // Persist dedicated settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Persist auxiliary data
  useEffect(() => {
    try {
      localStorage.setItem(USED_PAIRS_KEY, JSON.stringify(usedPairIds));
    } catch {}
  }, [usedPairIds]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(customWordPairs));
    } catch {}
  }, [customWordPairs]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(matchHistory));
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
    if (params.get('autostart') === '1' && phase === 'title') {
      setPhase('setup');
    }
  }, [phase]);

  // Global keyboard shortcuts
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
    setSavedVotes({});

    setUsedPairIds((prev) => [...prev, wordPair.id]);
    setPhase('reveal');
  }, [players, settings, usedPairIds]);

  // Reset round state to setup (keeps player names and scores!)
  const handleResetToSetup = () => {
    setCurrentWordPair(null);
    setCurrentAssignments([]);
    setCurrentImposterIds([]);
    setCurrentStartingPlayerId('');
    setCurrentRevealIndex(0);
    setRoundResult(null);
    setSavedVotes({});
    setPhase('setup');
  };

  // Reset player scores back to 0 while keeping customized names
  const handleResetScores = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
  };

  // Full reset to fresh defaults
  const handleResetSessionAndRoster = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(ROSTER_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {}
    setPlayers(DEFAULT_PLAYERS);
    setSettings(DEFAULT_SETTINGS);
    setCurrentWordPair(null);
    setCurrentAssignments([]);
    setCurrentImposterIds([]);
    setCurrentStartingPlayerId('');
    setCurrentRevealIndex(0);
    setRoundResult(null);
    setSavedVotes({});
    setPhase('title');
  };

  // Finish voting & calculate outcome
  const handleCompleteVoting = (votes: Record<string, string>) => {
    if (!currentWordPair) return;

    setSavedVotes(votes);

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

    // Update accumulated scores
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

  const hasActiveRound = Boolean(currentWordPair && currentAssignments.length > 0);

  const phaseDisplayNames: Record<GamePhase, string> = {
    title: 'Title',
    setup: 'Setup',
    reveal: 'Card Reveal',
    discussion: 'Clues & Discussion',
    voting: 'Voting',
    results: 'Results',
    wordbank: 'Word Bank',
    history: 'History',
  };

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
            players={players}
            settings={settings}
            onStartSetup={handleResetToSetup}
            onStartRoundDirectly={startNewRound}
            onResume={
              hasActiveRound
                ? () => {
                    setPhase(lastActiveRoundPhase);
                  }
                : undefined
            }
            hasActiveRound={hasActiveRound}
            activePhaseName={phaseDisplayNames[lastActiveRoundPhase || 'reveal']}
            onOpenWordBank={() => setActiveModal('wordbank')}
            onOpenHowToPlay={() => setActiveModal('howtoplay')}
            onOpenHistory={() => setActiveModal('history')}
            historyCount={matchHistory.length}
            onResetSession={handleResetSessionAndRoster}
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
            onResetScores={handleResetScores}
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
          <VotingScreen
            players={players}
            savedVotes={savedVotes}
            onVotesUpdate={setSavedVotes}
            onCompleteVoting={handleCompleteVoting}
          />
        )}

        {phase === 'results' && roundResult && currentWordPair && (
          <ResultsScreen
            roundResult={roundResult}
            players={players}
            wordPair={currentWordPair}
            settings={settings}
            onPlayNextRound={startNewRound}
            onNewGameSetup={handleResetToSetup}
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
              Session state is safely remembered on this device
            </p>

            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  sound.playBlip();
                  setActiveModal('none');
                }}
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
              >
                Resume Current Round
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
                  handleResetToSetup();
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
