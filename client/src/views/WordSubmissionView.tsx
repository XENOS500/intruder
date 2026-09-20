import React, { useState } from 'react';
import type { RoomState } from '../types';
import { Crown, Send, Eye, UserCheck, ShieldAlert } from 'lucide-react';

interface WordSubmissionViewProps {
  roomState: RoomState;
  socketId: string;
  onSubmitWord: (word: string) => void;
  onOpenIntruderAlert?: () => void;
}

const TRANSCRIPT_ITEM_TINTS = [
  'bg-white',
  'bg-brutal-yellow-light',
  'bg-brutal-blue-light',
  'bg-brutal-green-light',
  'bg-brutal-pink-light',
];

export const WordSubmissionView: React.FC<WordSubmissionViewProps> = ({
  roomState,
  socketId,
  onSubmitWord,
  onOpenIntruderAlert,
}) => {
  const [inputWord, setInputWord] = useState('');
  const isGod = roomState.godSocketId === socketId;
  const isMyTurn = roomState.currentSpeakerSocketId === socketId;

  const currentSpeaker = roomState.players.find(
    (p) => p.socketId === roomState.currentSpeakerSocketId
  );
  const godPlayer = roomState.players.find((p) => p.socketId === roomState.godSocketId);
  const intruderPlayer = isGod
    ? roomState.players.find((p) => p.socketId === roomState.intruderSocketId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || !inputWord.trim()) return;

    // Single-word association: take first word
    const cleaned = inputWord.trim().split(/\s+/)[0];
    onSubmitWord(cleaned);
    setInputWord('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Status HUD Bar */}
      <div className="brutal-card bg-white p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Round Counter & God Badge */}
          <div className="flex items-center gap-2">
            <span className="brutal-badge badge-yellow text-xs">
              ROUND {roomState.currentRound} OF {roomState.config.roundsPerTurn}
            </span>
            <div className="flex items-center gap-1 brutal-badge badge-orange text-xs">
              <Crown size={12} />
              <span>GOD: @{godPlayer?.username}</span>
            </div>
          </div>

          {/* Turn Tracker Queue Banner */}
          <div
            className={`font-mono text-xs sm:text-sm font-black px-3.5 py-1.5 border-3 border-black shadow-brutal-sm flex items-center gap-2 ${
              isMyTurn
                ? 'bg-brutal-yellow text-black animate-pulse'
                : 'bg-brutal-blue-light text-black'
            }`}
          >
            {isMyTurn ? (
              <>
                <span className="inline-block w-2.5 h-2.5 bg-brutal-pink" />
                <span>YOUR TURN TO SUBMIT!</span>
              </>
            ) : (
              <>
                <UserCheck size={16} />
                <span>SPEAKER: @{currentSpeaker?.username || 'Waiting...'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Secret Prompt & Input Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Secret Prompt Card */}
          <div className="brutal-card bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
              <h2 className="font-display font-black text-lg uppercase flex items-center gap-2">
                <Eye size={20} className="text-black" />
                YOUR SECRET ASSIGNMENT
              </h2>
              <span className="brutal-badge badge-black text-[10px]">
                CONFIDENTIAL
              </span>
            </div>

            {/* If God: Show Omniscient Monitor */}
            {isGod ? (
              <div className="bg-brutal-yellow-light border-3 border-black p-4 space-y-2.5 font-mono text-sm shadow-brutal-sm">
                <div className="flex items-center gap-1 font-black text-xs uppercase mb-2 text-black">
                  <Crown size={14} className="text-brutal-orange" />
                  <span>GOD OMNISCIENT MONITOR</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-1">
                  <span>Citizens' Secret Word:</span>
                  <strong className="text-green-800 bg-white px-1.5 border border-black">
                    {typeof roomState.mySecretWord === 'object'
                      ? roomState.mySecretWord?.citizenWord
                      : 'Hidden'}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-1">
                  <span>Intruder's Variant Word:</span>
                  <strong className="text-red-700 bg-white px-1.5 border border-black">
                    {typeof roomState.mySecretWord === 'object'
                      ? roomState.mySecretWord?.intruderWord
                      : 'Hidden'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Designated Intruder:</span>
                  <strong className="text-black bg-brutal-pink px-2 py-0.5 border border-black">
                    @{intruderPlayer?.username}
                  </strong>
                </div>
                <p className="text-[11px] text-gray-700 italic pt-1">
                  Observe the players' word choices and watch how well the intruder blends in!
                </p>
              </div>
            ) : roomState.myRole === 'INTRUDER' ? (
              /* Intruder Red Warning HUD */
              <div className="border-4 border-black bg-brutal-red text-white p-6 shadow-brutal-lg">
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4 bg-black px-3 py-1">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black text-brutal-yellow uppercase">
                    <ShieldAlert size={16} />
                    <span>RED ALERT: YOU ARE THE INTRUDER</span>
                  </div>
                  {onOpenIntruderAlert && (
                    <button
                      type="button"
                      onClick={onOpenIntruderAlert}
                      className="text-xs bg-brutal-yellow text-black px-2 py-0.5 font-bold border border-black hover:bg-white transition"
                    >
                      VIEW BRIEF
                    </button>
                  )}
                </div>

                <div className="text-center my-4">
                  <div className="font-mono text-xs font-bold uppercase text-yellow-200 mb-1">
                    YOUR SECRET VARIANT PROMPT:
                  </div>
                  <div className="bg-white text-black border-3 border-black p-3 font-display font-black text-4xl sm:text-5xl uppercase tracking-wider shadow-brutal inline-block min-w-[240px]">
                    "{String(roomState.mySecretWord || '...')}"
                  </div>
                </div>

                <div className="bg-black/60 border-2 border-white/60 p-2.5 font-mono text-xs text-center font-bold">
                  ⚠️ ALL OTHER PLAYERS RECEIVED A DIFFERENT WORD! BLEND IN WITH YOUR CLUES!
                </div>
              </div>
            ) : (
              /* Citizen Mint Green Box */
              <div className="p-6 border-3 border-black text-center shadow-brutal-sm bg-brutal-green-light">
                <div className="font-mono text-xs font-black uppercase text-green-950 mb-2">
                  YOUR SECRET ASSIGNED WORD IS:
                </div>
                <div className="font-display font-black text-4xl sm:text-5xl text-black tracking-wider uppercase bg-white p-3 border-3 border-black shadow-brutal inline-block min-w-[220px]">
                  "{String(roomState.mySecretWord || '...')}"
                </div>
                <p className="font-mono text-xs text-gray-700 mt-4 max-w-md mx-auto">
                  Give a subtle 1-word clue that matches this word without giving it away to the imposter.
                </p>
              </div>
            )}
          </div>

          {/* Word Input Box (Yellow Box) */}
          <div className="brutal-box-yellow p-5 sm:p-6">
            <h3 className="font-display font-black text-base uppercase mb-3 flex items-center gap-2">
              <Send size={18} />
              SUBMIT 1-WORD ASSOCIATION
            </h3>

            {isGod ? (
              <div className="bg-white border-2 border-black p-4 text-center font-mono text-xs font-bold text-gray-700 shadow-brutal-sm">
                You are the God for this turn. You observe and do not submit clues.
              </div>
            ) : isMyTurn ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
                  <input
                    type="text"
                    placeholder="Type single word association..."
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value)}
                    className="brutal-input flex-1 min-w-0 w-full text-base sm:text-lg font-bold bg-white"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    disabled={!inputWord.trim()}
                    className="brutal-btn brutal-btn-yellow flex items-center justify-center gap-1.5 px-5 py-3 sm:py-2.5 shrink-0 shadow-brutal"
                  >
                    <Send size={18} />
                    <span>SEND WORD</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] text-gray-700">
                  Tip: Only 1 single word will be sent. Keep it sharp.
                </p>
              </form>
            ) : (
              <div className="bg-white border-2 border-black p-4 text-center font-mono text-xs font-bold text-gray-700 shadow-brutal-sm">
                WAITING FOR @{currentSpeaker?.username || 'SPEAKER'} TO SUBMIT THEIR WORD...
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Live Transcript Feed (Lavender Box) */}
        <div className="space-y-4">
          <div className="brutal-box-purple p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-md uppercase">
                TRANSCRIPT FEED
              </h3>
              <span className="brutal-badge badge-black text-[10px]">
                {roomState.submittedWords.length} LOGGED
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[440px] space-y-2.5 pr-1 font-mono text-xs">
              {roomState.submittedWords.length === 0 ? (
                <div className="text-gray-500 italic text-center py-10">
                  No words spoken yet. Round 1 in progress.
                </div>
              ) : (
                roomState.submittedWords.map((item, idx) => {
                  const tint = TRANSCRIPT_ITEM_TINTS[idx % TRANSCRIPT_ITEM_TINTS.length];
                  return (
                    <div
                      key={idx}
                      className={`p-3 border-2 border-black ${tint} shadow-brutal-sm flex items-start justify-between gap-2`}
                    >
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-700 font-bold">
                          <span className="bg-brutal-yellow text-black px-1 border border-black font-black">
                            R{item.round}
                          </span>
                          <span>@{item.username}</span>
                        </div>
                        <div className="font-black text-sm text-black mt-1 uppercase">
                          "{item.word}"
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
