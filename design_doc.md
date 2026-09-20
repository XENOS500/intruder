# UI/UX Design Document: INTRUDER (Neubrutalist Edition)

## 1. Aesthetic Direction & Design Philosophy
* **Style:** Neubrutalism (High saturation, raw contrast, exposed grid/borders, hard shadows, zero gradients, zero soft blur).
* **Inspiration Reference Palette:**
  * Background / Canvas Base: `#FDFBF7` (Warm Off-White Newsprint / Cream)
  * Primary Accent / Highlight Yellow: `#FFEB3B`
  * Danger / Alert / Imposter Accent: `#FF5252`
  * Action / Info Accent Blue: `#2196F3`
  * Success / Citizen Win Accent: `#4CAF50`
  * Warning / Neutral Interactive Orange: `#FF9800`
  * Ink / Border / Structure: `#000000`
* **Core CSS Signatures:**
  * `border: 3px solid #000000;`
  * `box-shadow: 4px 4px 0 #000000;` (Interactive/hover transforms to `translate(-2px, -2px)` with `6px 6px 0 #000000`)
  * `border-radius: 0px;` (Sharp corners everywhere)
  * Typography: Display/Heading in bold sans-serif (`Space Grotesk` / `JetBrains Mono` for codes, timers, and word logs).

---

## 2. Typography & Scale System
* **Display / Room Code:** `JetBrains Mono`, 700/800 weight, uppercase tracking.
* **Headings (H1–H3):** Heavy geometric sans (`Space Grotesk`, 700 weight, uppercase transform with hard black text-shadow `2px 2px 0 #FFEB3B` or plain flat contrast).
* **Body / UI Labels:** `Inter` or system sans, 600 weight for buttons/labels.

---

## 3. View-by-View Layout Specification

### View 1: Landing & Lobby (`LobbyView.tsx`)
* **Layout:** Centered asymmetric bento container (`max-width: 800px`, margin auto).
* **Elements:**
  * Title Banner: Giant brutalist yellow box (`#FFEB3B`) with black text `INTRUDER_V1.0`.
  * Create Room Panel: Single primary action button (`#4CAF50`, black border, hard shadow).
  * Join Room Panel: Brutalist text input (`#FFFFFF`, 3px solid black border) + Join button (`#2196F3`).
  * Roster Grid: List of connected player cards (`3px solid black`, alternating background tints). Shows Host badge (`#FF9800`) and God rotation preview order.

### View 2: Role Setup / God Control Panel (`GodSetupView.tsx`)
* **Visibility Rule:** *Everyone knows who the God is.* God sees the management control deck; Citizens see a waiting/status broadcast ("Waiting for God [GodName] to assign roles & words...").
* **God Controls Layout:**
  * Section A: **Intruder Assignment Selector** — Radio/Card list of all non-God active players. Selected card pops with `#FF5252` fill.
  * Section B: **Word Dispatch Matrix** —
    * Citizen Secret Word input field (`#FFFFFF`).
    * Intruder Hint/Variant Word input field (`#FFFFFF`, labeled "Intruder Alternate Prompt").
  * Section C: **Starter Selector** — Dropdown/pill selector of who starts Round 1.
  * Action Button: `LOCK IN & START ROUND 1` (`#4CAF50`, huge hard shadow).

### View 3: Word Submission HUD (`WordSubmissionView.tsx`)
* **Top Status HUD Bar:**
  * Round counter pill (`ROUND 2/3`)
  * Current God tag (`GOD: @username`, constant visibility)
  * Turn tracker queue banner (`CURRENT SPEAKER: @username` or `YOUR TURN TO SUBMIT!`)
* **Interactive Area:**
  * Secret Prompt Card: Private reminder box shown to user (Citizens see Base Word; Intruder sees Alternate Word; God sees overview). Styled with distinct color border (`#2196F3` for citizen/god, `#FF5252` stealth badge for intruder).
  * Word Input Box: Single-word lowercase text input + `SEND WORD` button. Disabled if it's not user's turn in `turnOrderQueue`.
* **Live Transcript Feed:** Scannable brutalist vertical log showing sequential words submitted per round (`[R1] @alice -> apple`, `[R1] @bob -> fruit`, etc.).

### View 4: Discussion Phase (`DiscussionChatView.tsx`)
* **Layout Split:**
  * Left/Top 70%: Global Chat Feed (Neubrutalist message bubbles: flat white/yellow boxes with black borders, sender prefix).
  * Right/Bottom 30%: High-visibility countdown timer (`JetBrains Mono`, large scale, background shifts to `#FF5252` when $< 15$ seconds remaining).
* **Input Box:** Standard brutalist chat bar + `SEND CHAT`.

### View 5: Voting & Accusation Grid (`VotingView.tsx`)
* **Layout:** Grid of player profile cards (`3px solid black`).
* **Interaction:** Click a player card to target accusation (`border changes to 3px solid #FF5252`, background fills light pink/red `#FFEBEE` or inverted dark). Confirm vote button locks choice.
* **Live Tally Indicator:** Shows vote lock-in progress (`4/6 VOTES LOCKED`).

### View 6: Turn & Game Result Summary (`ScoreboardView.tsx`)
* **Outcome Banner:**
  * Full Red/Black Banner if Intruder Wins ("INTRUDER FOOLED EVERYONE!").
  * Full Green/Black Banner if Citizens Win ("INTRUDER EXPOSED!").
* **Reveal Matrix:** Shows who the Intruder was, what words they submitted, and vote breakdown.
* **Next Turn Action:** `NEXT TURN (ROTATE GOD)` button (visible to host/all per flow).

---

## 4. Component Token & CSS Snippet Library (`styles/brutal.css`)
```css
.brutal-card {
  background-color: #FFFFFF;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.brutal-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px #000000;
}

.brutal-btn-yellow {
  background-color: #FFEB3B;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  font-weight: 700;
  cursor: pointer;
}

.brutal-btn-yellow:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000000;
}

.brutal-btn-green {
  background-color: #4CAF50;
  color: #FFFFFF;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  font-weight: 700;
}

.brutal-btn-red {
  background-color: #FF5252;
  color: #FFFFFF;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  font-weight: 700;
}