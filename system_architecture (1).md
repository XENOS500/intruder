# System Architecture Document: **INTRUDER**

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (React)                        │
│  - Vite / React SPA                                         │
│  - Socket.io-client                                         │
│  - UI Views: Lobby, God Dashboard, Word Input, Chat, Vote   │
└──────────────────────────────┬──────────────────────────────┘
                               │ WebSocket (WSS) / REST (HTTP/JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js/Express)               │
│  - Express REST API (Room creation, health check)           │
│  - Socket.io Server (Real-time state machine sync)          │
│  - In-Memory Room Store (Map<roomCode, RoomState>) + Timer  │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│     Vercel (FE)       │             │     Render (BE)       │
│ Static Assets / SPA   │             │ Node.js Process + WS  │
└───────────────────────>             <───────────────────────┘
```

### Component Breakdown
1. **Client Tier (React + Vite + Tailwind/CSS):**
   * Manages local connection lifecycle via Socket.io.
   * State machine views driven by server-pushed `roomStateUpdate` payloads.
   * View separation: `LobbyView`, `GodSetupView`, `WordSubmissionView`, `DiscussionChatView`, `VotingView`, `ScoreboardView`.
2. **Server Tier (Node.js + Express + Socket.io):**
   * Maintains active room mapping in RAM (`rooms = new Map()`).
   * Handles room creation (`POST /api/rooms` or socket event `create_room`), user join (`join_room`), god selection (`god_assign_roles`), word dispatch (`god_submit_words`), sequential turns (`submit_word`), phase transitions, timer intervals for discussion/voting.
3. **Deployment Topology:**
   * Frontend deployed to **Vercel** (`https://<app>.vercel.app`). Environment variable `VITE_WS_URL` points to Render backend.
   * Backend deployed as a Web Service on **Render** (`https://<app>.onrender.com`). CORS configured for Vercel origin. Keep-alive ping handled via socket heartbeats.