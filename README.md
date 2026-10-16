# PokerTab ♠️ — Real-Time Multiplayer Texas Hold'em & Team Settlement Ledger

PokerTab is a real-time multiplayer Texas Hold'em poker web application engineered with a server-authoritative state machine, custom room creation, team-based pooled bankrolls, live buy-in accounting, and deterministic 7-card hand evaluation.

---

## 🎨 Design System & Anti-Slop Discipline

Engineered under `@ui-ux-pro-max` and `@taste-skill` specifications:
- **Design Read**: High-stakes private tabletop cardroom fused with a high-frequency trading ledger.
- **Dial Calibration**:
  - `DESIGN_VARIANCE: 7/10` (Asymmetric HUD cockpit, spatial radial seating, bespoke telemetry cards)
  - `MOTION_INTENSITY: 8/10` (Physics spring transitions for card flips, chips, and victory highlights)
  - `VISUAL_DENSITY: 7/10` (Cockpit-dense telemetry for chip stacks, pot odds, timers, and bankrolls)
- **Zero-Tolerance Anti-Slop Enforcement**:
  - Deep obsidian base (`#0A0B0E`), brushed slate surfaces (`#12151C`), matte baize felt (`#0F291E`) with radial vignette and `1px` champagne gold inlay border (`#C5A059`).
  - No generic `from-purple-600 to-indigo-600` AI gradients or harsh neon borders.
  - Paired `Outfit` geometric display font with strict `JetBrains Mono` (`tabular-nums`) for all chip stacks, timers, and pot metrics.
  - Tactile micro-interactions (`active:scale-[0.97]` under 160ms) and multi-layer ambient elevation.

---

## 🚀 Key Features

### 1. Room Creation & Host Controls
- **6-Character Room Codes** (e.g. `7K2M9X`) for instant room creation and sharing.
- **Host Configuration**: Starting stack (1k, 2k, 5k, 10k), Small/Big Blinds (5/10, 10/20, 25/50, 50/100), turn timer limits (15s, 20s, 30s), and "Big Time" Time Bank reserve (+30s, +45s, +60s).
- **Interactive Radial Table**: 6-max or 9-max radial seats with "Sit Here" pods and click-to-play seat assignment.

### 2. Team Mode Mechanics
- **Team Affiliations**: **Team Alpha** (Imperial Gold), **Team Omega** (Cobalt Ice), and **Team Sigma** (Titanium Amethyst).
- **Shared Team Bankroll Telemetry**: Live HUD tracking pooled team chips, net P&L, and team roster.
- **Teammate Sweat Mode**: Folded teammates can ghost-view active teammates' hole cards for strategic sweating.
- **Team Private Comms**: Dedicated Socket.io channel for team-only tactical messaging alongside general table chat and quick emote reactions.

### 3. Server-Authoritative Poker Engine
- **Accurate Blinds Rotation**: Dealer puck (`D`), SB, and BB chip placement with clockwise rotation.
- **Heads-Up (2-Player) Blind Rules**: Dealer posts SB and acts first pre-flop; BB acts first post-flop.
- **Street Progression**: `WAITING` → `PRE_FLOP` → `FLOP` → `TURN` → `RIVER` → `SHOWDOWN` → `HAND_CLEANUP`.
- **Side Pot & All-In Calculator**: Accurately computes Main Pot and multiple Side Pots when short-stacked players go all-in.
- **"Big Time" Time Bank**: Active player can burn their reserve (+30s) during high-pressure decisions, triggering acoustic pulse and SVG progress ring expansion.
- **Deterministic 7-Card Hand Evaluator**: Ranks Royal Flush down to High Card with exact kicker tie-breaking and winning 5-card highlights.

### 4. "Poker Tab" Live Accounting Drawer
- Real-time buy-in and rebuy tracking per player.
- Net profit and loss (P&L) telemetry.
- **Min-Transaction Debt Settlement Algorithm**: Automatically resolves who owes whom at the end of the session.

### 5. Procedural Web Audio Engine
- Built-in zero-dependency Web Audio API synthesizer for tactile chip clicks, card dealing swishes, turn ticks, "Big Time" gong, and victory fanfares.

---

## 🛠️ Quick Start

### 1. Start Server & Client
```bash
# Start unified production server (serves frontend + Socket.io on port 3001)
npm start
```

Or run development mode with live watch:
```bash
# Terminal 1: Backend Server
npm run server

# Terminal 2: Vite Client
npm run client
```

### 2. Open Application
Navigate to `http://localhost:3001` (or `http://localhost:5173` in Vite dev mode).
