export type TurnState = 
  | 'LOBBY'
  | 'ROLE_SETUP'
  | 'PLAY_ROUNDS'
  | 'DISCUSSION'
  | 'VOTING'
  | 'TURN_RESULT';

export type PlayerRole = 'GOD' | 'INTRUDER' | 'CITIZEN';

export interface Player {
  socketId: string;
  playerId?: string;
  username: string;
  isHost: boolean;
  isAlive: boolean;
  connected: boolean;
}

export interface GameConfig {
  roundsPerTurn: number;
  discussionDurationSec: number;
}

export interface SubmittedWord {
  socketId: string;
  username: string;
  round: number;
  word: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  socketId: string;
  username: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface TurnResult {
  winner: 'CITIZENS' | 'INTRUDER';
  winnerLabel: string;
  intruderCaught: boolean;
  intruderSocketId: string;
  intruderUsername: string;
  godUsername: string;
  citizenWord: string;
  intruderWord: string;
  voteCounts: Record<string, number>;
  votes: Record<string, string>;
  tie: boolean;
  mostVotedUsername: string;
}

export interface RoomState {
  roomCode: string;
  config: GameConfig;
  state: TurnState;
  players: Player[];
  godSocketId: string | null;
  godRotationIndex: number;
  intruderSocketId: string | null;
  myRole: PlayerRole;
  myPlayerId?: string | null;
  mySecretWord: string | { citizenWord: string; intruderWord: string } | null;
  currentRound: number;
  turnOrderQueue: Array<{ socketId: string; round: number }>;
  currentSpeakerIndex: number;
  currentSpeakerSocketId: string | null;
  submittedWords: SubmittedWord[];
  discussionSecondsLeft: number;
  votesLockedCount: number;
  eligibleVotersCount: number;
  hasVoted: boolean;
  votes: Record<string, string> | null;
  turnResult: TurnResult | null;
  messages: ChatMessage[];
}
