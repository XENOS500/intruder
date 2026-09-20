import React, { useState, useEffect } from 'react';
import type { RoomState } from '../types';
import { Crown, Sparkles, UserX, MessageSquare, Play, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface GodSetupViewProps {
  roomState: RoomState;
  socketId: string;
  onLockIn: (params: {
    intruderSocketId: string;
    citizenWord: string;
    intruderWord: string;
    starterSocketId: string;
  }) => void;
}

const QUICK_PRESETS = [
  { citizen: 'Coffee', intruder: 'Tea' },
  { citizen: 'Ocean', intruder: 'Lake' },
  { citizen: 'Tiger', intruder: 'Lion' },
  { citizen: 'Violin', intruder: 'Guitar' },
  { citizen: 'Sun', intruder: 'Moon' },
  { citizen: 'Pizza', intruder: 'Burger' },
  { citizen: 'Laptop', intruder: 'Tablet' },
  { citizen: 'Doctor', intruder: 'Nurse' },
  { citizen: 'Bicycle', intruder: 'Motorcycle' },
  { citizen: 'Rain', intruder: 'Snow' },
  { citizen: 'Apple', intruder: 'Pear' },
  { citizen: 'Ice Cream', intruder: 'Frozen Yogurt' },
];

export const GodSetupView: React.FC<GodSetupViewProps> = ({ roomState, socketId, onLockIn }) => {
  const isGod = roomState.godSocketId === socketId;
  const godPlayer = roomState.players.find((p) => p.socketId === roomState.godSocketId);
  const eligiblePlayers = roomState.players.filter(
    (p) => p.socketId !== roomState.godSocketId && p.connected
  );

  const [selectedIntruder, setSelectedIntruder] = useState<string>(
    eligiblePlayers[0]?.socketId || ''
  );
  const [citizenWord, setCitizenWord] = useState<string>('');
  const [intruderWord, setIntruderWord] = useState<string>('');
  const [selectedStarter, setSelectedStarter] = useState<string>(
    eligiblePlayers[0]?.socketId || ''
  );
  const [showWords, setShowWords] = useState<boolean>(true);

  // Initialize defaults when players list updates
  useEffect(() => {
    if (eligiblePlayers.length > 0) {
      if (!eligiblePlayers.some((p) => p.socketId === selectedIntruder)) {
        setSelectedIntruder(eligiblePlayers[0].socketId);
      }
      if (!eligiblePlayers.some((p) => p.socketId === selectedStarter)) {
        setSelectedStarter(eligiblePlayers[0].socketId);
      }
    }
  }, [eligiblePlayers, selectedIntruder, selectedStarter]);

  const rollPreset = () => {
    const pair = QUICK_PRESETS[Math.floor(Math.random() * QUICK_PRESETS.length)];
    setCitizenWord(pair.citizen);
    setIntruderWord(pair.intruder);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntruder || !citizenWord.trim() || !intruderWord.trim() || !selectedStarter) {
      return;
    }
    onLockIn({
      intruderSocketId: selectedIntruder,
      citizenWord: citizenWord.trim(),
      intruderWord: intruderWord.trim(),
      starterSocketId: selectedStarter,
    });
  };

  // IF CURRENT USER IS NOT GOD: Show Colorful Neubrutalist Waiting Screen
  if (!isGod) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="brutal-box-yellow p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="pattern-dots absolute inset-0 opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-5 bg-brutal-orange border-3 border-black shadow-brutal mb-6 animate-pulse">
              <Crown size={52} className="text-black" />
            </div>

            <div className="mb-3">
              <span className="brutal-badge badge-orange text-xs">
                PHASE 02 // ROLE & WORD ORCHESTRATION
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase mb-3">
              GOD IS FORGING FATES...
            </h1>

            <div className="bg-white border-3 border-black p-5 mb-6 font-mono text-sm shadow-brutal-sm text-left">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
                <span className="text-gray-700 font-bold uppercase text-xs">CURRENT GOD:</span>
                <span className="bg-brutal-yellow px-2 py-0.5 border border-black font-black">
                  @{godPlayer?.username || 'God'}
                </span>
              </div>
              <p className="text-xs text-gray-700">
                The designated God is secretly assigning 1 player as the Intruder, dispatching the Citizen secret word, and creating an alternate prompt!
              </p>
            </div>

            <div className="inline-flex items-center gap-2 font-mono text-xs font-black bg-black text-white px-3 py-1.5 border border-black shadow-brutal-sm">
              <span className="inline-block w-2.5 h-2.5 bg-brutal-pink animate-ping" />
              <span>AWAITING DISPATCH TO COMMENCE ROUND 1...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // IF CURRENT USER IS GOD: Show God Control Deck with Colorful Bento Boxes
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Deck Header (Tangerine with Dots) */}
      <div className="brutal-card bg-brutal-orange p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="pattern-dots absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="brutal-badge badge-black text-xs mb-2">
              COMMAND DECK // CLASSIFIED
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase flex items-center gap-3">
              <Crown size={38} /> YOU ARE THE GOD
            </h1>
          </div>
          <div className="font-mono text-xs font-black bg-white border-3 border-black p-3 shadow-brutal">
            SECRET ARCHITECT // TOP SECRET
          </div>
        </div>
      </div>

      <form onSubmit={handleStart} className="space-y-6">
        {/* Section 1: Intruder Assignment Selector (Coral Pink Box) */}
        <div className="brutal-box-pink p-6">
          <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
            <h2 className="font-display font-black text-xl uppercase flex items-center gap-2">
              <UserX className="text-black" size={22} />
              1. CHOOSE THE SECRET INTRUDER
            </h2>
            <span className="brutal-badge badge-pink text-[10px]">
              CONFIDENTIAL
            </span>
          </div>
          <p className="font-mono text-xs text-gray-700 mb-4">
            Only you know who the intruder is. The citizens will only know who the God is.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {eligiblePlayers.map((player) => {
              const isSelected = selectedIntruder === player.socketId;
              return (
                <button
                  type="button"
                  key={player.socketId}
                  onClick={() => setSelectedIntruder(player.socketId)}
                  className={`p-4 border-3 border-black text-left font-mono font-bold transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-brutal-pink text-black shadow-brutal-lg translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-white text-black hover:bg-brutal-pink-light shadow-brutal-sm'
                  }`}
                >
                  <span className="truncate">@{player.username}</span>
                  {isSelected && (
                    <span className="bg-black text-white text-[10px] px-1.5 py-0.5 border border-black font-black uppercase">
                      INTRUDER
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Word Dispatch Matrix (Sky Blue Container) */}
        <div className="brutal-box-blue p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b-2 border-black pb-2">
            <h2 className="font-display font-black text-xl uppercase flex items-center gap-2">
              <MessageSquare className="text-black" size={22} />
              2. WORD DISPATCH MATRIX
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={rollPreset}
                className="brutal-btn brutal-btn-yellow py-1.5 px-3 text-xs flex items-center gap-1 shadow-brutal-sm"
              >
                <RefreshCw size={12} />
                AUTO-FILL PRESET
              </button>
              <button
                type="button"
                onClick={() => setShowWords(!showWords)}
                className="brutal-btn brutal-btn-white py-1.5 px-2.5 text-xs shadow-brutal-sm"
                title="Toggle word visibility"
              >
                {showWords ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Citizen Word (Mint Green Card) */}
            <div className="border-3 border-black p-4 bg-brutal-green-light shadow-brutal">
              <div className="flex justify-between items-center mb-1">
                <label className="font-mono font-black text-xs uppercase text-green-950">
                  CITIZEN SECRET WORD (BASE):
                </label>
                <span className="brutal-badge badge-green text-[9px]">MAJORITY</span>
              </div>
              <p className="font-mono text-[11px] text-gray-700 mb-2">
                Secretly dispatched to all Citizens.
              </p>
              <input
                type={showWords ? 'text' : 'password'}
                placeholder="e.g. Coffee"
                value={citizenWord}
                onChange={(e) => setCitizenWord(e.target.value)}
                className="brutal-input w-full font-bold text-lg bg-white"
                required
              />
            </div>

            {/* Intruder Word (Coral Pink Card) */}
            <div className="border-3 border-black p-4 bg-brutal-pink-light shadow-brutal">
              <div className="flex justify-between items-center mb-1">
                <label className="font-mono font-black text-xs uppercase text-red-950">
                  INTRUDER ALTERNATE PROMPT (HINT):
                </label>
                <span className="brutal-badge badge-pink text-[9px]">SECRET VARIANT</span>
              </div>
              <p className="font-mono text-[11px] text-gray-700 mb-2">
                Subtly related word sent ONLY to the Intruder.
              </p>
              <input
                type={showWords ? 'text' : 'password'}
                placeholder="e.g. Tea"
                value={intruderWord}
                onChange={(e) => setIntruderWord(e.target.value)}
                className="brutal-input w-full font-bold text-lg bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Starter Selector (Lavender Box) */}
        <div className="brutal-box-purple p-6">
          <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
            <h2 className="font-display font-black text-xl uppercase flex items-center gap-2">
              <Play className="text-black" size={22} />
              3. SELECT STARTING SPEAKER (ROUND 1)
            </h2>
            <span className="brutal-badge badge-purple text-[10px]">SPEAKER #1</span>
          </div>
          <p className="font-mono text-xs text-gray-700 mb-4">
            Words proceed clockwise starting from this designated player.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {eligiblePlayers.map((player) => {
              const isStarter = selectedStarter === player.socketId;
              return (
                <button
                  type="button"
                  key={player.socketId}
                  onClick={() => setSelectedStarter(player.socketId)}
                  className={`p-3.5 border-3 border-black text-left font-mono font-bold transition flex items-center justify-between ${
                    isStarter
                      ? 'bg-brutal-yellow text-black shadow-brutal-lg translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-white text-black hover:bg-brutal-purple-light shadow-brutal-sm'
                  }`}
                >
                  <span className="truncate">@{player.username}</span>
                  {isStarter && (
                    <span className="bg-black text-white text-[10px] px-1.5 py-0.5 uppercase font-black">
                      STARTER
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Lock In Action Button (Mint Green) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!selectedIntruder || !citizenWord.trim() || !intruderWord.trim() || !selectedStarter}
            className="brutal-btn brutal-btn-green w-full py-4 text-xl flex items-center justify-center gap-3 shadow-brutal-lg"
          >
            <Sparkles size={24} />
            LOCK IN & COMMENCE ROUND 1
          </button>
        </div>
      </form>
    </div>
  );
};
