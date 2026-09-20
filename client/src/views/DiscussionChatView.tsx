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
        {/* Phase Info Box (Sky Blue with Pattern) */}
        <div className="md:col-span-2 brutal-card bg-brutal-blue text-black p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="pattern-dots absolute inset-0 opacity-15 pointer-events-none" />
          <div className="relative z-10">
            <div className="brutal-badge badge-black text-xs mb-2">
              PHASE 03 // GLOBAL DEBATE FLOOR
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight">
              WHO IS THE INTRUDER?
            </h1>
            <p className="font-mono text-xs text-gray-900 mt-1 font-bold">
              Compare words, cross-examine suspicious answers, and build consensus before time runs out!
            </p>
          </div>
        </div>

        {/* Large Countdown Timer Box */}
        <div
          className={`brutal-card p-6 text-center flex flex-col items-center justify-center transition-colors duration-200 ${
            isUrgent ? 'bg-brutal-red text-white animate-pulse' : 'bg-brutal-yellow text-black'
          }`}
        >
          <div className="flex items-center gap-1.5 font-mono text-xs font-black uppercase mb-1">
            <Clock size={16} />
            <span>{isUrgent ? 'CRITICAL TIME' : 'TIME REMAINING'}</span>
          </div>
          <div className="font-mono font-black text-5xl sm:text-6xl tracking-widest">
            {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
            {String(secondsLeft % 60).padStart(2, '0')}
          </div>
          {isUrgent && (
            <div className="font-mono text-[10px] font-black uppercase bg-black text-white px-2.5 py-0.5 mt-2 border border-white">
              VOTING STARTS IMMINENTLY!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Chat Feed + Input (Sky Blue Tint Container) */}
        <div className="md:col-span-2 space-y-4">
          <div className="brutal-box-blue p-5 h-[480px] flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h2 className="font-display font-black text-base uppercase flex items-center gap-2">
                <MessageCircle size={18} />
                DEBATE FLOOR
              </h2>
              <span className="brutal-badge badge-blue text-[10px]">
                {roomState.players.length} CONNECTED
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
                      className="text-center font-mono text-[11px] font-bold bg-white border-2 border-black p-2 text-gray-800 shadow-brutal-sm"
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
                    <div className="font-mono text-[10px] font-bold text-gray-700 mb-0.5">
                      @{msg.username} {isMe && '(YOU)'}
                    </div>
                    <div
                      className={`p-3 max-w-[85%] border-2 border-black shadow-brutal-sm font-sans text-sm font-medium ${
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
                className="brutal-input flex-1 min-w-0 text-sm font-bold bg-white"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="brutal-btn brutal-btn-yellow px-4 shrink-0 flex items-center gap-1.5 shadow-brutal-sm"
              >
                <Send size={16} />
                <span>SEND</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 Col): Clues Evidence Panel (Mint Green Box) */}
        <div className="space-y-4">
          <div className="brutal-box-green p-5 h-[480px] flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <h3 className="font-display font-black text-base uppercase">
                  CLUES EVIDENCE
                </h3>
              </div>
              <span className="brutal-badge badge-green text-[10px]">VERIFIED</span>
            </div>
            <p className="font-mono text-[11px] text-gray-700 mb-3">
              Cross-check everyone's one-word associations:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
              {roomState.submittedWords.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 border-2 border-black bg-white shadow-brutal-sm"
                >
                  <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                    <span>@{item.username}</span>
                    <span className="bg-brutal-yellow text-black px-1 border border-black font-black">
                      Round {item.round}
                    </span>
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
