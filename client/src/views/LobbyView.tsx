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
  const [discussionSec, setDiscussionSec] = useState(60);
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Giant Hero Banner */}
        <div className="brutal-card bg-brutal-yellow p-6 sm:p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-2 right-2 brutal-badge bg-black text-white text-xs">
            NO ADS // NO SIGNUP
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-black tracking-tight mb-2 uppercase">
            INTRUDER<span className="text-brutal-red">_V1.0</span>
          </h1>
          <p className="font-mono text-sm sm:text-base font-bold bg-white inline-block px-3 py-1 border-2 border-black shadow-brutal-sm mt-2">
            SOCIAL DEDUCTION • SECRET WORDS • DECEIVE YOUR FRIENDS
          </p>
        </div>

        {/* Bento Grid: Name Input + Action Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Universal Username Input Box */}
          <div className="md:col-span-2 brutal-card bg-white p-5">
            <label className="block font-mono font-black text-sm uppercase mb-2">
              YOUR PLAYER ALIAS:
            </label>
            <input
              type="text"
              placeholder="e.g. Neo, Cypher, Trinity"
              maxLength={16}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="brutal-input w-full text-lg font-bold"
              required
            />
          </div>

          {/* Panel 1: Create New Room */}
          <div className="brutal-card bg-white p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PlusCircle className="text-brutal-green" size={24} />
                <h2 className="font-display font-black text-xl uppercase">HOST A NEW ROOM</h2>
              </div>
              <p className="font-mono text-xs text-gray-700 mb-5">
                Generate a custom 6-digit room code and configure rounds and discussion timers.
              </p>

              {/* Default Settings Preview */}
              <div className="bg-canvas border-2 border-black p-3 mb-5 space-y-2 font-mono text-xs font-bold">
                <div className="flex justify-between items-center">
                  <span>ROUNDS PER GAME:</span>
                  <select
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    className="border-2 border-black px-1 py-0.5 bg-white font-mono font-bold"
                  >
                    <option value={1}>1 Round</option>
                    <option value={2}>2 Rounds (Default)</option>
                    <option value={3}>3 Rounds</option>
                    <option value={4}>4 Rounds</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span>DEBATE TIMER:</span>
                  <select
                    value={discussionSec}
                    onChange={(e) => setDiscussionSec(Number(e.target.value))}
                    className="border-2 border-black px-1 py-0.5 bg-white font-mono font-bold"
                  >
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                    <option value={90}>90 Seconds (Default)</option>
                    <option value={120}>120 Seconds</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading || !username.trim()}
              className="brutal-btn brutal-btn-green w-full flex items-center justify-center gap-2 text-base"
            >
              <PlusCircle size={18} />
              CREATE ROOM
            </button>
          </div>

          {/* Panel 2: Join Existing Room */}
          <div className="brutal-card bg-white p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LogIn className="text-brutal-blue" size={24} />
                <h2 className="font-display font-black text-xl uppercase">JOIN A ROOM</h2>
              </div>
              <p className="font-mono text-xs text-gray-700 mb-5">
                Have a 6-character room code from your friend? Enter it below to join the match.
              </p>

              <div className="mb-5">
                <label className="block font-mono font-black text-xs uppercase mb-1">
                  6-CHAR ROOM CODE:
                </label>
                <input
                  type="text"
                  placeholder="e.g. X9KJ2P"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="brutal-input w-full uppercase tracking-widest font-black text-center text-xl"
                />
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={loading || !username.trim() || !joinCode.trim()}
              className="brutal-btn brutal-btn-blue w-full flex items-center justify-center gap-2 text-base"
            >
              <LogIn size={18} />
              JOIN MATCH
            </button>
          </div>
        </div>

        {/* Quick Rules Banner */}
        <div className="mt-8 border-2 border-black bg-white p-4 font-mono text-xs shadow-brutal-sm">
          <div className="font-black text-black uppercase mb-1 flex items-center gap-1.5">
            <Sparkles size={14} className="text-brutal-orange" />
            HOW IT WORKS:
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>God Rotation:</strong> Players take turns being the God. Everyone knows who God is!</li>
            <li><strong>Secret Prompts:</strong> God secretly chooses 1 Intruder and gives them a slightly different word prompt.</li>
            <li><strong>Word Rounds:</strong> Non-god players say 1-word associations clockwise.</li>
            <li><strong>Debate & Vote:</strong> Spot the odd one out! If everyone votes wrong, Intruder wins!</li>
          </ul>
        </div>
      </div>
    );
  }

  // Inside Room Lobby
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Lobby Header Card */}
      <div className="brutal-card bg-brutal-yellow p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="brutal-badge bg-black text-white text-xs mb-1">WAITING LOBBY</div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase">
              ROOM <span className="bg-white px-2 py-0.5 border-2 border-black shadow-brutal-sm font-mono">{roomState.roomCode}</span>
            </h1>
          </div>
          <div className="font-mono text-sm font-bold bg-white border-2 border-black p-3 shadow-brutal-sm">
            <div className="flex items-center gap-2 text-brutal-black">
              <Users size={18} />
              <span>{connectedPlayers.length} PLAYERS CONNECTED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connected Roster Grid (2 Columns) */}
        <div className="md:col-span-2 space-y-4">
          <div className="brutal-card bg-white p-5">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <h2 className="font-display font-black text-lg uppercase flex items-center gap-2">
                <Users size={20} />
                CONNECTED PLAYERS
              </h2>
              <span className="font-mono text-xs font-bold text-gray-600">
                Min 3 players required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roomState.players.map((player, index) => {
                const isCurrentGod = index === (roomState.godRotationIndex % roomState.players.length);
                const isMe = player.socketId === socketId;

                return (
                  <div
                    key={player.socketId}
                    className={`border-2 border-black p-3 shadow-brutal-sm transition ${
                      !player.connected
                        ? 'opacity-40 bg-gray-200'
                        : isMe
                        ? 'bg-[#FFFDE7]'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sm truncate">
                        {player.username} {isMe && '(YOU)'}
                      </span>
                      {player.isHost && (
                        <span className="brutal-badge bg-brutal-orange text-[10px] py-0 px-1">
                          HOST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-600">
                      <span>Order #{index + 1}</span>
                      {isCurrentGod && (
                        <span className="text-brutal-black font-black flex items-center gap-0.5 bg-brutal-yellow px-1 border border-black">
                          <Crown size={10} /> NEXT GOD
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {connectedPlayers.length < 3 && (
              <div className="mt-4 p-3 bg-brutal-pink border-2 border-black flex items-center gap-2 text-xs font-mono font-bold text-red-800">
                <AlertCircle size={16} />
                Need at least {3 - connectedPlayers.length} more player(s) to start the game!
              </div>
            )}
          </div>
        </div>

        {/* Host Control Deck & Settings (1 Column) */}
        <div className="space-y-4">
          <div className="brutal-card bg-white p-5">
            <div className="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
              <Settings size={18} />
              <h3 className="font-display font-black text-md uppercase">GAME SETTINGS</h3>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold uppercase mb-1">ROUNDS OF WORDS:</label>
                <select
                  disabled={!isHost}
                  value={roomState.config.roundsPerTurn}
                  onChange={(e) => handleConfigChange(Number(e.target.value), roomState.config.discussionDurationSec)}
                  className="brutal-input w-full py-1 text-xs font-bold"
                >
                  <option value={1}>1 Round (Fast)</option>
                  <option value={2}>2 Rounds (Recommended)</option>
                  <option value={3}>3 Rounds (Deep)</option>
                  <option value={4}>4 Rounds</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">DISCUSSION TIME:</label>
                <select
                  disabled={!isHost}
                  value={roomState.config.discussionDurationSec}
                  onChange={(e) => handleConfigChange(roomState.config.roundsPerTurn, Number(e.target.value))}
                  className="brutal-input w-full py-1 text-xs font-bold"
                >
                  <option value={30}>30 Seconds (Blitz)</option>
                  <option value={60}>60 Seconds (Standard)</option>
                  <option value={90}>90 Seconds (Recommended)</option>
                  <option value={120}>120 Seconds (Extended)</option>
                </select>
              </div>

              {!isHost && (
                <p className="text-[11px] text-gray-500 italic">
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
                  className="brutal-btn brutal-btn-green w-full flex items-center justify-center gap-2 text-base"
                >
                  <Play size={18} />
                  START GAME
                </button>
              ) : (
                <div className="text-center font-mono text-xs font-bold p-3 bg-canvas border-2 border-black">
                  WAITING FOR HOST TO START...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
