import React, { useState, useRef, useEffect } from 'react';
import type { RoomState } from '../types';
import { Clock, Send, MessageCircle, FileText } from 'lucide-react';

interface DiscussionChatViewProps {
  roomState: RoomState;
  socketId: string;
  onSendMessage: (text: string) => void;
}

export const DiscussionChatView: React.FC<DiscussionChatViewProps> = ({
  roomState,
  socketId,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const secondsLeft = roomState.discussionSecondsLeft;
  const isUrgent = secondsLeft <= 15;

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomState.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Discussion Phase Header & Urgent Timer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Phase Info */}
        <div className="md:col-span-2 brutal-card bg-brutal-blue text-white p-5 flex flex-col justify-center">
          <div className="brutal-badge bg-black text-white text-xs mb-1 self-start">
            PHASE: GLOBAL DEBATE
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase">
            WHO IS THE INTRUDER?
          </h1>
          <p className="font-mono text-xs text-blue-100 mt-1">
            Compare word associations, cross-examine suspicious answers, and build consensus before the timer expires!
          </p>
        </div>

        {/* Large Countdown Timer */}
        <div
          className={`brutal-card p-5 text-center flex flex-col items-center justify-center transition-colors duration-200 ${
            isUrgent ? 'bg-brutal-red text-white animate-pulse' : 'bg-brutal-yellow text-black'
          }`}
        >
          <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase mb-1">
            <Clock size={16} />
            {isUrgent ? 'URGENT TIME REMAINING' : 'DISCUSSION TIMER'}
          </div>
          <div className="font-mono font-black text-5xl tracking-widest">
            {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
            {String(secondsLeft % 60).padStart(2, '0')}
          </div>
          {isUrgent && (
            <div className="font-mono text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 mt-2">
              VOTING STARTS IMMINENTLY!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Chat Feed + Input */}
        <div className="md:col-span-2 space-y-4">
          <div className="brutal-card bg-white p-4 h-[440px] flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h2 className="font-display font-black text-base uppercase flex items-center gap-2">
                <MessageCircle size={18} />
                DEBATE FLOOR
              </h2>
              <span className="font-mono text-xs text-gray-500 font-bold">
                {roomState.players.length} online
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
              {roomState.messages.map((msg) => {
                const isMe = msg.socketId === socketId;
                if (msg.isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="text-center font-mono text-[11px] font-bold bg-canvas border border-black p-1.5 text-gray-700 shadow-brutal-sm"
                    >
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="font-mono text-[10px] font-bold text-gray-600 mb-0.5">
                      @{msg.username} {isMe && '(YOU)'}
                    </div>
                    <div
                      className={`p-2.5 max-w-[85%] border-2 border-black shadow-brutal-sm font-sans text-sm font-medium ${
                        isMe
                          ? 'bg-brutal-yellow text-black'
                          : 'bg-white text-black'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="mt-3 flex gap-2 pt-2 border-t-2 border-black">
              <input
                type="text"
                placeholder="Debate, accuse or defend your word clue..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="brutal-input flex-1 min-w-0 text-sm font-bold"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="brutal-btn brutal-btn-yellow px-3 sm:px-4 shrink-0 flex items-center gap-1.5"
              >
                <Send size={16} />
                <span>SEND</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 Col): Reference Transcript Review */}
        <div className="space-y-4">
          <div className="brutal-card bg-white p-4 h-[440px] flex flex-col">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-3">
              <FileText size={18} />
              <h3 className="font-display font-black text-base uppercase">
                CLUES EVIDENCE
              </h3>
            </div>
            <p className="font-mono text-[11px] text-gray-600 mb-2">
              Review what each player submitted during the word rounds:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
              {roomState.submittedWords.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 border-2 border-black bg-canvas shadow-brutal-sm"
                >
                  <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
                    <span>@{item.username}</span>
                    <span className="bg-white px-1 border border-black">Round {item.round}</span>
                  </div>
                  <div className="font-black text-sm uppercase text-black">
                    "{item.word}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
