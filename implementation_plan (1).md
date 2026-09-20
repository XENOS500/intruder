# Implementation Plan Document: **INTRUDER**

## Phase 1: Project Scaffolding & Monorepo/Folder Structure
* [ ] Initialize project root with `/server` (Node/Express/Socket.io) and `/client` (React/Vite).
* [ ] Configure TypeScript/ESLint across both directories.
* [ ] Setup Tailwind CSS in `/client`.

## Phase 2: Core Backend Room & State Machine Logic
* [ ] Implement room code generator (6-char alphanumeric).
* [ ] Implement in-memory store and basic socket handlers (`connect`, `disconnect`, `create_room`, `join_room`).
* [ ] Implement sequential God rotation calculation logic: `godIndex = (currentCycle % playerList.length)`.
* [ ] Implement role selection state (`God` selects `Intruder` socketId).
* [ ] Implement word dispatch logic (God pushes citizen word + intruder variant).

## Phase 3: Turn & Round Management Backend
* [ ] Implement round progression and starter-selector event (`god_set_starter`).
* [ ] Implement sequential word turn validation (`submit_word` checks if it's player's turn in `turnOrderQueue`).
* [ ] Implement transition triggers: Round completion $\rightarrow$ Discussion timer start $\rightarrow$ Voting phase.
* [ ] Implement vote tallying and win/loss resolution rules ("all vote wrong -> intruder wins", "all vote intruder -> intruder loses").

## Phase 4: Frontend UI & View State Mapping
* [ ] Build Landing / Create-Join Lobby UI.
* [ ] Build Waiting Room / Roster roster list showing Host, God badge preview or current rotation.
* [ ] Build God Control Panel (pick Intruder from dropdown/list; input words for citizens vs intruder).
* [ ] Build Word Submission HUD (active player highlight, input box, live transcript history).
* [ ] Build Discussion Chat Box + Countdown timer widget.
* [ ] Build Voting Grid / Accusation ballots + Result summary screen.

## Phase 5: Integration, Polishing & Edge Cases
* [ ] Handle mid-game player disconnects (auto-skip turn or fallback grace).
* [ ] Add sound/toast feedback for turn change.
* [ ] Test multi-tab local socket synchronization.

## Phase 6: Deployment Pipeline
* [ ] Configure Render web service build command (`npm install && npm run build`), start command (`npm run start`).
* [ ] Configure Vercel build settings (`npm run build`, output `dist`), inject `VITE_BACKEND_URL`.
* [ ] Verify CORS, WSS secure upgrade, and end-to-end room creation cross-domain.