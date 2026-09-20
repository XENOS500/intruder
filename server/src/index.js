import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { RoomManager } from './roomManager.js';
import { getRandomWordPreset, WORD_PRESETS } from './wordPresets.js';
import { startSelfPingService } from './selfPing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
const httpServer = createServer(app);

// CORS configuration to allow local Vite dev, preview, and Vercel domains
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

const roomManager = new RoomManager(io);

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'INTRUDER',
    uptime: process.uptime(),
    activeRooms: roomManager.rooms.size,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/rooms/:roomCode', (req, res) => {
  const room = roomManager.getRoom(req.params.roomCode);
  if (!room) {
    return res.status(404).json({ exists: false, message: 'Room not found' });
  }
  res.json({
    exists: true,
    roomCode: room.roomCode,
    state: room.state,
    playerCount: room.players.length,
  });
});

app.get('/api/presets/random', (req, res) => {
  res.json(getRandomWordPreset());
});

app.get('/api/presets', (req, res) => {
  res.json(WORD_PRESETS);
});

// Socket Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create Room
  socket.on('createRoom', ({ username, config, playerId }, callback) => {
    try {
      const room = roomManager.createRoom(socket.id, username, config, playerId);
      socket.join(room.roomCode);

      const state = roomManager.getSanitizedState(room, socket.id);
      const creator = room.players.find((p) => p.socketId === socket.id);
      if (typeof callback === 'function') {
        callback({ success: true, roomCode: room.roomCode, state, playerId: creator?.playerId });
      }
      socket.emit('roomStateUpdate', state);
      console.log(`[Room Created] Code: ${room.roomCode} by ${username} (${socket.id})`);
    } catch (err) {
      console.error(`[Error createRoom]`, err.message);
      if (typeof callback === 'function') callback({ success: false, error: err.message });
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // Join Room
  socket.on('joinRoom', ({ roomCode, username, playerId }, callback) => {
    try {
      const cleanCode = (roomCode || '').trim().toUpperCase();
      const room = roomManager.joinRoom(cleanCode, socket.id, username, playerId);
      socket.join(room.roomCode);

      const state = roomManager.getSanitizedState(room, socket.id);
      const player = room.players.find((p) => p.socketId === socket.id);
      if (typeof callback === 'function') {
        callback({ success: true, roomCode: room.roomCode, state, playerId: player?.playerId });
      }

      roomManager.broadcastRoomState(room);
      console.log(`[Player Joined/Reconnected] Room: ${cleanCode}, User: ${player?.username || username} (${socket.id})`);
    } catch (err) {
      console.error(`[Error joinRoom]`, err.message);
      if (typeof callback === 'function') callback({ success: false, error: err.message });
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // Leave Room explicitly
  socket.on('leaveRoom', ({ roomCode }) => {
    try {
      roomManager.leaveRoom(roomCode, socket.id);
      socket.leave(roomCode);
    } catch (err) {
      console.error(`[Error leaveRoom]`, err.message);
    }
  });

  // Update Game Config (Host only)
  socket.on('configUpdate', ({ roomCode, config }) => {
    try {
      const room = roomManager.updateConfig(roomCode, socket.id, config);
      roomManager.broadcastRoomState(room);
    } catch (err) {
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // Start Game (Host only -> Transitions to ROLE_SETUP)
  socket.on('startGame', ({ roomCode }) => {
    try {
      const room = roomManager.startGame(roomCode, socket.id);
      roomManager.broadcastRoomState(room);
    } catch (err) {
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // God Assign Roles, Words, and Starter
  socket.on('godAssignRolesAndWords', ({ roomCode, intruderSocketId, citizenWord, intruderWord, starterSocketId }) => {
    try {
      const room = roomManager.godAssignRolesAndWords(roomCode, socket.id, {
        intruderSocketId,
        citizenWord,
        intruderWord,
        starterSocketId,
      });
      roomManager.broadcastRoomState(room);
    } catch (err) {
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // Word Submission
  socket.on('submitWord', ({ roomCode, word }) => {
    try {
      const room = roomManager.submitWord(roomCode, socket.id, word);
      // Only broadcast if not transitioned to discussion (which handles its own broadcast)
      if (room.state === 'PLAY_ROUNDS') {
        roomManager.broadcastRoomState(room);
      }
    } catch (err) {
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // Chat Message
  socket.on('sendChatMessage', ({ roomCode, text }) => {
    try {
      roomManager.sendChatMessage(roomCode, socket.id, text);
    } catch (err) {
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // Vote Submission
  socket.on('submitVote', ({ roomCode, targetSocketId }) => {
    try {
      roomManager.submitVote(roomCode, socket.id, targetSocketId);
    } catch (err) {
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // Next Turn / Rotate God
  socket.on('nextTurn', ({ roomCode }) => {
    try {
      roomManager.nextTurn(roomCode, socket.id);
    } catch (err) {
      socket.emit('errorMessage', { message: err.message });
    }
  });

  // Disconnect
  socket.on('disconnect', (reason) => {
    console.log(`[Socket Disconnected] ID: ${socket.id}, Reason: ${reason}`);
    roomManager.handleDisconnect(socket.id);
  });
});

// Serve frontend static assets if built
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static Serving] Serving client assets from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

httpServer.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` INTRUDER Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`========================================`);

  // Start self-ping keep-alive service for Render free-tier
  startSelfPingService();
});
