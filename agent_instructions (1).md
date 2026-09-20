# Agent Instructions Document: **INTRUDER**

## Role & Mission
You are an autonomous engineering agent building **Intruder**, a real-time web multiplayer game. Adhere strictly to clean architecture, explicit state synchronization via WebSockets, and separation of concerns between God/Intruder/Citizen views.

## Critical Rules for Code Generation
1. **Never Trust Client State for Game Logic:** Validation of whose turn it is, who the God is, whether the vote is valid, and game termination conditions *must* run on the Node.js backend. Client only renders UI state pushed via `roomStateUpdated`.
2. **WebSocket Event Contract Discipline:**
   * Incoming events from client: `createRoom`, `joinRoom`, `configUpdate`, `godAssignIntruder`, `godSubmitWords`, `godSetStarter`, `submitWord`, `sendChatMessage`, `submitVote`, `nextTurn`.
   * Outgoing payload from server: Full or delta `roomState` broadcast via `io.to(roomCode).emit('roomStateUpdate', roomObject)`. Sensitive fields like `intruderSocketId` or the intruder word *must* be scrubbed/filtered or sent only to authorized sockets (God/Intruder privacy boundaries). **Security Rule:** Do *not* leak `intruderSocketId` in public broadcasts to Citizens if secret identification ruins balance; ensure privacy filtering per socket session if required by rules ("all the other players wont know how is the intruder , all will just know who the god is").
3. **Turn Queue Handling:**
   * Maintain `turnOrderQueue` as an ordered array of `socketId`s starting from the God-designated starter, cycling or looping through active players for $R$ rounds.
4. **UI Rendering Rules (React):**
   * Use custom hooks (`useSocket`) for clean event subscription cleanup (`useEffect` return cleanup).
   * Render distinct conditional screens based on `room.state` (`LOBBY`, `ROLE_SETUP`, `WORD_PHASE`, `PLAYING`, `DISCUSSION`, `VOTING`, `RESULTS`).

## Deployment Checklist Validation for Agent
* Confirm `process.env.PORT` is used on Express server.
* Confirm Vite production build outputs to `/dist` and serves cleanly.
* Verify socket connection initializes with `import { io } from 'socket.io-client'; const socket = io(import.meta.env.VITE_BACKEND_URL || window.location.origin);`.