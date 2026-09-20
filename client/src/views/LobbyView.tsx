import React, { useState } from 'react';
import type { RoomState } from '../types';
import { Crown, Play, Users, Settings, PlusCircle, LogIn, Sparkles, AlertCircle } from 'lucide-react';

interface LobbyViewProps {
  roomState: RoomState | null;
  socketId: string;
  onCreateRoom: (username: string, config: { roundsPerTurn: number; discussionDurationSec: number }) => Promise<any>;
  onJoinRoom: (roomCode: string, username: string) => Promise<any>;
  onUpdateConfig: (config: { roundsPerTurn: number; discussionDurationSec: number }) => void;
  onStartGame: () => void;
}

// Canonical Neubrutalism Card Tint Palette
const ROSTER_TINTS = [
  'bg-brutal-yellow-light border-black',
  'bg-brutal-pink-light border-black',
  'bg-brutal-blue-light border-black',
  'bg-brutal-green-light border-black',
  'bg-brutal-purple-light border-black',
  'bg-brutal-orange-light border-black',
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomState,
  socketId,
  onCreateRoom,
  onJoinRoom,
  onUpdateConfig,
  onStartGame,
}) => {
  const [username, setUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [rounds, setRounds] = useState(2);
  const [discussionSec, setDiscussionSec] = useState(90);
  const [loading, setLoading] = useState(false);

  const isHost = roomState?.players.find((p) => p.socketId === socketId)?.isHost ?? false;
  const connectedPlayers = roomState?.players.filter((p) => p.connected) || [];
  const canStart = isHost && connectedPlayers.length >= 3;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    await onCreateRoom(username, { roundsPerTurn: rounds, discussionDurationSec: discussionSec });
    setLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !joinCode.trim()) return;
    setLoading(true);
    await onJoinRoom(joinCode, username);
    setLoading(false);
  };

  const handleConfigChange = (newRounds: number, newSec: number) => {
    setRounds(newRounds);
    setDiscussionSec(newSec);
    if (isHost && roomState) {
      onUpdateConfig({ roundsPerTurn: newRounds, discussionDurationSec: newSec });
    }
  };

  // If not yet in a room, display the Create/Join Landing View
  if (!roomState) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Banner with Neubrutalist Dots Pattern */}
        <div className="brutal-card bg-brutal-yellow p-6 sm:p-10 mb-8 text-center relative overflow-hidden">
          <div className="pattern-dots absolute inset-0 opacity-15 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-center gap-2 mb-3">
              <span className="brutal-badge badge-pink text-[11px]">
                SOCIAL DEDUCTION
              </span>
              <span className="brutal-badge badge-black text-[11px]">
                MULTI-DEVICE
              </span>
            </div>
            <h1 className="font-display font-black text-5xl sm:text-7xl text-black tracking-tight mb-2 uppercase drop-shadow-[3px_3px_0_#FFFFFF]">
              INTRUDER<span className="text-brutal-pink">_V1.0</span>
            </h1>
            <div className="mt-3">
              <span className="font-mono text-xs sm:text-sm font-bold bg-white inline-block px-3 py-1.5 border-2 border-black shadow-brutal-sm uppercase">
                ONE SECRET WORD • ONE IMPOSTER • ZERO BLUR
              </span>
            </div>
          </div>
        </div>

        {/* Bento Grid with Canonical Color-Coded Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Universal Username Input Box (Yellow Tint) */}
          <div className="md:col-span-2 brutal-box-yellow p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono font-black text-xs sm:text-sm uppercase tracking-wider text-black">
                ENTER YOUR PLAYER ALIAS:
              </label>
              <span className="brutal-badge badge-yellow text-[10px]">
                REQUIRED
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Maverick, Neo, Raven"
              maxLength={16}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="brutal-input w-full text-lg font-bold"
              required
            />
          </div>

          {/* Panel 1: Host Room (Mint Green Box) */}
          <div className="brutal-box-green p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                  <PlusCircle className="text-black" size={22} />
                  <h2 className="font-display font-black text-xl uppercase">HOST A MATCH</h2>
                </div>
                <span className="brutal-badge badge-green text-[10px]">NEW ROOM</span>
              </div>
              <p className="font-mono text-xs text-gray-700 mb-4">
                Generate a 6-character room code and configure custom game parameters.
              </p>

              {/* Settings Preview inside Host Panel */}
              <div className="bg-white border-2 border-black p-3 mb-5 space-y-2 font-mono text-xs font-bold shadow-brutal-sm">
                <div className="flex justify-between items-center">
                  <span>ROUNDS:</span>
                  <select
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    className="border-2 border-black px-2 py-0.5 bg-brutal-yellow-light font-mono font-bold"
                  >
                    <option value={1}>1 Round (Blitz)</option>
                    <option value={2}>2 Rounds (Standard)</option>
                    <option value={3}>3 Rounds (Deep)</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span>DEBATE TIME:</span>
                  <select
                    value={discussionSec}
                    onChange={(e) => setDiscussionSec(Number(e.target.value))}
                    className="border-2 border-black px-2 py-0.5 bg-brutal-yellow-light font-mono font-bold"
                  >
                    <option value={30}>30s (Rapid)</option>
                    <option value={60}>60s (Standard)</option>
                    <option value={90}>90s (Recommended)</option>
                    <option value={120}>120s (Extended)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading || !username.trim()}
              className="brutal-btn brutal-btn-green w-full flex items-center justify-center gap-2 text-base shadow-brutal"
            >
              <PlusCircle size={18} />
              CREATE ROOM
            </button>
          </div>

          {/* Panel 2: Join Room (Sky Blue Box) */}
          <div className="brutal-box-blue p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                  <LogIn className="text-black" size={22} />
                  <h2 className="font-display font-black text-xl uppercase">JOIN A MATCH</h2>
                </div>
                <span className="brutal-badge badge-blue text-[10px]">DIRECT ACCESS</span>
              </div>
              <p className="font-mono text-xs text-gray-700 mb-4">
                Have a room code from your friends? Paste it below to hop into the match.
              </p>

              <div className="mb-5">
                <label className="block font-mono font-black text-xs uppercase mb-1 text-black">
                  6-CHARACTER CODE:
                </label>
                <input
                  type="text"
                  placeholder="e.g. WX9K2P"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="brutal-input w-full uppercase tracking-widest font-black text-center text-xl bg-white"
                />
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={loading || !username.trim() || !joinCode.trim()}
              className="brutal-btn brutal-btn-blue w-full flex items-center justify-center gap-2 text-base shadow-brutal"
            >
              <LogIn size={18} />
              JOIN MATCH
            </button>
          </div>

          {/* Panel 3: Gameplay Rules (Lavender Box) */}
          <div className="md:col-span-2 brutal-box-purple p-5">
            <div className="flex items-center gap-2 font-mono font-black text-xs uppercase mb-2">
              <Sparkles size={16} className="text-black" />
              <span>THE NEUBRUTALIST GAMEPLAY RULES:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-white border-2 border-black p-2.5 shadow-brutal-sm">
                <strong className="block text-brutal-orange uppercase mb-0.5">1. The God</strong>
                Players take turns as the God. Everyone knows who God is!
              </div>
              <div className="bg-white border-2 border-black p-2.5 shadow-brutal-sm">
                <strong className="block text-brutal-pink uppercase mb-0.5">2. The Intruder</strong>
                God secretly assigns 1 Intruder an alternate variant word.
              </div>
              <div className="bg-white border-2 border-black p-2.5 shadow-brutal-sm">
                <strong className="block text-brutal-blue uppercase mb-0.5">3. Word Rounds</strong>
                Non-God players say 1-word associations clockwise.
              </div>
              <div className="bg-white border-2 border-black p-2.5 shadow-brutal-sm">
                <strong className="block text-brutal-green uppercase mb-0.5">4. Accusation</strong>
                If citizens vote wrong, the Intruder wins the round!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inside Room Lobby
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Lobby Header Card (Bold Yellow with Dots) */}
      <div className="brutal-card bg-brutal-yellow p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="pattern-dots absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="brutal-badge badge-black text-xs mb-2">
              LOBBY STATUS // WAITING ROOM
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight">
              ROOM <span className="bg-white px-3 py-1 border-3 border-black shadow-brutal font-mono">{roomState.roomCode}</span>
            </h1>
          </div>
          <div className="font-mono text-sm font-black bg-white border-3 border-black p-3 shadow-brutal">
            <div className="flex items-center gap-2 text-black">
              <Users size={20} />
              <span>{connectedPlayers.length} PLAYERS ASSEMBLED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connected Roster Grid (2 Columns) */}
        <div className="md:col-span-2 space-y-4">
          <div className="brutal-card bg-white p-6">
            <div className="flex items-center justify-between mb-4 border-b-3 border-black pb-3">
              <h2 className="font-display font-black text-xl uppercase flex items-center gap-2">
                <Users size={22} />
                CONNECTED ROSTER
              </h2>
              <span className="brutal-badge badge-pink text-[10px]">
                3 PLAYERS MIN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roomState.players.map((player, index) => {
                const isCurrentGod = index === (roomState.godRotationIndex % roomState.players.length);
                const isMe = player.socketId === socketId;
                const tintClass = ROSTER_TINTS[index % ROSTER_TINTS.length];

                return (
                  <div
                    key={player.socketId}
                    className={`border-3 p-3.5 shadow-brutal-sm transition ${
                      !player.connected
                        ? 'opacity-40 bg-gray-200 border-black'
                        : isMe
                        ? 'bg-brutal-yellow border-black shadow-brutal'
                        : `${tintClass}`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-black text-sm truncate">
                        @{player.username} {isMe && '(YOU)'}
                      </span>
                      {player.isHost && (
                        <span className="brutal-badge badge-orange text-[9px] py-0 px-1">
                          HOST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-gray-700">Turn #{index + 1}</span>
                      {isCurrentGod && (
                        <span className="text-black font-black flex items-center gap-1 bg-brutal-yellow px-1.5 py-0.5 border border-black shadow-brutal-sm">
                          <Crown size={11} /> NEXT GOD
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {connectedPlayers.length < 3 && (
              <div className="mt-4 p-3.5 bg-brutal-pink-light border-3 border-black flex items-center gap-2 text-xs font-mono font-bold text-red-900">
                <AlertCircle size={18} />
                Waiting for {3 - connectedPlayers.length} more player(s) to meet the 3-player quorum.
              </div>
            )}
          </div>
        </div>

        {/* Host Control Deck & Settings (Tangerine Box) */}
        <div className="space-y-4">
          <div className="brutal-box-orange p-6">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <Settings size={20} />
                <h3 className="font-display font-black text-lg uppercase">GAME CONFIG</h3>
              </div>
              <span className="brutal-badge badge-orange text-[10px]">RULES</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-black uppercase mb-1">WORD ROUNDS:</label>
                <select
                  disabled={!isHost}
                  value={roomState.config.roundsPerTurn}
                  onChange={(e) => handleConfigChange(Number(e.target.value), roomState.config.discussionDurationSec)}
                  className="brutal-input w-full py-1.5 text-xs font-bold bg-white"
                >
                  <option value={1}>1 Round (Fast)</option>
                  <option value={2}>2 Rounds (Recommended)</option>
                  <option value={3}>3 Rounds (Deep)</option>
                </select>
              </div>

              <div>
                <label className="block font-black uppercase mb-1">DEBATE TIMER:</label>
                <select
                  disabled={!isHost}
                  value={roomState.config.discussionDurationSec}
                  onChange={(e) => handleConfigChange(roomState.config.roundsPerTurn, Number(e.target.value))}
                  className="brutal-input w-full py-1.5 text-xs font-bold bg-white"
                >
                  <option value={30}>30s (Blitz)</option>
                  <option value={60}>60s (Standard)</option>
                  <option value={90}>90s (Recommended)</option>
                  <option value={120}>120s (Extended)</option>
                </select>
              </div>

              {!isHost && (
                <p className="text-[11px] text-gray-700 italic">
                  Only the Host can modify these parameters.
                </p>
              )}
            </div>

            {/* Start Button */}
            <div className="mt-6">
              {isHost ? (
                <button
                  onClick={onStartGame}
                  disabled={!canStart}
                  className="brutal-btn brutal-btn-green w-full flex items-center justify-center gap-2 text-base shadow-brutal-lg"
                >
                  <Play size={18} />
                  START GAME
                </button>
              ) : (
                <div className="text-center font-mono text-xs font-bold p-3.5 bg-white border-2 border-black shadow-brutal-sm">
                  WAITING FOR HOST TO COMMENCE...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
