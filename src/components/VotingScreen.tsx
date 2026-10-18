/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../utils/audio';

interface VotingScreenProps {
  players: Player[];
  onCompleteVoting: (votes: Record<string, string>) => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  players,
  onCompleteVoting,
}) => {
  const [voteMode, setVoteMode] = useState<'secret' | 'open'>('secret');
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentVoter = players[currentVoterIndex];

  const handleSelectSuspect = (suspectId: string) => {
    sound.playBlip(540);
    setSelectedSuspectId(suspectId);
  };

  const handleConfirmVote = () => {
    if (!selectedSuspectId) return;
    sound.playBlip(620);
    const updatedVotes = {
      ...votes,
      [currentVoter.id]: selectedSuspectId,
    };
    setVotes(updatedVotes);
    setSelectedSuspectId(null);
    setShowConfirmModal(false);

    if (currentVoterIndex < players.length - 1) {
      setCurrentVoterIndex(currentVoterIndex + 1);
    } else {
      onCompleteVoting(updatedVotes);
    }
  };

  const handleOpenVote = (voterId: string, suspectId: string) => {
    sound.playBlip(520);
    setVotes((prev) => ({
      ...prev,
      [voterId]: suspectId,
    }));
  };

  const allVotedInOpenMode = players.every((p) => Boolean(votes[p.id]));

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none bg-zinc-950 text-zinc-100 overflow-y-auto">
      {/* Top Header & Mode Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          <span className="text-white font-bold uppercase tracking-wider">
            Accusation & Voting
          </span>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => {
              sound.playBlip();
              setVoteMode('secret');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              voteMode === 'secret'
                ? 'bg-white text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Secret Pass-Vote
          </button>
          <button
            onClick={() => {
              sound.playBlip();
              setVoteMode('open');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              voteMode === 'open'
                ? 'bg-white text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Open Table Vote
          </button>
        </div>
      </div>

      {voteMode === 'secret' ? (
        /* SECRET PASS-AND-VOTE MODE */
        <div className="w-full max-w-xl my-auto py-4 flex flex-col items-center space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Voter {currentVoterIndex + 1} of {players.length}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {currentVoter.name}, who is the Imposter?
            </h2>
            <p className="text-xs text-zinc-400">
              Select the player you suspect received the different word
            </p>
          </div>

          {/* Current Voter Identity Banner */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800">
            <PlayerAvatar name={currentVoter.name} size="sm" />
            <div className="text-left">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Current Voter</span>
              <p className="text-sm font-bold text-white">{currentVoter.name}</p>
            </div>
          </div>

          {/* Suspects Selection Grid */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
            {players.map((suspect) => {
              const isSelected = selectedSuspectId === suspect.id;
              const isSelf = suspect.id === currentVoter.id;

              return (
                <button
                  key={suspect.id}
                  onClick={() => handleSelectSuspect(suspect.id)}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 border-white ring-2 ring-white scale-105 shadow-md'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <PlayerAvatar name={suspect.name} size="md" />
                  <div>
                    <p className="text-sm font-bold text-white tracking-wide">
                      {suspect.name}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {isSelf ? '(You)' : 'Suspect'}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="w-full py-1 text-[11px] font-bold uppercase rounded bg-white text-zinc-950">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cast Vote Action Button */}
          <div className="w-full max-w-sm">
            <button
              disabled={!selectedSuspectId}
              onClick={() => setShowConfirmModal(true)}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm ${
                selectedSuspectId
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 cursor-pointer'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-50'
              }`}
            >
              {selectedSuspectId
                ? `Confirm Vote for ${players.find((p) => p.id === selectedSuspectId)?.name}`
                : 'Select a suspect to vote'}
            </button>
          </div>
        </div>
      ) : (
        /* OPEN TABLE VOTE MODE */
        <div className="w-full max-w-2xl my-auto py-4 flex flex-col items-center space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Open Group Accusation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Who did everyone vote for?
            </h2>
            <p className="text-xs text-zinc-400">
              Count hands around the table and record each player's suspect
            </p>
          </div>

          {/* Table List of Voters & Their Choices */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto p-1">
            {players.map((voter) => {
              const votedSuspect = players.find((p) => p.id === votes[voter.id]);

              return (
                <div
                  key={voter.id}
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar name={voter.name} size="sm" />
                    <div>
                      <p className="text-sm font-bold text-white">{voter.name}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {votedSuspect ? `Voted: ${votedSuspect.name}` : 'Awaiting vote...'}
                      </span>
                    </div>
                  </div>

                  <select
                    value={votes[voter.id] || ''}
                    onChange={(e) => handleOpenVote(voter.id, e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 text-xs text-white rounded-xl px-2.5 py-1.5 outline-none cursor-pointer focus:border-zinc-400"
                  >
                    <option value="" disabled>
                      Select suspect...
                    </option>
                    {players.map((suspect) => (
                      <option key={suspect.id} value={suspect.id}>
                        Vote: {suspect.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Submit Table Votes */}
          <div className="w-full max-w-sm">
            <button
              disabled={!allVotedInOpenMode}
              onClick={() => onCompleteVoting(votes)}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm ${
                allVotedInOpenMode
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 cursor-pointer'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed opacity-50'
              }`}
            >
              {allVotedInOpenMode
                ? 'Lock In Votes & Reveal Imposter'
                : 'Assign all player votes to continue'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSuspectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col items-center text-center space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Confirm Accusation
            </h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to cast your vote for:
            </p>

            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 w-full justify-center">
              {(() => {
                const s = players.find((p) => p.id === selectedSuspectId);
                return s ? (
                  <>
                    <PlayerAvatar name={s.name} size="sm" />
                    <span className="text-base font-bold text-white">{s.name}</span>
                  </>
                ) : null;
              })()}
            </div>

            <div className="flex items-center gap-2 w-full pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 cursor-pointer"
              >
                Change Mind
              </button>
              <button
                onClick={handleConfirmVote}
                className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-xs font-bold text-zinc-950 cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                Submit Vote & Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="w-full text-center text-xs text-zinc-500 font-mono">
        Every player gets 1 vote · Ties allow the imposter to escape
      </div>
    </div>
  );
};
