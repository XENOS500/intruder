import { TurnState, PlayerRole, DEFAULT_CONFIG } from './types.js';

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode -> Room
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostSocketId, username, config = {}) {
    const roomCode = this.generateRoomCode();
    const newRoom = {
      roomCode,
      config: {
        roundsPerTurn: Math.min(Math.max(Number(config.roundsPerTurn) || DEFAULT_CONFIG.roundsPerTurn, 1), 5),
        discussionDurationSec: Math.min(Math.max(Number(config.discussionDurationSec) || DEFAULT_CONFIG.discussionDurationSec, 15), 300),
      },
      state: TurnState.LOBBY,
      players: [
        {
          socketId: hostSocketId,
          username: username.trim() || 'Host',
          isHost: true,
          isAlive: true,
          connected: true,
        },
      ],
      godSocketId: null,
      godRotationIndex: 0,
      intruderSocketId: null,
      citizenWord: '',
      intruderWord: '',
      wordAssignments: {},
      currentRound: 1,
      turnOrderQueue: [], // Array<{ socketId, round }>
      currentSpeakerIndex: 0,
      submittedWords: [], // Array<{ socketId, username, round, word, timestamp }>
      discussionTimer: null,
      discussionSecondsLeft: 0,
      votes: {}, // voterSocketId -> targetSocketId
      messages: [
        {
          id: 'sys-0',
          socketId: 'SYSTEM',
          username: 'SYSTEM',
          text: `Room ${roomCode} created! Share the code to invite players.`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
      turnResult: null,
    };

    this.rooms.set(roomCode, newRoom);
    return newRoom;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode?.toUpperCase());
  }

  getRoomBySocketId(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.some((p) => p.socketId === socketId)) {
        return room;
      }
    }
    return null;
  }

  joinRoom(roomCode, socketId, username) {
    const room = this.getRoom(roomCode);
    if (!room) {
      throw new Error('Room not found. Check the room code.');
    }

    const existingPlayer = room.players.find((p) => p.socketId === socketId);
    if (existingPlayer) {
      existingPlayer.connected = true;
      existingPlayer.username = username.trim() || existingPlayer.username;
      return room;
    }

    // Check if player with same name was disconnected (reconnect handling)
    const disconnectedPlayer = room.players.find(
      (p) => !p.connected && p.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (disconnectedPlayer) {
      const oldSocketId = disconnectedPlayer.socketId;
      disconnectedPlayer.socketId = socketId;
      disconnectedPlayer.connected = true;

      // Update references if God or Intruder
      if (room.godSocketId === oldSocketId) room.godSocketId = socketId;
      if (room.intruderSocketId === oldSocketId) room.intruderSocketId = socketId;
      if (room.wordAssignments[oldSocketId]) {
        room.wordAssignments[socketId] = room.wordAssignments[oldSocketId];
        delete room.wordAssignments[oldSocketId];
      }
      room.turnOrderQueue.forEach((t) => {
        if (t.socketId === oldSocketId) t.socketId = socketId;
      });

      this.addSystemMessage(room, `${disconnectedPlayer.username} reconnected.`);
      return room;
    }

    if (room.state !== TurnState.LOBBY) {
      throw new Error('Game is already in progress. Wait for next game.');
    }

    room.players.push({
      socketId,
      username: username.trim() || `Player ${room.players.length + 1}`,
      isHost: false,
      isAlive: true,
      connected: true,
    });

    this.addSystemMessage(room, `${username.trim()} joined the room.`);
    return room;
  }

  updateConfig(roomCode, socketId, newConfig) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    const player = room.players.find((p) => p.socketId === socketId);
    if (!player || !player.isHost) {
      throw new Error('Only the room host can update game settings');
    }

    if (room.state !== TurnState.LOBBY) {
      throw new Error('Settings can only be changed in the lobby');
    }

    if (newConfig.roundsPerTurn !== undefined) {
      room.config.roundsPerTurn = Math.min(Math.max(Number(newConfig.roundsPerTurn) || 2, 1), 5);
    }
    if (newConfig.discussionDurationSec !== undefined) {
      room.config.discussionDurationSec = Math.min(Math.max(Number(newConfig.discussionDurationSec) || 60, 15), 300);
    }

    return room;
  }

  startGame(roomCode, socketId) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    const player = room.players.find((p) => p.socketId === socketId);
    if (!player || !player.isHost) {
      throw new Error('Only the room host can start the game');
    }

    const connectedPlayers = room.players.filter((p) => p.connected);
    if (connectedPlayers.length < 3) {
      throw new Error('At least 3 connected players are required to start INTRUDER (1 God + 1 Intruder + 1 Citizen).');
    }

    this.setupNewTurn(room);
    return room;
  }

  setupNewTurn(room) {
    // Clear timer
    if (room.discussionTimer) {
      clearInterval(room.discussionTimer);
      room.discussionTimer = null;
    }

    const connectedPlayers = room.players.filter((p) => p.connected);
    const godIndex = room.godRotationIndex % connectedPlayers.length;
    const godPlayer = connectedPlayers[godIndex];

    room.godSocketId = godPlayer.socketId;
    room.state = TurnState.ROLE_SETUP;
    room.intruderSocketId = null;
    room.citizenWord = '';
    room.intruderWord = '';
    room.wordAssignments = {};
    room.turnOrderQueue = [];
    room.currentSpeakerIndex = 0;
    room.currentRound = 1;
    room.submittedWords = [];
    room.votes = {};
    room.turnResult = null;

    this.addSystemMessage(room, `Turn started! ${godPlayer.username} is the GOD for this turn.`);
  }

  godAssignRolesAndWords(roomCode, godSocketId, { intruderSocketId, citizenWord, intruderWord, starterSocketId }) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    if (room.state !== TurnState.ROLE_SETUP) {
      throw new Error('Game is not in role setup phase');
    }

    if (room.godSocketId !== godSocketId) {
      throw new Error('Only the current God can assign roles and words');
    }

    const targetIntruder = room.players.find((p) => p.socketId === intruderSocketId && p.connected);
    if (!targetIntruder) {
      throw new Error('Selected Intruder is invalid or disconnected');
    }

    if (intruderSocketId === godSocketId) {
      throw new Error('God cannot be the Intruder');
    }

    if (!citizenWord || !citizenWord.trim()) {
      throw new Error('Please provide a valid Secret Word for Citizens');
    }

    if (!intruderWord || !intruderWord.trim()) {
      throw new Error('Please provide a valid Alternate Word/Hint for the Intruder');
    }

    const cleanCitizenWord = citizenWord.trim();
    const cleanIntruderWord = intruderWord.trim();

    room.intruderSocketId = intruderSocketId;
    room.citizenWord = cleanCitizenWord;
    room.intruderWord = cleanIntruderWord;

    // Distribute words secretly
    room.wordAssignments = {};
    for (const p of room.players) {
      if (p.socketId === godSocketId) {
        continue; // God does not guess
      } else if (p.socketId === intruderSocketId) {
        room.wordAssignments[p.socketId] = cleanIntruderWord;
      } else {
        room.wordAssignments[p.socketId] = cleanCitizenWord;
      }
    }

    // Determine starter and build turn queue
    const nonGodPlayers = room.players.filter((p) => p.socketId !== godSocketId && p.connected);
    let startIdx = nonGodPlayers.findIndex((p) => p.socketId === starterSocketId);
    if (startIdx === -1) {
      startIdx = 0;
    }

    // Reorder non-god players starting from chosen starter
    const orderedSpeakers = [
      ...nonGodPlayers.slice(startIdx),
      ...nonGodPlayers.slice(0, startIdx),
    ];

    // Generate turnOrderQueue for roundsPerTurn
    room.turnOrderQueue = [];
    for (let r = 1; r <= room.config.roundsPerTurn; r++) {
      for (const speaker of orderedSpeakers) {
        room.turnOrderQueue.push({
          socketId: speaker.socketId,
          round: r,
        });
      }
    }

    room.currentSpeakerIndex = 0;
    room.currentRound = 1;
    room.state = TurnState.PLAY_ROUNDS;

    const firstSpeaker = room.players.find((p) => p.socketId === room.turnOrderQueue[0]?.socketId);
    this.addSystemMessage(room, `Roles & words locked by God! Round 1 begins. ${firstSpeaker ? firstSpeaker.username : 'First player'} speaks first.`);

    return room;
  }

  submitWord(roomCode, socketId, rawWord) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    if (room.state !== TurnState.PLAY_ROUNDS) {
      throw new Error('Not currently in word submission phase');
    }

    const currentTurn = room.turnOrderQueue[room.currentSpeakerIndex];
    if (!currentTurn || currentTurn.socketId !== socketId) {
      throw new Error("It is not your turn to submit a word");
    }

    const cleanWord = (rawWord || '').trim();
    if (!cleanWord) {
      throw new Error('Word cannot be empty');
    }

    const player = room.players.find((p) => p.socketId === socketId);
    const username = player ? player.username : 'Unknown';

    room.submittedWords.push({
      socketId,
      username,
      round: currentTurn.round,
      word: cleanWord,
      timestamp: Date.now(),
    });

    this.addSystemMessage(room, `[R${currentTurn.round}] ${username}: "${cleanWord}"`);

    room.currentSpeakerIndex++;

    // Check if more turns in queue
    if (room.currentSpeakerIndex < room.turnOrderQueue.length) {
      room.currentRound = room.turnOrderQueue[room.currentSpeakerIndex].round;
    } else {
      // All rounds complete -> Transition to Discussion
      this.startDiscussion(room);
    }

    return room;
  }

  startDiscussion(room) {
    if (room.discussionTimer) {
      clearInterval(room.discussionTimer);
      room.discussionTimer = null;
    }

    room.state = TurnState.DISCUSSION;
    room.discussionSecondsLeft = room.config.discussionDurationSec;

    this.addSystemMessage(room, `All rounds complete! Discussion phase started (${room.discussionSecondsLeft}s). Debate who the intruder is!`);

    // Broadcast update immediately
    this.broadcastRoomState(room);

    // Start timer interval
    room.discussionTimer = setInterval(() => {
      room.discussionSecondsLeft--;

      if (room.discussionSecondsLeft <= 0) {
        clearInterval(room.discussionTimer);
        room.discussionTimer = null;
        this.startVoting(room);
      } else {
        // Emit timer tick
        this.io.to(room.roomCode).emit('timerTick', { secondsLeft: room.discussionSecondsLeft });
      }
    }, 1000);
  }

  startVoting(room) {
    if (room.discussionTimer) {
      clearInterval(room.discussionTimer);
      room.discussionTimer = null;
    }

    room.state = TurnState.VOTING;
    room.votes = {};

    this.addSystemMessage(room, `Discussion ended! Accusation phase started. Cast your vote for the Intruder!`);
    this.broadcastRoomState(room);
  }

  submitVote(roomCode, voterSocketId, targetSocketId) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    if (room.state !== TurnState.VOTING) {
      throw new Error('Game is not in voting phase');
    }

    if (voterSocketId === room.godSocketId) {
      throw new Error('God oversees the vote and does not cast an accusation');
    }

    const voter = room.players.find((p) => p.socketId === voterSocketId && p.connected);
    if (!voter) throw new Error('Voter not found or disconnected');

    const target = room.players.find((p) => p.socketId === targetSocketId && p.connected);
    if (!target) throw new Error('Target player not found or disconnected');

    if (targetSocketId === room.godSocketId) {
      throw new Error('You cannot vote for the God');
    }

    room.votes[voterSocketId] = targetSocketId;

    // Check if all eligible voters have voted
    const eligibleVoters = room.players.filter((p) => p.connected && p.socketId !== room.godSocketId);
    const totalVotes = Object.keys(room.votes).length;

    if (totalVotes >= eligibleVoters.length) {
      this.resolveTurnResult(room);
    } else {
      this.broadcastRoomState(room);
    }

    return room;
  }

  resolveTurnResult(room) {
    room.state = TurnState.TURN_RESULT;

    const voteCounts = {};
    room.players.forEach((p) => {
      if (p.socketId !== room.godSocketId) {
        voteCounts[p.socketId] = 0;
      }
    });

    for (const targetId of Object.values(room.votes)) {
      if (voteCounts[targetId] !== undefined) {
        voteCounts[targetId]++;
      }
    }

    // Determine highest vote
    let maxVotes = -1;
    let mostVotedCandidates = [];

    for (const [candidateId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedCandidates = [candidateId];
      } else if (count === maxVotes && count > 0) {
        mostVotedCandidates.push(candidateId);
      }
    }

    const intruderCaught = mostVotedCandidates.length === 1 && mostVotedCandidates[0] === room.intruderSocketId;
    const winner = intruderCaught ? 'CITIZENS' : 'INTRUDER';

    const intruderPlayer = room.players.find((p) => p.socketId === room.intruderSocketId);
    const godPlayer = room.players.find((p) => p.socketId === room.godSocketId);
    const mostVotedPlayer = mostVotedCandidates.length === 1 ? room.players.find((p) => p.socketId === mostVotedCandidates[0]) : null;

    room.turnResult = {
      winner,
      winnerLabel: winner === 'CITIZENS' ? 'CITIZENS WIN! INTRUDER EXPOSED!' : 'INTRUDER FOOLED EVERYONE! INTRUDER WINS!',
      intruderCaught,
      intruderSocketId: room.intruderSocketId,
      intruderUsername: intruderPlayer ? intruderPlayer.username : 'Unknown',
      godUsername: godPlayer ? godPlayer.username : 'Unknown',
      citizenWord: room.citizenWord,
      intruderWord: room.intruderWord,
      voteCounts,
      votes: room.votes,
      tie: mostVotedCandidates.length > 1,
      mostVotedUsername: mostVotedPlayer ? mostVotedPlayer.username : 'Tied / No consensus',
    };

    this.addSystemMessage(
      room,
      `Result: ${room.turnResult.winnerLabel} Intruder was @${room.turnResult.intruderUsername}. Words: Citizen "${room.citizenWord}" vs Intruder "${room.intruderWord}".`
    );

    this.broadcastRoomState(room);
  }

  nextTurn(roomCode, socketId) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    if (room.state !== TurnState.TURN_RESULT) {
      throw new Error('Cannot rotate turn before results are finalized');
    }

    const player = room.players.find((p) => p.socketId === socketId);
    if (!player || (!player.isHost && socketId !== room.godSocketId)) {
      throw new Error('Only the Host or current God can proceed to the next turn');
    }

    // Increment God rotation
    room.godRotationIndex++;
    this.setupNewTurn(room);
    this.broadcastRoomState(room);
    return room;
  }

  sendChatMessage(roomCode, socketId, text) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');

    const player = room.players.find((p) => p.socketId === socketId);
    if (!player) throw new Error('Player not in room');

    const cleanText = (text || '').trim();
    if (!cleanText) return room;

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      socketId,
      username: player.username,
      text: cleanText,
      timestamp: Date.now(),
      isSystem: false,
    };

    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages.shift();
    }

    this.io.to(room.roomCode).emit('chatMessage', message);
    return room;
  }

  addSystemMessage(room, text) {
    const message = {
      id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      socketId: 'SYSTEM',
      username: 'SYSTEM',
      text,
      timestamp: Date.now(),
      isSystem: true,
    };
    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages.shift();
    }
    this.io.to(room.roomCode).emit('chatMessage', message);
  }

  handleDisconnect(socketId) {
    const room = this.getRoomBySocketId(socketId);
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socketId);
    if (player) {
      player.connected = false;
      this.addSystemMessage(room, `${player.username} disconnected.`);

      // If host disconnected, reassign host
      if (player.isHost) {
        const nextHost = room.players.find((p) => p.connected);
        if (nextHost) {
          player.isHost = false;
          nextHost.isHost = true;
          this.addSystemMessage(room, `${nextHost.username} is now the room host.`);
        }
      }

      // Check if speaker in play rounds disconnected
      if (room.state === TurnState.PLAY_ROUNDS) {
        const currentTurn = room.turnOrderQueue[room.currentSpeakerIndex];
        if (currentTurn && currentTurn.socketId === socketId) {
          // Auto advance turn
          this.addSystemMessage(room, `Current speaker disconnected. Advancing turn.`);
          room.currentSpeakerIndex++;
          if (room.currentSpeakerIndex < room.turnOrderQueue.length) {
            room.currentRound = room.turnOrderQueue[room.currentSpeakerIndex].round;
          } else {
            this.startDiscussion(room);
            return;
          }
        }
      }

      // Check if in voting and all remaining have voted
      if (room.state === TurnState.VOTING) {
        const eligibleVoters = room.players.filter((p) => p.connected && p.socketId !== room.godSocketId);
        const totalVotes = Object.keys(room.votes).filter((vId) =>
          room.players.some((p) => p.socketId === vId && p.connected)
        ).length;
        if (eligibleVoters.length > 0 && totalVotes >= eligibleVoters.length) {
          this.resolveTurnResult(room);
          return;
        }
      }

      // If all players left, clean up after 5 minutes
      const anyConnected = room.players.some((p) => p.connected);
      if (!anyConnected) {
        if (room.discussionTimer) clearInterval(room.discussionTimer);
        setTimeout(() => {
          const checkRoom = this.rooms.get(room.roomCode);
          if (checkRoom && !checkRoom.players.some((p) => p.connected)) {
            this.rooms.delete(room.roomCode);
          }
        }, 300000);
      } else {
        this.broadcastRoomState(room);
      }
    }
  }

  getSanitizedState(room, socketId) {
    const isGod = socketId === room.godSocketId;
    const isIntruder = socketId === room.intruderSocketId;
    const isGameOver = room.state === TurnState.TURN_RESULT;

    let myRole = PlayerRole.CITIZEN;
    if (isGod) myRole = PlayerRole.GOD;
    else if (isIntruder) myRole = PlayerRole.INTRUDER;

    let mySecretWord = null;
    if (isGod) {
      mySecretWord = {
        citizenWord: room.citizenWord,
        intruderWord: room.intruderWord,
      };
    } else if (room.wordAssignments && room.wordAssignments[socketId]) {
      mySecretWord = room.wordAssignments[socketId];
    }

    const currentTurn = room.turnOrderQueue[room.currentSpeakerIndex];

    const eligibleVotersCount = room.players.filter(
      (p) => p.connected && p.socketId !== room.godSocketId
    ).length;

    return {
      roomCode: room.roomCode,
      config: room.config,
      state: room.state,
      players: room.players.map((p) => ({
        socketId: p.socketId,
        username: p.username,
        isHost: p.isHost,
        isAlive: p.isAlive,
        connected: p.connected,
      })),
      godSocketId: room.godSocketId,
      godRotationIndex: room.godRotationIndex,
      // PRIVACY BOUNDARY: Reveal intruder socketId ONLY if God or if turn is finished
      intruderSocketId: isGod || isGameOver ? room.intruderSocketId : null,
      myRole,
      mySecretWord,
      currentRound: room.currentRound,
      turnOrderQueue: room.turnOrderQueue,
      currentSpeakerIndex: room.currentSpeakerIndex,
      currentSpeakerSocketId: currentTurn ? currentTurn.socketId : null,
      submittedWords: room.submittedWords,
      discussionSecondsLeft: room.discussionSecondsLeft,
      votesLockedCount: Object.keys(room.votes).length,
      eligibleVotersCount,
      hasVoted: !!room.votes[socketId],
      // PRIVACY BOUNDARY: Votes revealed ONLY on results
      votes: isGameOver ? room.votes : null,
      turnResult: isGameOver ? room.turnResult : null,
      messages: room.messages,
    };
  }

  broadcastRoomState(room) {
    for (const player of room.players) {
      if (player.connected) {
        const sanitized = this.getSanitizedState(room, player.socketId);
        this.io.to(player.socketId).emit('roomStateUpdate', sanitized);
      }
    }
  }
}
