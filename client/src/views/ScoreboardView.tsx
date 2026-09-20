import React, { useEffect } from 'react';
import type { RoomState } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Crown, UserX, RotateCw, Users, ArrowRight, ShieldCheck, Skull } from 'lucide-react';

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
      {/* Massive Outcome Banner (Neubrutalism.com High-Contrast Style) */}
      <div
        className={`brutal-card p-6 sm:p-8 text-center relative overflow-hidden ${
          isCitizenVictory ? 'bg-brutal-green text-black' : 'bg-brutal-pink text-black'
        }`}
      >
        <div className="pattern-dots absolute inset-0 opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <div
            className={`inline-flex p-3.5 border-3 border-black shadow-brutal mb-4 ${
              isCitizenVictory ? 'bg-brutal-yellow text-black' : 'bg-brutal-red text-white'
            }`}
          >
            {isCitizenVictory ? (
              <ShieldCheck size={48} className="stroke-[2.5]" />
            ) : (
              <Skull size={48} className="stroke-[2.5]" />
            )}
          </div>
          <div>
            <span className="brutal-badge badge-black text-xs mb-3">
              TURN OUTCOME FINALIZED
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight mb-3 drop-shadow-[2px_2px_0_#FFFFFF]">
            {result.winnerLabel}
          </h1>
          <p className="font-mono text-sm max-w-xl mx-auto font-bold bg-white/95 border-2 border-black p-3 shadow-brutal-sm text-black">
            {isCitizenVictory
              ? `The Citizens accurately saw through the deception and eliminated @${result.intruderUsername}!`
              : `The Intruder (@${result.intruderUsername}) successfully blended in and misled the citizens!`}
          </p>
        </div>
      </div>

      {/* The Reveal Matrix (Lavender Container with Bento Boxes) */}
      <div className="brutal-box-purple p-6 relative overflow-hidden">
        <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-5">
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase flex items-center gap-2">
            <Trophy size={24} className="text-black" /> THE REVEAL MATRIX
          </h2>
          <span className="brutal-badge badge-yellow text-xs font-mono">
            ALL ROLES UNMASKED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-sm">
          {/* Identity Reveals (Yellow Box) */}
          <div className="brutal-box-yellow p-5 space-y-3">
            <div className="font-mono text-xs font-black uppercase text-black mb-1 flex items-center gap-1.5">
              <span>KEY IDENTITIES</span>
            </div>

            <div className="bg-white border-2 border-black p-3 shadow-brutal-sm flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-xs">
                <Crown size={18} className="text-brutal-orange" />
                THE GOD:
              </span>
              <span className="font-black text-sm brutal-badge badge-yellow">
                @{result.godUsername}
              </span>
            </div>

            <div className="bg-white border-2 border-black p-3 shadow-brutal-sm flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-xs">
                <UserX size={18} className="text-brutal-red" />
                THE INTRUDER:
              </span>
              <span className="font-black text-sm brutal-badge badge-pink">
                @{result.intruderUsername}
              </span>
            </div>

            <div className="bg-white border-2 border-black p-3 shadow-brutal-sm flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-xs">
                <Users size={18} className="text-brutal-blue" />
                ACCUSATION TARGET:
              </span>
              <span className="font-black text-sm brutal-badge badge-blue">
                @{result.mostVotedUsername}
              </span>
            </div>
          </div>

          {/* Secret Words Reveal (Sky Blue Box) */}
          <div className="brutal-box-blue p-5 space-y-3">
            <div className="font-mono text-xs font-black uppercase text-black mb-1 flex items-center gap-1.5">
              <span>SECRET WORDS COMPARED</span>
            </div>

            <div>
              <div className="brutal-badge badge-green text-[11px] mb-1.5 font-bold">
                CITIZEN SECRET WORD
              </div>
              <div className="brutal-box-green p-3 font-display font-black text-2xl uppercase tracking-wider text-black shadow-brutal-sm">
                "{result.citizenWord}"
              </div>
            </div>

            <div>
              <div className="brutal-badge badge-pink text-[11px] mb-1.5 font-bold">
                INTRUDER ALTERNATE WORD
              </div>
              <div className="brutal-box-pink p-3 font-display font-black text-2xl uppercase tracking-wider text-black shadow-brutal-sm">
                "{result.intruderWord}"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Breakdown & Transcript Recap (Coral Pink & Mint Green Bento Grids) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vote Ballot Breakdown (Coral Pink Box) */}
        <div className="brutal-box-pink p-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
            <h3 className="font-display font-black text-lg uppercase">
              VOTE BALLOT BREAKDOWN
            </h3>
            <span className="brutal-badge badge-black text-[10px]">TALLY</span>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto pr-1">
            {Object.entries(result.votes || {}).map(([voterId, targetId]) => {
              const voter = roomState.players.find((p) => p.socketId === voterId);
              const target = roomState.players.find((p) => p.socketId === targetId);
              const wasTargetIntruder = targetId === result.intruderSocketId;

              return (
                <div
                  key={voterId}
                  className="p-2.5 border-2 border-black bg-white shadow-brutal-sm flex items-center justify-between"
                >
                  <span className="font-bold">@{voter?.username || 'Player'}</span>
                  <ArrowRight size={14} className="text-black stroke-[3]" />
                  <span
                    className={
                      wasTargetIntruder
                        ? 'brutal-badge badge-green text-[11px]'
                        : 'brutal-badge badge-orange text-[11px]'
                    }
                  >
                    @{target?.username || 'Target'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Word History Timeline (Mint Green Box) */}
        <div className="brutal-box-green p-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
            <h3 className="font-display font-black text-lg uppercase">
              WORDS SPOKEN RECAP
            </h3>
            <span className="brutal-badge badge-black text-[10px]">EVIDENCE</span>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto pr-1">
            {roomState.submittedWords.map((item, idx) => {
              const isIntruder = item.socketId === result.intruderSocketId;

              return (
                <div
                  key={idx}
                  className={`p-2.5 border-2 border-black flex items-center justify-between ${
                    isIntruder
                      ? 'brutal-box-pink'
                      : 'bg-white shadow-brutal-sm'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-black text-white px-1.5 py-0.5 text-[10px] font-bold">
                      R{item.round}
                    </span>
                    <span className="font-bold">@{item.username}</span>
                    {isIntruder && (
                      <span className="text-[9px] brutal-badge badge-pink py-0 px-1 font-bold">
                        INTRUDER
                      </span>
                    )}
                  </div>
                  <span className="font-black text-sm uppercase bg-brutal-yellow-light px-2 py-0.5 border border-black">
                    "{item.word}"
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Next Turn Action Footer (Yellow Neubrutalist Box with Dots) */}
      <div className="brutal-card bg-brutal-yellow p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="pattern-dots absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative z-10">
          <div className="brutal-badge badge-purple text-xs mb-1.5 font-mono">
            NEXT GOD IN ROTATION
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
            @{nextGodPlayer?.username || 'Next Player'}
          </div>
          <p className="font-mono text-xs font-bold text-gray-800 mt-1">
            God role shifts sequentially each turn so everyone gets to orchestrate!
          </p>
        </div>

        <div className="relative z-10">
          {canAdvance ? (
            <button
              onClick={onNextTurn}
              className="brutal-btn brutal-btn-green py-3.5 px-6 text-base flex items-center gap-2 shadow-brutal-lg font-black tracking-wide"
            >
              <RotateCw size={20} className="stroke-[3]" />
              NEXT TURN (ROTATE GOD)
            </button>
          ) : (
            <div className="brutal-badge badge-black p-3 font-mono text-xs font-bold shadow-brutal-sm">
              WAITING FOR HOST OR GOD TO ADVANCE...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
