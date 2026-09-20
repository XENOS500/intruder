import React, { useState } from 'react';
import type { RoomState } from '../types';
import { Copy, Check, Crown, Wifi, WifiOff } from 'lucide-react';

interface NavbarProps {
  roomState: RoomState | null;
  connected: boolean;
  socketId: string;
}

export const Navbar: React.FC<NavbarProps> = ({ roomState, connected, socketId }) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    if (!roomState?.roomCode) return;
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPlayer = roomState?.players.find((p) => p.socketId === socketId);
  const godPlayer = roomState?.players.find((p) => p.socketId === roomState.godSocketId);

  const getPhaseBadgeColor = (state: string) => {
    switch (state) {
      case 'LOBBY':
        return 'bg-brutal-blue text-white';
      case 'ROLE_SETUP':
        return 'bg-brutal-orange text-black';
      case 'PLAY_ROUNDS':
        return 'bg-brutal-yellow text-black';
      case 'DISCUSSION':
        return 'bg-brutal-blue text-white';
      case 'VOTING':
        return 'bg-brutal-red text-white';
      case 'TURN_RESULT':
        return 'bg-brutal-green text-white';
      default:
        return 'bg-white text-black';
    }
  };

  return (
    <header className="w-full bg-white border-b-4 border-black px-4 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-brutal-yellow border-2 border-black p-1 shadow-brutal-sm font-mono font-black text-xl tracking-tighter">
            !
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-black drop-shadow-[2px_2px_0_#FFEB3B]">
            INTRUDER<span className="text-brutal-red">.IO</span>
          </span>
          <span className="hidden sm:inline-block brutal-badge bg-black text-white text-[10px] ml-1">
            V1.0
          </span>
        </div>

        {/* Room & Game Info */}
        {roomState ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Room Code with Copy */}
            <button
              onClick={copyRoomCode}
              title="Click to copy room code"
              className="flex items-center gap-1.5 bg-brutal-yellow border-2 border-black px-2.5 py-1 font-mono font-bold text-sm shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span className="text-xs text-gray-700">ROOM:</span>
              <span className="tracking-widest text-black font-black">{roomState.roomCode}</span>
              {copied ? <Check size={14} className="text-green-700" /> : <Copy size={14} />}
            </button>

            {/* Current Phase Badge */}
            <div className={`brutal-badge ${getPhaseBadgeColor(roomState.state)}`}>
              {roomState.state.replace('_', ' ')}
            </div>

            {/* God Indicator Badge */}
            {godPlayer && (
              <div className="hidden md:flex items-center gap-1 brutal-badge bg-brutal-orange text-black border-2 border-black">
                <Crown size={12} />
                <span>GOD: @{godPlayer.username}</span>
              </div>
            )}

            {/* Current User Badge */}
            {currentPlayer && (
              <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-0.5 font-mono text-xs font-bold shadow-brutal-sm">
                <span>YOU:</span>
                <span className="text-brutal-blue">@{currentPlayer.username}</span>
                {currentPlayer.isHost && (
                  <span className="bg-brutal-yellow text-[9px] px-1 border border-black ml-0.5">
                    HOST
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs font-mono font-bold bg-brutal-yellow px-2 py-1 border-2 border-black shadow-brutal-sm">
            MULTIPLAYER SOCIAL DEDUCTION
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-1 text-xs font-mono font-bold">
          {connected ? (
            <span className="flex items-center gap-1 bg-green-100 text-green-800 border border-black px-2 py-0.5">
              <Wifi size={12} className="text-green-600" /> ONLINE
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-red-100 text-red-800 border border-black px-2 py-0.5">
              <WifiOff size={12} className="text-red-600" /> CONNECTING...
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
