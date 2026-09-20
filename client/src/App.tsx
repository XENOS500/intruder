import { useSocket } from './hooks/useSocket';
import { Navbar } from './components/Navbar';
import { LobbyView } from './views/LobbyView';
import { GodSetupView } from './views/GodSetupView';
import { WordSubmissionView } from './views/WordSubmissionView';
import { DiscussionChatView } from './views/DiscussionChatView';
import { VotingView } from './views/VotingView';
import { ScoreboardView } from './views/ScoreboardView';
import { AlertCircle, X } from 'lucide-react';

export function App() {
  const {
    connected,
    socketId,
    roomState,
    errorToast,
    dismissError,
    createRoom,
    joinRoom,
    updateConfig,
    startGame,
    godAssignRolesAndWords,
    submitWord,
    sendChatMessage,
    submitVote,
    nextTurn,
  } = useSocket();

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans selection:bg-brutal-yellow selection:text-black">
      {/* Top Persistent Navbar */}
      <Navbar roomState={roomState} connected={connected} socketId={socketId} />

      {/* Brutalist Error Notification Banner */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
          <div className="bg-brutal-red text-white border-3 border-black p-4 shadow-brutal-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="font-mono text-xs font-bold">{errorToast}</span>
            </div>
            <button
              onClick={dismissError}
              className="p-1 hover:bg-black text-white border border-white"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {!roomState || roomState.state === 'LOBBY' ? (
          <LobbyView
            roomState={roomState}
            socketId={socketId}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onUpdateConfig={updateConfig}
            onStartGame={startGame}
          />
        ) : roomState.state === 'ROLE_SETUP' ? (
          <GodSetupView
            roomState={roomState}
            socketId={socketId}
            onLockIn={godAssignRolesAndWords}
          />
        ) : roomState.state === 'PLAY_ROUNDS' ? (
          <WordSubmissionView
            roomState={roomState}
            socketId={socketId}
            onSubmitWord={submitWord}
          />
        ) : roomState.state === 'DISCUSSION' ? (
          <DiscussionChatView
            roomState={roomState}
            socketId={socketId}
            onSendMessage={sendChatMessage}
          />
        ) : roomState.state === 'VOTING' ? (
          <VotingView
            roomState={roomState}
            socketId={socketId}
            onSubmitVote={submitVote}
          />
        ) : roomState.state === 'TURN_RESULT' ? (
          <ScoreboardView
            roomState={roomState}
            socketId={socketId}
            onNextTurn={nextTurn}
          />
        ) : null}
      </main>

      {/* Brutalist Footer */}
      <footer className="w-full border-t-3 border-black bg-white py-3 px-4 text-center font-mono text-xs font-bold">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <span>INTRUDER // NEUBRUTALIST MULTIPLAYER</span>
          <span className="text-gray-500">AUTHORITATIVE SERVER ARCHITECTURE • WEBSOCKET REAL-TIME</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
