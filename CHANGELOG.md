# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.8] - 2026-06-26

### Added

- **Captured & Remaining Piece Stats in Chess**: Implemented dynamic calculations of remaining and captured pieces for both sides using unicode piece symbols (`♙`, `♘`, etc. for White; `♟`, `♞`, etc. for Black). Stats are displayed in the board message caption as well as in the interactive `📝 Info` popup callback modal in [chess.js](file:///root/yoru/plugins/game/chess.js).

## [3.4.7] - 2026-06-26

### Added

- **Auto-Cleanup of Board Images**: Integrated message tracking inside [chess.js](file:///root/yoru/plugins/game/chess.js) to store the message ID of the last sent board. It automatically deletes the old board image when a new move is made to keep the Telegram chat clean and prevent clutter.

## [3.4.6] - 2026-06-26

### Added

- **Coordinate Move Parsing in Chess**: Added robust parser to support coordinates like `e2 e4`, `e2e4`, `e2-e4`, or `e2, e4` alongside standard algebraic notation in [chess.js](file:///root/yoru/plugins/game/chess.js).

### Fixed

- **Prefix Parsing Bug**: Fixed `serialize.js` prefix regex default fallback. Instead of defaulting to `"/"` (which marked normal texts as command invocations and blocked prefixless message routing), it now defaults to `null` to correctly run prefixless game turn handlers.
- **Move Exception Handling in Chess**: Fixed case where chess move validation returned `null` instead of throwing an error, bypassing invalid-move warnings.

## [3.4.5] - 2026-06-25

### Added

- **Solo Chess vs Bot (AI)**: Integrated a depth-2 minimax search algorithm with material weighting as the AI logic in [chess.js](file:///root/yoru/plugins/game/chess.js), allowing users to play solo chess matches against the bot.

### Fixed

- **Chess Forfeit Bug**: Corrected undefined property error when calling `m.conn.telegram.deleteMessage` during chess forfeits by switching to the safe `m.delete()` context wrapper in [chess.js](file:///root/yoru/plugins/game/chess.js).

## [3.4.4] - 2026-06-25

### Added

- **Solo Mode vs Bot (AI)**: Added solo player mode to [tictactoe.js](file:///root/yoru/plugins/game/tictactoe.js) utilizing an optimal Minimax decision algorithm that acts as the Bot's logical intelligence system.

## [3.4.3] - 2026-06-25

### Added

- **Tic-Tac-Toe Game Plugin**: Added a new game plugin [tictactoe.js](file:///root/yoru/plugins/game/tictactoe.js) implementing fully interactive Tic-Tac-Toe matches using inline button boards, live turn markers, and forfeit detection.

## [3.4.2] - 2026-06-25

### Added

- **Interactive Inline Buttons Menu**: Added a dynamic, 2-column inline keyboard grid matching categories parsed from dynamic plugins in [menu.js](file:///root/yoru/plugins/menu.js).
- **Back Navigation**: Added `⬅️ Back to Menu` callback actions for seamless nested menu navigation in [menu.js](file:///root/yoru/plugins/menu.js).
- **Owner-only Filtering**: Main menu category listing automatically hides the `owner` category when checked by non-owner users in [menu.js](file:///root/yoru/plugins/menu.js).

### Fixed

- **Menu Variable Hoisting / Scope Bug**: Moved the declaration and initialization of `buttons` in [menu.js](file:///root/yoru/plugins/menu.js) out of conditional blocks to resolve undefined variable references on `/menu all` queries.
- **Message Deletion Bug**: Patched `m.delete` in [serialize.js](file:///root/yoru/system/serialize.js) to automatically unpack message ID if given a message object instead of ID string/number.
- **TypeError on Callback Answer**: Fixed error `TypeError: Cannot read properties of undefined (reading 'catch')` in [handler.js](file:///root/yoru/system/handler.js) by ensuring `m.answer` in [serialize.js](file:///root/yoru/system/serialize.js) returns the promise returned by Telegraf.
- **Type Coercion Smell**: Modified limit checking in [handler.js](file:///root/yoru/system/handler.js) to perform correct type evaluation `typeof plugin.limit === "boolean"` instead of string checking.
