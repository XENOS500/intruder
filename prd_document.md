# Product Requirements Document (PRD): **INTRUDER**

## 1. Overview & Vision
**Intruder** is a real-time, browser-based online multiplayer social deduction/word association game. Inspired by games like *Undercover* or *Imposter*, one designated player acts as the "God" who secretively orchestrates word assignments, another player is chosen by the God as the "Intruder", and the remaining players are "Citizens". Players give sequential one-word associations, debate via group chat, and vote to eliminate the suspected Intruder.

## 2. Target Audience & Platform
* **Platform:** Web browser (Desktop & Mobile responsive via React).
* **Target Audience:** Casual multiplayer gamers, peer groups/friends joining via room code or link.
* **Tech Stack Alignment:** React (Frontend), Node.js + Express (Backend API/Lobby), WebSockets (`socket.io` or native WS for real-time room sync), Vercel (Frontend Hosting), Render (Backend WebSocket/Node Server Hosting).

## 3. Core Gameplay Loop & Rules
1. **Lobby & Room Creation:**
   * Host creates a room $\rightarrow$ gets a unique 6-character room code / shareable URL.
   * Players join $\rightarrow$ appear in the lobby roster.
   * Host configures game parameters: Number of rounds per turn, discussion timer (seconds), target player count rules.
2. **Turn & Role Assignment:**
   * **God Rotation:** Sequential (Player $1 \rightarrow 2 \rightarrow 3 \dots \text{mod } N$). Each player gets to be God once per full game cycle.
   * **Intruder Selection:** The current **God** manually selects/assigns which player is the **Intruder**. (UI presents a picker list of current players to the God).
   * **Visibility Rule:** Everyone knows *who the God is*. Nobody knows who the Intruder is (not even the Intruder is explicitly told "you are the intruder" with special UI highlighting *who* else is what, though the Intruder receives a different/hint word prompt from the God). *Correction/Refinement per prompt:* God assigns word(s) privately. Regular players get secret word $W$. Intruder gets a distinct/hint word $W'$.
3. **Word Distribution Phase:**
   * God sees a private input screen:
     * Target word for Citizens (or individual prompts).
     * Option for God to type distinct words/hints for regular players vs the Intruder, OR God provides the base word and system/God assigns variant. *Per prompt:* "god will message privately this word to all players but he will not directly give this word to the imposter he has to give a different related word or some other hint". UI lets God type/pick player-specific or role-based prompts, or input the main word and an alternate intruder word.
4. **Sequential Word-Saying Rounds:**
   * God decides who starts Round 1 (selects starting player from roster).
   * Sequential turn order proceeds clockwise/list-order from the starter.
   * Each player submits a 1-word association matching their received prompt.
   * Repeat for `R` rounds (configured by host).
5. **Discussion Phase:**
   * Timed global text chat (`D` seconds configured by host).
6. **Voting Phase:**
   * Simultaneous or sequential voting/accusation. All players vote on who the Intruder is.
   * **Win Condition A:** If all votes point to the wrong person (or majority consensus on wrong person based on room rules; prompt says "if everyone votes out the wrong person then the intruder wins") $\rightarrow$ **Intruder Wins**.
   * **Win Condition B:** If the consensus/votes target the actual Intruder $\rightarrow$ **Intruder Loses, Citizens Win**.
7. **Transition:** Score/outcome summary displayed $\rightarrow$ Next turn rotates God sequence $\rightarrow$ Repeat.