import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { RoomState, ChatMessage } from '../types';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000'
    : window.location.origin);

const SESSION_KEY = 'intruder_session';
const PLAYER_ID_KEY = 'intruder_player_id';

interface StoredSession {
  roomCode: string;
  username: string;
  playerId: string;
}

function getStoredPlayerId(): string {
  try {
    let pid = localStorage.getItem(PLAYER_ID_KEY);
    if (!pid) {
      pid = `p_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(PLAYER_ID_KEY, pid);
    }
    return pid;
  } catch {
    return `p_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStoredSession(session: StoredSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [activeSocketId, setActiveSocketId] = useState<string>('');

  const playerIdRef = useRef<string>(getStoredPlayerId());

  const showError = useCallback((msg: string) => {
    setErrorToast(msg);
    setTimeout(() => {
      setErrorToast((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const attemptRejoinStoredSession = useCallback(() => {
    const session = getStoredSession();
    const socket = socketRef.current;
    if (!session || !socket || !socket.connected) return;

    socket.emit(
      'joinRoom',
      {
        roomCode: session.roomCode,
        username: session.username,
        playerId: session.playerId || playerIdRef.current,
      },
      (res: { success: boolean; roomCode?: string; error?: string; playerId?: string }) => {
        if (!res.success) {
          // Room might have ended or expired
          clearStoredSession();
        } else if (res.playerId) {
          saveStoredSession({
            roomCode: session.roomCode,
            username: session.username,
            playerId: res.playerId,
          });
        }
      }
    );
  }, []);

  useEffect(() => {
    // Proactively hit health check to wake Render service if cold
    fetch(`${BACKEND_URL}/api/health`, { cache: 'no-store' }).catch(() => {});

    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 30,
      reconnectionDelay: 1500,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setActiveSocketId(socket.id || '');

      // Auto-reconnect session without re-entering code (especially for mobile backgrounding)
      attemptRejoinStoredSession();
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('roomStateUpdate', (newState: RoomState) => {
      setRoomState(newState);
      // Persist session if we have an active room
      if (newState.roomCode) {
        const me = newState.players.find((p) => p.socketId === socket.id || p.playerId === playerIdRef.current);
        if (me) {
          saveStoredSession({
            roomCode: newState.roomCode,
            username: me.username,
            playerId: me.playerId || playerIdRef.current,
          });
        }
      }
    });

    socket.on('timerTick', ({ secondsLeft }: { secondsLeft: number }) => {
      setRoomState((prev) => (prev ? { ...prev, discussionSecondsLeft: secondsLeft } : null));
    });

    socket.on('chatMessage', (msg: ChatMessage) => {
      setRoomState((prev) => {
        if (!prev) return null;
        if (prev.messages.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          messages: [...prev.messages, msg],
        };
      });
    });

    socket.on('errorMessage', ({ message }: { message: string }) => {
      showError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [showError, attemptRejoinStoredSession]);

  // Mobile App Switch / Tab Visibility Reconnection Listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const socket = socketRef.current;
        if (socket) {
          if (!socket.connected) {
            socket.connect();
          } else {
            attemptRejoinStoredSession();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [attemptRejoinStoredSession]);

  const createRoom = useCallback(
    (username: string, config: { roundsPerTurn: number; discussionDurationSec: number }) => {
      return new Promise<{ success: boolean; roomCode?: string; error?: string }>((resolve) => {
        if (!socketRef.current) return resolve({ success: false, error: 'Socket not connected' });
        const pid = playerIdRef.current;
        socketRef.current.emit(
          'createRoom',
          { username, config, playerId: pid },
          (response: { success: boolean; roomCode?: string; error?: string; playerId?: string }) => {
            if (!response.success && response.error) {
              showError(response.error);
            } else if (response.success && response.roomCode) {
              saveStoredSession({
                roomCode: response.roomCode,
                username,
                playerId: response.playerId || pid,
              });
            }
            resolve(response);
          }
        );
      });
    },
    [showError]
  );

  const joinRoom = useCallback(
    (roomCode: string, username: string) => {
      return new Promise<{ success: boolean; roomCode?: string; error?: string }>((resolve) => {
        if (!socketRef.current) return resolve({ success: false, error: 'Socket not connected' });
        const cleanCode = roomCode.trim().toUpperCase();
        const pid = playerIdRef.current;
        socketRef.current.emit(
          'joinRoom',
          { roomCode: cleanCode, username, playerId: pid },
          (response: { success: boolean; roomCode?: string; error?: string; playerId?: string }) => {
            if (!response.success && response.error) {
              showError(response.error);
            } else if (response.success) {
              saveStoredSession({
                roomCode: cleanCode,
                username,
                playerId: response.playerId || pid,
              });
            }
            resolve(response);
          }
        );
      });
    },
    [showError]
  );

  const leaveRoom = useCallback(() => {
    if (socketRef.current && roomState) {
      socketRef.current.emit('leaveRoom', { roomCode: roomState.roomCode });
    }
    clearStoredSession();
    setRoomState(null);
  }, [roomState]);

  const updateConfig = useCallback((config: { roundsPerTurn: number; discussionDurationSec: number }) => {
    if (!socketRef.current || !roomState) return;
    socketRef.current.emit('configUpdate', { roomCode: roomState.roomCode, config });
  }, [roomState]);

  const startGame = useCallback(() => {
    if (!socketRef.current || !roomState) return;
    socketRef.current.emit('startGame', { roomCode: roomState.roomCode });
  }, [roomState]);

  const godAssignRolesAndWords = useCallback(
    (params: { intruderSocketId: string; citizenWord: string; intruderWord: string; starterSocketId: string }) => {
      if (!socketRef.current || !roomState) return;
      socketRef.current.emit('godAssignRolesAndWords', {
        roomCode: roomState.roomCode,
        ...params,
      });
    },
    [roomState]
  );

  const submitWord = useCallback(
    (word: string) => {
      if (!socketRef.current || !roomState) return;
      socketRef.current.emit('submitWord', {
        roomCode: roomState.roomCode,
        word,
      });
    },
    [roomState]
  );

  const sendChatMessage = useCallback(
    (text: string) => {
      if (!socketRef.current || !roomState) return;
      socketRef.current.emit('sendChatMessage', {
        roomCode: roomState.roomCode,
        text,
      });
    },
    [roomState]
  );

  const submitVote = useCallback(
    (targetSocketId: string) => {
      if (!socketRef.current || !roomState) return;
      socketRef.current.emit('submitVote', {
        roomCode: roomState.roomCode,
        targetSocketId,
      });
    },
    [roomState]
  );

  const nextTurn = useCallback(() => {
    if (!socketRef.current || !roomState) return;
    socketRef.current.emit('nextTurn', { roomCode: roomState.roomCode });
  }, [roomState]);

  return {
    socket: socketRef.current,
    connected,
    socketId: activeSocketId,
    playerId: playerIdRef.current,
    roomState,
    errorToast,
    dismissError: () => setErrorToast(null),
    createRoom,
    joinRoom,
    leaveRoom,
    updateConfig,
    startGame,
    godAssignRolesAndWords,
    submitWord,
    sendChatMessage,
    submitVote,
    nextTurn,
  };
}
