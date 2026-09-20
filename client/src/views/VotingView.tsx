import React, { useState } from 'react';
import type { RoomState } from '../types';
import { Crosshair, CheckCircle, Crown, AlertOctagon } from 'lucide-react';

interface VotingViewProps {
  roomState: RoomState;
  socketId: string;
  onSubmitVote: (targetSocketId: string) => void;
}

const CANDIDATE_TINTS = [
  'bg-white',
  'bg-brutal-yellow-light',
  'bg-brutal-blue-light',
  'bg-brutal-green-light',
  'bg-brutal-purple-light',
  'bg-brutal-orange-light',
];

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
      {/* Voting Header (Coral Pink with Dots) */}
      <div className="brutal-card bg-brutal-pink text-black p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="pattern-dots absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="brutal-badge badge-black text-xs mb-2">
              FINAL PHASE // BALLOT CONVICTION
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight flex items-center gap-3">
              <Crosshair size={36} /> CAST YOUR ACCUSATION
            </h1>
          </div>

          {/* Live Tally Indicator */}
          <div className="bg-white text-black border-3 border-black p-3.5 shadow-brutal font-mono text-center">
            <div className="text-[10px] font-black text-gray-700 uppercase">BALLOT COUNT</div>
            <div className="text-xl font-black">
              {roomState.votesLockedCount} / {roomState.eligibleVotersCount} LOCKED
            </div>
          </div>
        </div>
      </div>

      {/* Rules reminder banner (Yellow Box) */}
      <div className="brutal-box-yellow p-4 mb-6 font-mono text-xs flex items-start gap-3">
        <AlertOctagon size={22} className="text-black flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-black uppercase text-xs block mb-0.5">CONVICTION RULES:</strong>
          <span className="text-gray-800">
            If the actual Intruder receives the highest votes, <strong>CITIZENS WIN</strong>! If the vote targets an innocent citizen, <strong>INTRUDER WINS</strong>!
          </span>
        </div>
      </div>

      {isGod ? (
        /* God Observer Mode (Lavender Box) */
        <div className="brutal-box-purple p-8 sm:p-12 text-center">
          <div className="inline-flex p-4 bg-brutal-orange border-3 border-black shadow-brutal mb-4">
            <Crown size={42} className="text-black" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase mb-2">
            YOU ARE THE GOD // SPECTATOR
          </h2>
          <p className="font-mono text-xs text-gray-800 max-w-md mx-auto mb-6">
            You know who the Intruder is and what both words were. As the gamemaster, you observe the citizens debate and cast their ballots!
          </p>
          <div className="font-mono text-sm font-black text-black bg-white border-2 border-black p-3 inline-block shadow-brutal-sm animate-pulse">
            WAITING FOR ALL VOTES TO BE LOCKED IN ({roomState.votesLockedCount}/{roomState.eligibleVotersCount})...
          </div>
        </div>
      ) : roomState.hasVoted ? (
        /* Already Voted / Waiting for Others (Mint Green Box) */
        <div className="brutal-box-green p-8 sm:p-12 text-center">
          <div className="inline-flex p-4 bg-white text-black border-3 border-black shadow-brutal mb-4">
            <CheckCircle size={42} className="text-green-700" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase mb-2">
            YOUR ACCUSATION IS LOCKED!
          </h2>
          <p className="font-mono text-xs text-gray-800 max-w-md mx-auto mb-4">
            Your ballot is sealed. Identities and results will be revealed the moment everyone finishes voting.
          </p>
          <div className="font-mono text-xs sm:text-sm font-bold text-black bg-white border-2 border-black p-3 inline-block shadow-brutal-sm">
            {roomState.votesLockedCount} of {roomState.eligibleVotersCount} votes cast...
          </div>
        </div>
      ) : (
        /* Active Voting Deck */
        <div className="space-y-6">
          <div className="brutal-card bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-black text-xl uppercase">
                TARGET YOUR ACCUSATION:
              </h2>
              <span className="brutal-badge badge-pink text-[10px]">1 VOTE ONLY</span>
            </div>
            <p className="font-mono text-xs text-gray-700 mb-6">
              Click on a player card to set your target crosshair. You cannot vote for God.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {eligibleCandidates.map((candidate, idx) => {
                const isSelected = selectedTarget === candidate.socketId;
                const isMe = candidate.socketId === socketId;
                const tint = CANDIDATE_TINTS[idx % CANDIDATE_TINTS.length];

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
                        ? 'bg-brutal-pink text-black shadow-brutal-lg translate-x-[-2px] translate-y-[-2px]'
                        : `${tint} hover:bg-white shadow-brutal-sm`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-base">
                          @{candidate.username} {isMe && '(YOU)'}
                        </span>
                        {isSelected && (
                          <span className="brutal-badge badge-black text-[9px]">
                            LOCKED
                          </span>
                        )}
                      </div>

                      {/* Words submitted preview */}
                      <div className="font-mono text-[11px] text-gray-800 space-y-1 mt-2">
                        {wordsGiven.map((w, i) => (
                          <div key={i} className="flex gap-1.5 items-center">
                            <span className="text-[9px] bg-white px-1 border border-black font-black">
                              R{w.round}
                            </span>
                            <span className="font-black text-black uppercase">"{w.word}"</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-black font-mono text-[10px] font-bold text-gray-600 text-right">
                      {isSelected ? 'READY TO CONFIRM' : 'CLICK TO ACCUSE'}
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
              className="brutal-btn brutal-btn-pink w-full py-4 text-xl flex items-center justify-center gap-2 shadow-brutal-lg"
            >
              <Crosshair size={24} />
              SUBMIT ACCUSATION BALLOT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
