import React, { useState } from 'react';
import type { RoomState } from '../types';
import { Crown, Send, Eye, UserCheck } from 'lucide-react';

interface WordSubmissionViewProps {
  roomState: RoomState;
  socketId: string;
  onSubmitWord: (word: string) => void;
}

export const WordSubmissionView: React.FC<WordSubmissionViewProps> = ({
  roomState,
  socketId,
  onSubmitWord,
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Status HUD Bar */}
      <div className="brutal-card bg-white p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Round Counter */}
          <div className="flex items-center gap-2">
            <span className="brutal-badge bg-brutal-yellow text-black text-sm">
              ROUND {roomState.currentRound} OF {roomState.config.roundsPerTurn}
            </span>
            <div className="flex items-center gap-1 font-mono text-xs font-bold bg-canvas px-2 py-1 border-2 border-black">
              <Crown size={12} className="text-brutal-orange" />
              GOD: @{godPlayer?.username}
            </div>
          </div>

          {/* Turn Tracker Queue Banner */}
          <div
            className={`font-mono text-sm font-bold px-3 py-1.5 border-2 border-black shadow-brutal-sm flex items-center gap-2 ${
              isMyTurn
                ? 'bg-brutal-yellow text-black animate-pulse'
                : 'bg-canvas text-gray-800'
            }`}
          >
            {isMyTurn ? (
              <>
                <span className="inline-block w-2.5 h-2.5 bg-brutal-red" />
                <span>YOUR TURN TO SPEAK!</span>
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
          <div className="brutal-card bg-white p-5">
            <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
              <h2 className="font-display font-black text-lg uppercase flex items-center gap-2">
                <Eye size={20} className="text-brutal-blue" />
                YOUR SECRET PROMPT
              </h2>
              <span className="brutal-badge bg-black text-white text-[10px]">
                CONFIDENTIAL
              </span>
            </div>

            {/* If God: Show Omniscient Monitor */}
            {isGod ? (
              <div className="bg-[#FFF8E1] border-2 border-black p-4 space-y-2 font-mono text-sm">
                <div className="flex items-center gap-1 text-brutal-orange font-black text-xs uppercase mb-2">
                  <Crown size={14} /> GOD OMNISCIENT MONITOR
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-1">
                  <span>Citizens' Secret Word:</span>
                  <strong className="text-brutal-green">
                    {typeof roomState.mySecretWord === 'object'
                      ? roomState.mySecretWord?.citizenWord
                      : 'Hidden'}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-1">
                  <span>Intruder's Variant Word:</span>
                  <strong className="text-brutal-red">
                    {typeof roomState.mySecretWord === 'object'
                      ? roomState.mySecretWord?.intruderWord
                      : 'Hidden'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Designated Intruder:</span>
                  <strong className="text-black bg-brutal-yellow px-1 border border-black">
                    @{intruderPlayer?.username}
                  </strong>
                </div>
                <p className="text-[11px] text-gray-500 italic pt-2">
                  Observe the players' word choices and watch how well the intruder blends in!
                </p>
              </div>
            ) : (
              /* If Citizen or Intruder: Show their single word prompt */
              <div
                className={`p-6 border-3 border-black text-center shadow-brutal-sm ${
                  roomState.myRole === 'INTRUDER' ? 'bg-[#FFEBEE]' : 'bg-[#E8F5E9]'
                }`}
              >
                <div className="font-mono text-xs font-black uppercase text-gray-700 mb-2">
                  YOUR SECRET ASSIGNED WORD IS:
                </div>
                <div className="font-display font-black text-4xl sm:text-5xl text-black tracking-wider uppercase drop-shadow-[2px_2px_0_#FFFFFF]">
                  "{String(roomState.mySecretWord || '...')}"
                </div>
                <p className="font-mono text-xs text-gray-600 mt-4 max-w-md mx-auto">
                  Give a subtle 1-word clue that matches this word without being too obvious. If you think you're the intruder, try to blend in!
                </p>
              </div>
            )}
          </div>

          {/* Word Input Box */}
          <div className="brutal-card bg-white p-5">
            <h3 className="font-display font-black text-base uppercase mb-2 flex items-center gap-2">
              <Send size={16} />
              SUBMIT 1-WORD ASSOCIATION
            </h3>

            {isGod ? (
              <div className="bg-canvas border-2 border-black p-4 text-center font-mono text-xs font-bold text-gray-700">
                You are the God for this turn. You observe and do not submit clues.
              </div>
            ) : isMyTurn ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type single word association..."
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value)}
                    className="brutal-input flex-1 text-lg font-bold"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    disabled={!inputWord.trim()}
                    className="brutal-btn brutal-btn-yellow flex items-center gap-1.5 px-4"
                  >
                    <Send size={18} />
                    <span>SEND</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] text-gray-500">
                  Tip: Only 1 single word will be sent. Keep it concise.
                </p>
              </form>
            ) : (
              <div className="bg-canvas border-2 border-black p-4 text-center font-mono text-xs font-bold text-gray-600">
                WAITING FOR @{currentSpeaker?.username || 'SPEAKER'} TO SUBMIT THEIR WORD...
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Live Transcript Feed */}
        <div className="space-y-4">
          <div className="brutal-card bg-white p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-md uppercase">
                TRANSCRIPT FEED
              </h3>
              <span className="font-mono text-[10px] font-bold bg-black text-white px-1.5 py-0.5">
                {roomState.submittedWords.length} LOGGED
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1 font-mono text-xs">
              {roomState.submittedWords.length === 0 ? (
                <div className="text-gray-400 italic text-center py-8">
                  No words submitted yet. Round 1 in progress.
                </div>
              ) : (
                roomState.submittedWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 border-2 border-black bg-canvas shadow-brutal-sm flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                        <span className="bg-brutal-yellow text-black px-1 border border-black">
                          R{item.round}
                        </span>
                        <span>@{item.username}</span>
                      </div>
                      <div className="font-black text-sm text-black mt-1 uppercase">
                        "{item.word}"
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
