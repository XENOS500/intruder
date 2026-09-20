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

  // IF CURRENT USER IS NOT GOD: Show Waiting Status Screen
  if (!isGod) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="brutal-card bg-white p-8 text-center border-4">
          <div className="inline-flex items-center justify-center p-4 bg-brutal-yellow border-3 border-black shadow-brutal mb-6 animate-pulse">
            <Crown size={48} className="text-black" />
          </div>

          <div className="brutal-badge bg-brutal-orange text-black mb-3">
            PHASE: ROLE & WORD SETUP
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase mb-3">
            GOD IS ORCHESTRATING...
          </h1>

          <div className="bg-canvas border-2 border-black p-4 mb-6 font-mono text-sm">
            <p className="font-bold text-black mb-1">
              CURRENT GOD:{' '}
              <span className="bg-brutal-yellow px-2 py-0.5 border border-black">
                @{godPlayer?.username || 'God'}
              </span>
            </p>
            <p className="text-xs text-gray-700 mt-2">
              The God is secretively designating 1 Intruder among you, providing the Citizens with a secret word, and giving the Intruder a subtle variant!
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 font-mono text-xs font-bold text-gray-500">
            <span className="inline-block w-3 h-3 bg-brutal-red animate-ping" />
            STAND BY FOR SECRET WORD DISPATCH...
          </div>
        </div>
      </div>
    );
  }

  // IF CURRENT USER IS GOD: Show God Control Deck
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Deck Header */}
      <div className="brutal-card bg-brutal-orange p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="brutal-badge bg-black text-white text-xs mb-1">
              EXCLUSIVE CONTROL DECK
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase flex items-center gap-2">
              <Crown size={32} /> YOU ARE THE GOD
            </h1>
          </div>
          <div className="font-mono text-xs font-bold bg-white border-2 border-black p-2.5 shadow-brutal-sm">
            CONFIDENTIAL // DO NOT SCREEN-SHARE
          </div>
        </div>
      </div>

      <form onSubmit={handleStart} className="space-y-6">
        {/* Section A: Intruder Assignment Selector */}
        <div className="brutal-card bg-white p-6">
          <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
            <h2 className="font-display font-black text-xl uppercase flex items-center gap-2">
              <UserX className="text-brutal-red" size={24} />
              1. CHOOSE THE SECRET INTRUDER
            </h2>
            <span className="font-mono text-xs font-bold text-brutal-red bg-brutal-pink px-2 py-0.5 border border-black">
              TOP SECRET
            </span>
          </div>
          <p className="font-mono text-xs text-gray-700 mb-4">
            Only you will know who the intruder is. The rest of the players will only know you are the God.
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
                      ? 'bg-brutal-red text-white shadow-brutal translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-canvas text-black hover:bg-white shadow-brutal-sm'
                  }`}
                >
                  <span className="truncate">{player.username}</span>
                  {isSelected && (
                    <span className="bg-black text-white text-[10px] px-1.5 py-0.5 border border-white uppercase">
                      INTRUDER
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section B: Word Dispatch Matrix */}
        <div className="brutal-card bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b-2 border-black pb-2">
            <h2 className="font-display font-black text-xl uppercase flex items-center gap-2">
              <MessageSquare className="text-brutal-blue" size={24} />
              2. WORD DISPATCH MATRIX
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={rollPreset}
                className="brutal-btn brutal-btn-yellow py-1 px-3 text-xs flex items-center gap-1 shadow-brutal-sm"
              >
                <RefreshCw size={12} />
                AUTO-FILL PRESET
              </button>
              <button
                type="button"
                onClick={() => setShowWords(!showWords)}
                className="brutal-btn brutal-btn-white py-1 px-2 text-xs shadow-brutal-sm"
                title="Toggle word visibility"
              >
                {showWords ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Citizen Word */}
            <div className="border-2 border-black p-4 bg-[#E8F5E9] shadow-brutal-sm">
              <label className="block font-mono font-black text-xs uppercase text-green-900 mb-1">
                CITIZEN SECRET WORD (BASE WORD):
              </label>
              <p className="font-mono text-[11px] text-gray-600 mb-2">
                This word will be secretly dispatched to all Citizens.
              </p>
              <input
                type={showWords ? 'text' : 'password'}
                placeholder="e.g. Coffee"
                value={citizenWord}
                onChange={(e) => setCitizenWord(e.target.value)}
                className="brutal-input w-full font-bold text-lg"
                required
              />
            </div>

            {/* Intruder Word */}
            <div className="border-2 border-black p-4 bg-brutal-pink shadow-brutal-sm">
              <label className="block font-mono font-black text-xs uppercase text-red-900 mb-1">
                INTRUDER ALTERNATE WORD (HINT / VARIANT):
              </label>
              <p className="font-mono text-[11px] text-gray-600 mb-2">
                This subtly related word will be sent ONLY to the chosen Intruder.
              </p>
              <input
                type={showWords ? 'text' : 'password'}
                placeholder="e.g. Tea"
                value={intruderWord}
                onChange={(e) => setIntruderWord(e.target.value)}
                className="brutal-input w-full font-bold text-lg"
                required
              />
            </div>
          </div>
        </div>

        {/* Section C: Starter Selector */}
        <div className="brutal-card bg-white p-6">
          <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
            <h2 className="font-display font-black text-xl uppercase flex items-center gap-2">
              <Play className="text-brutal-green" size={24} />
              3. WHO SPEAKS FIRST IN ROUND 1?
            </h2>
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
                  className={`p-3 border-2 border-black text-left font-mono font-bold transition flex items-center justify-between ${
                    isStarter
                      ? 'bg-brutal-yellow text-black shadow-brutal'
                      : 'bg-canvas text-black hover:bg-white shadow-brutal-sm'
                  }`}
                >
                  <span className="truncate">{player.username}</span>
                  {isStarter && (
                    <span className="bg-black text-white text-[10px] px-1 py-0.5 uppercase">
                      STARTER
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Lock In Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!selectedIntruder || !citizenWord.trim() || !intruderWord.trim() || !selectedStarter}
            className="brutal-btn brutal-btn-green w-full py-4 text-xl flex items-center justify-center gap-3 shadow-brutal-lg"
          >
            <Sparkles size={24} />
            LOCK IN & START ROUND 1
          </button>
        </div>
      </form>
    </div>
  );
};
