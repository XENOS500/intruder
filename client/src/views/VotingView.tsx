import React, { useState } from 'react';
import type { RoomState } from '../types';
import { Crosshair, CheckCircle, Crown, AlertOctagon } from 'lucide-react';

interface VotingViewProps {
  roomState: RoomState;
  socketId: string;
  onSubmitVote: (targetSocketId: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  roomState,
  socketId,
  onSubmitVote,
}) => {
  const isGod = roomState.godSocketId === socketId;
  const eligibleCandidates = roomState.players.filter(
    (p) => p.socketId !== roomState.godSocketId && p.connected
  );

  const [selectedTarget, setSelectedTarget] = useState<string>('');

  const handleVote = () => {
    if (!selectedTarget || isGod || roomState.hasVoted) return;
    onSubmitVote(selectedTarget);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Voting Header */}
      <div className="brutal-card bg-brutal-red text-white p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="brutal-badge bg-black text-white text-xs mb-1">
              FINAL PHASE: ACCUSATION
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase flex items-center gap-2">
              <Crosshair size={32} /> CAST YOUR VOTE
            </h1>
          </div>

          {/* Live Tally Indicator */}
          <div className="bg-white text-black border-2 border-black p-3 shadow-brutal-sm font-mono text-center">
            <div className="text-[11px] font-bold text-gray-600 uppercase">TALLY STATUS</div>
            <div className="text-xl font-black">
              {roomState.votesLockedCount} / {roomState.eligibleVotersCount} LOCKED
            </div>
          </div>
        </div>
      </div>

      {/* Rules reminder banner */}
      <div className="border-2 border-black bg-white p-4 mb-6 font-mono text-xs shadow-brutal-sm flex items-start gap-2.5">
        <AlertOctagon size={20} className="text-brutal-red flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-black uppercase">WIN CONDITIONS:</strong>
          <span className="text-gray-700 ml-1">
            If the actual Intruder receives the most votes, <strong>CITIZENS WIN</strong>! If the majority votes out an innocent Citizen (or Intruder avoids the vote), <strong>INTRUDER WINS</strong>!
          </span>
        </div>
      </div>

      {isGod ? (
        /* God Observer Mode */
        <div className="brutal-card bg-white p-8 text-center">
          <div className="inline-flex p-3 bg-brutal-orange border-2 border-black shadow-brutal-sm mb-4">
            <Crown size={36} className="text-black" />
          </div>
          <h2 className="font-display font-black text-2xl uppercase mb-2">
            YOU ARE THE GOD // SPECTATOR
          </h2>
          <p className="font-mono text-xs text-gray-700 max-w-md mx-auto mb-6">
            You know who the Intruder is and what both words were. As the gamemaster, you observe the citizens and intruder accuse each other!
          </p>
          <div className="font-mono text-sm font-bold text-brutal-red animate-pulse">
            WAITING FOR ALL VOTES TO BE LOCKED IN ({roomState.votesLockedCount}/{roomState.eligibleVotersCount})...
          </div>
        </div>
      ) : roomState.hasVoted ? (
        /* Already Voted / Waiting for Others */
        <div className="brutal-card bg-white p-8 text-center">
          <div className="inline-flex p-3 bg-brutal-green border-2 border-black shadow-brutal-sm mb-4">
            <CheckCircle size={36} className="text-white" />
          </div>
          <h2 className="font-display font-black text-2xl uppercase mb-2">
            YOUR VOTE IS LOCKED IN!
          </h2>
          <p className="font-mono text-xs text-gray-700 max-w-md mx-auto mb-4">
            Your accusation ballot has been safely received by the server. Identities will be revealed as soon as all votes are submitted.
          </p>
          <div className="font-mono text-sm font-bold text-gray-600 bg-canvas border-2 border-black p-3 inline-block shadow-brutal-sm">
            {roomState.votesLockedCount} of {roomState.eligibleVotersCount} players have voted...
          </div>
        </div>
      ) : (
        /* Active Voting Deck */
        <div className="space-y-6">
          <div className="brutal-card bg-white p-6">
            <h2 className="font-display font-black text-xl uppercase mb-2">
              SELECT WHO YOU ACCUSE AS THE INTRUDER:
            </h2>
            <p className="font-mono text-xs text-gray-600 mb-6">
              Click on a player card to set your target crosshair. You cannot vote for God.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {eligibleCandidates.map((candidate) => {
                const isSelected = selectedTarget === candidate.socketId;
                const isMe = candidate.socketId === socketId;

                // Look up words this candidate submitted
                const wordsGiven = roomState.submittedWords.filter(
                  (w) => w.socketId === candidate.socketId
                );

                return (
                  <button
                    type="button"
                    key={candidate.socketId}
                    onClick={() => setSelectedTarget(candidate.socketId)}
                    className={`p-4 border-3 border-black text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brutal-pink border-brutal-red shadow-brutal translate-x-[-2px] translate-y-[-2px]'
                        : 'bg-white hover:bg-canvas shadow-brutal-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-base">
                          @{candidate.username} {isMe && '(YOU)'}
                        </span>
                        {isSelected && (
                          <span className="brutal-badge bg-brutal-red text-white text-[10px]">
                            TARGET LOCKED
                          </span>
                        )}
                      </div>

                      {/* Words submitted preview */}
                      <div className="font-mono text-[11px] text-gray-700 space-y-1">
                        {wordsGiven.map((w, i) => (
                          <div key={i} className="flex gap-1 items-center">
                            <span className="text-[9px] bg-gray-200 px-1 border border-black font-bold">
                              R{w.round}
                            </span>
                            <span className="font-black text-black">"{w.word}"</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-gray-300 font-mono text-[10px] text-gray-500 text-right">
                      {isSelected ? 'CLICK CONFIRM BELOW' : 'CLICK TO SELECT'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Vote Button */}
          <div>
            <button
              onClick={handleVote}
              disabled={!selectedTarget}
              className="brutal-btn brutal-btn-red w-full py-4 text-xl flex items-center justify-center gap-2 shadow-brutal-lg"
            >
              <Crosshair size={24} />
              CONFIRM ACCUSATION BALLOT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
