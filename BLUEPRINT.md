# Blueprint

- **Version**: 3.4.8
- **Last Updated**: 2026-06-25
- **Runtime**: Node.js v20+ recommended
- **Framework**: Telegraf v4.16.3

---

## Architecture Overview

Yoru is structured around an event-driven lifecycle:

1. [serialize.js](file:///root/yoru/system/serialize.js) processes updates into a single context `m` containing custom helper methods.
2. [handler.js](file:///root/yoru/system/handler.js) applies guards, updates database states, and delegates matching updates to loaded plugins.

---

## Feature Modules

### Interactive Menu

Interactive controls for browsing available bot commands grouped by category. Supports inline queries, back navigation, and permission checking (e.g. owner commands are hidden unless user is the owner).

### Database Provider

Supports local JSON storage, MongoDB database, and Supabase integration configured dynamically via `.env` flags.

### Interactive Games

Features two multiplayer games:

- **Chess** ([chess.js](file:///root/yoru/plugins/game/chess.js)): A board game utilizing FEN representation, visual board rendering from chessboardimage, and text-based coordinate movements. Supports Multiplayer and Solo Mode vs Bot (AI powered by a minimax search algorithm with piece-value material evaluation). Supports both algebraic notation (e.g. `e4`, `Nf3`, `O-O`) and coordinate formats (e.g. `e2 e4`, `e2e4`, `e2-e4`, `e2, e4`).
- **Tic-Tac-Toe** ([tictactoe.js](file:///root/yoru/plugins/game/tictactoe.js)): An interactive grid game. Supports both Multiplayer (lobby creations/joins) and Solo Mode vs Bot (AI powered by a logical Minimax intelligence decision system). Zero-typing gameplay, live status edits, and forfeit tracking.
