# Blueprint

- **Version**: 3.5.0
- **Last Updated**: 2026-08-29
- **Runtime**: Node.js v20+ recommended
- **Framework**: Telegraf v4.16.3

---

## Architecture Overview

Yoru is structured around a decoupled, event-driven lifecycle:

1. **[serialize.js](file:///root/yoru/system/serialize.js)**: Processes raw Telegram updates into a single lightweight context `m` containing custom helper methods.
2. **[handler.js](file:///root/yoru/system/handler.js)**: Applies guards, updates database states, handles levelling/RPG XP, and delegates matching updates to loaded plugins.
3. **[plugins/](file:///root/yoru/plugins)**: Thin command controllers responsible for input validation, user permissions, and Telegram messaging.
4. **[system/scrapers/](file:///root/yoru/system/scrapers)**: Dedicated, standalone scraper layer powering all downloaders and search tools without hardcoding parsing logic inside plugins.

---

## Feature Modules

### Decoupled Scrapers & Downloaders

- **YouTube (`ytdlp.js`)**: Direct extraction via local `yt-dlp` binary with `web_embedded` client.
- **Spotify (`spotify.js`)**: Spotify TOTP Authentication & SpotiDown MP3 downloader.
- **TikTok (`tiktok.js`)**: TikWM client for HD videos, image slides, and audio tagging.
- **Facebook (`facebook.js`)**: Public Reels & HD/SD Video extractor.
- **Instagram (`instagram.js`)**: Relay & Embed parser for public posts, reels, and stories.
- **MediaFire & GDrive (`mediafire.js`, `gdrive.js`)**: Direct download link extractors.
- **CapCut & Threads (`capcut.js`, `threads.js`)**: No-watermark video extractors.
- **Pinterest & Lahelu (`pinterest.js`, `lahelu.js`)**: Native HD image & meme scrapers.
- **Lyrics (`lyrics.js`)**: Synchronized and plain lyrics fetcher from LRCLIB.

### Interactive Games

- **Chess** ([chess.js](file:///root/yoru/plugins/game/chess.js)): Multiplayer & Solo Mode vs Bot (AI powered by a minimax search algorithm with piece-value material evaluation). Supports algebraic and coordinate notations.
- **Tic-Tac-Toe** ([tictactoe.js](file:///root/yoru/plugins/game/tictactoe.js)): Multiplayer & Solo Mode vs Bot (AI powered by Minimax algorithm). Zero-typing gameplay with live status edits.

### Database Providers

Supports local JSON storage, MongoDB, and Supabase integration configured dynamically via `.env` flags.
