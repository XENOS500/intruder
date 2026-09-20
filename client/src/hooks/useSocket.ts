import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { RoomState, ChatMessage } from '../types';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000'
    : window.location.origin);

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [activeSocketId, setActiveSocketId] = useState<string>('');

  const showError = useCallback((msg: string) => {
    setErrorToast(msg);
    setTimeout(() => {
      setErrorToast((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  useEffect(() => {
    // Proactively hit health check to wake Render service if cold
    fetch(`${BACKEND_URL}/api/health`, { cache: 'no-store' }).catch(() => {});

    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 30,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setActiveSocketId(socket.id || '');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('roomStateUpdate', (newState: RoomState) => {
      setRoomState(newState);
    });

    socket.on('timerTick', ({ secondsLeft }: { secondsLeft: number }) => {
      setRoomState((prev) => (prev ? { ...prev, discussionSecondsLeft: secondsLeft } : null));
    });

    socket.on('chatMessage', (msg: ChatMessage) => {
      setRoomState((prev) => {
        if (!prev) return null;
        // Check if message already in list
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
  }, [showError]);

  const createRoom = useCallback(
    (username: string, config: { roundsPerTurn: number; discussionDurationSec: number }) => {
      return new Promise<{ success: boolean; roomCode?: string; error?: string }>((resolve) => {
        if (!socketRef.current) return resolve({ success: false, error: 'Socket not connected' });
        socketRef.current.emit(
          'createRoom',
          { username, config },
          (response: { success: boolean; roomCode?: string; error?: string }) => {
            if (!response.success && response.error) {
              showError(response.error);
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
        socketRef.current.emit(
          'joinRoom',
          { roomCode: roomCode.trim().toUpperCase(), username },
          (response: { success: boolean; roomCode?: string; error?: string }) => {
            if (!response.success && response.error) {
              showError(response.error);
            }
            resolve(response);
          }
        );
      });
    },
    [showError]
  );

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
    roomState,
    errorToast,
    dismissError: () => setErrorToast(null),
    createRoom,
    joinRoom,
    updateConfig,
    startGame,
    godAssignRolesAndWords,
    submitWord,
    sendChatMessage,
    submitVote,
    nextTurn,
  };
}
