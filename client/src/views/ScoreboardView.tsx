import React, { useEffect } from 'react';
import type { RoomState } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Crown, UserX, RotateCw, Users, ArrowRight } from 'lucide-react';

interface ScoreboardViewProps {
  roomState: RoomState;
  socketId: string;
  onNextTurn: () => void;
}

export const ScoreboardView: React.FC<ScoreboardViewProps> = ({
  roomState,
  socketId,
  onNextTurn,
}) => {
  const result = roomState.turnResult;
  const isHost = roomState.players.find((p) => p.socketId === socketId)?.isHost ?? false;
  const isGod = roomState.godSocketId === socketId;
  const canAdvance = isHost || isGod;

  const nextGodIndex = (roomState.godRotationIndex + 1) % roomState.players.length;
  const nextGodPlayer = roomState.players[nextGodIndex];

  useEffect(() => {
    // Fire celebratory confetti when results load
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, []);

  if (!result) return null;

  const isCitizenVictory = result.winner === 'CITIZENS';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Massive Outcome Banner */}
      <div
        className={`brutal-card p-8 text-center border-4 ${
          isCitizenVictory ? 'bg-brutal-green text-white' : 'bg-brutal-red text-white'
        }`}
      >
        <div className="inline-flex p-3 bg-black text-white border-2 border-white shadow-brutal-sm mb-4">
          <Trophy size={48} className={isCitizenVictory ? 'text-brutal-yellow' : 'text-brutal-red'} />
        </div>
        <div className="font-mono font-black text-sm uppercase tracking-widest mb-2 opacity-90">
          TURN OUTCOME FINALIZED
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight mb-2 drop-shadow-[3px_3px_0_#000000]">
          {result.winnerLabel}
        </h1>
        <p className="font-mono text-sm max-w-xl mx-auto font-bold opacity-95">
          {isCitizenVictory
            ? `The Citizens accurately saw through the deception and eliminated @${result.intruderUsername}!`
            : `The Intruder (@${result.intruderUsername}) successfully blended in and misled the citizens!`}
        </p>
      </div>

      {/* Reveal Matrix */}
      <div className="brutal-card bg-white p-6">
        <h2 className="font-display font-black text-xl uppercase mb-4 border-b-2 border-black pb-2">
          THE REVEAL MATRIX
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
          {/* Identity Reveals */}
          <div className="border-2 border-black p-4 bg-canvas space-y-3">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <span className="text-gray-600 font-bold flex items-center gap-1.5">
                <Crown size={16} className="text-brutal-orange" />
                THE GOD:
              </span>
              <span className="font-black text-base bg-brutal-yellow px-2 py-0.5 border border-black">
                @{result.godUsername}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <span className="text-gray-600 font-bold flex items-center gap-1.5">
                <UserX size={16} className="text-brutal-red" />
                THE INTRUDER:
              </span>
              <span className="font-black text-base bg-brutal-pink text-red-900 px-2 py-0.5 border border-black">
                @{result.intruderUsername}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-bold flex items-center gap-1.5">
                <Users size={16} className="text-brutal-blue" />
                ACCUSATION TARGET:
              </span>
              <span className="font-black text-base">
                @{result.mostVotedUsername}
              </span>
            </div>
          </div>

          {/* Secret Words Reveal */}
          <div className="border-2 border-black p-4 bg-canvas space-y-3">
            <div>
              <div className="text-xs font-bold text-green-800 uppercase mb-1">
                CITIZEN SECRET WORD:
              </div>
              <div className="font-display font-black text-2xl text-black bg-white p-2 border-2 border-black shadow-brutal-sm uppercase">
                "{result.citizenWord}"
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-red-800 uppercase mb-1">
                INTRUDER ALTERNATE WORD:
              </div>
              <div className="font-display font-black text-2xl text-black bg-brutal-pink p-2 border-2 border-black shadow-brutal-sm uppercase">
                "{result.intruderWord}"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Breakdown & Transcript Recap (2 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vote Breakdown */}
        <div className="brutal-card bg-white p-6">
          <h3 className="font-display font-black text-lg uppercase mb-3 border-b-2 border-black pb-2">
            VOTE BALLOT BREAKDOWN
          </h3>

          <div className="space-y-2 font-mono text-xs">
            {Object.entries(result.votes || {}).map(([voterId, targetId]) => {
              const voter = roomState.players.find((p) => p.socketId === voterId);
              const target = roomState.players.find((p) => p.socketId === targetId);
              const wasTargetIntruder = targetId === result.intruderSocketId;

              return (
                <div
                  key={voterId}
                  className="p-2.5 border-2 border-black bg-canvas flex items-center justify-between"
                >
                  <span className="font-bold">@{voter?.username || 'Player'}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span
                    className={`font-black px-1.5 py-0.5 border border-black ${
                      wasTargetIntruder
                        ? 'bg-brutal-green text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    @{target?.username || 'Target'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Word History Timeline */}
        <div className="brutal-card bg-white p-6">
          <h3 className="font-display font-black text-lg uppercase mb-3 border-b-2 border-black pb-2">
            WORDS SPOKEN RECAP
          </h3>

          <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto pr-1">
            {roomState.submittedWords.map((item, idx) => {
              const isIntruder = item.socketId === result.intruderSocketId;

              return (
                <div
                  key={idx}
                  className={`p-2 border-2 border-black flex items-center justify-between ${
                    isIntruder ? 'bg-brutal-pink' : 'bg-canvas'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-black text-white px-1 text-[10px] font-bold">
                      R{item.round}
                    </span>
                    <span className="font-bold">@{item.username}</span>
                    {isIntruder && (
                      <span className="text-[9px] bg-brutal-red text-white px-1 font-bold">
                        INTRUDER
                      </span>
                    )}
                  </div>
                  <span className="font-black text-sm uppercase">"{item.word}"</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Next Turn Action Footer */}
      <div className="brutal-card bg-brutal-yellow p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs font-black uppercase text-black">
            NEXT GOD IN ROTATION:
          </div>
          <div className="font-display font-black text-2xl uppercase">
            @{nextGodPlayer?.username || 'Next Player'}
          </div>
          <p className="font-mono text-xs text-gray-800">
            God role shifts sequentially each turn so everyone gets to orchestrate!
          </p>
        </div>

        {canAdvance ? (
          <button
            onClick={onNextTurn}
            className="brutal-btn brutal-btn-green py-3 px-6 text-base flex items-center gap-2 shadow-brutal-lg"
          >
            <RotateCw size={18} />
            NEXT TURN (ROTATE GOD)
          </button>
        ) : (
          <div className="font-mono text-xs font-bold bg-white border-2 border-black p-3 shadow-brutal-sm">
            WAITING FOR HOST OR GOD TO ADVANCE...
          </div>
        )}
      </div>
    </div>
  );
};
