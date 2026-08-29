<div align="center">
    <h1>YORU</h1>
    <a href="https://github.com/yuurahz/yoru">
        <img src="https://files.catbox.moe/x2iv5t.jpg" alt="Yoru" width="600"/>
    </a>
</div>

<div align="center">

<h3>A Lightweight, Powerful, and Scalable Telegram Bot Framework</h3>

[![Community](https://img.shields.io/badge/Telegram-Community-Blue?style=for-the-badge&logo=telegram)](https://t.me/yoshida_team)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/issues)
[![Stars](https://img.shields.io/github/stars/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/stargazers)
[![Forks](https://img.shields.io/github/forks/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/network/members)

</div>

---

> [!NOTE]
> **Yoru** is a modern, modular Telegram bot framework built on Node.js and [Telegraf](https://telegraf.js.org/). Engineered with clean decoupling, zero-bloat standard library reflexes, and native scrapers for major social media platforms without relying on fragile third-party REST API subscriptions.

---

## ⚡ Key Highlights

- **Decoupled Architecture**: Scraper engines are strictly isolated in `system/scrapers/`, keeping plugin controllers clean, testable, and lean.
- **Built-in Media Downloaders**:
    - **YouTube**: High-quality MP3 (with ID3 tagging) and MP4 downloads powered by local `yt-dlp`.
    - **Spotify**: Track search and direct MP3 downloader (TOTP auth & SpotiDown).
    - **TikTok**: HD video without watermarks, full photo albums, and audio extraction.
    - **Instagram**: Public Reels, posts, and carousel downloader.
    - **Facebook**: HD/SD video and Reels extractor.
    - **MediaFire & Google Drive**: Direct download link generator and file fetcher.
    - **CapCut & Threads**: Direct video and carousel downloader.
    - **Lyrics**: Synced and plain lyrics powered by LRCLIB.
    - **Pinterest**: HD image search and multi-download.
- **Interactive Minimax AI Games**:
    - **Chess**: Minimax AI bot mode & multiplayer with real-time FEN board rendering.
    - **Tic-Tac-Toe**: Minimax AI bot & multiplayer with inline keyboard buttons.
- **Multi-Database Support**: Local JSON, MongoDB, and Supabase (PostgreSQL) selectable with a single `.env` flag.
- **Hot-Reloading Plugins**: Live file watcher that automatically updates plugins in development without server restarts.

---

## 📋 Requirements

### Software

- **NodeJS**: Version `20.x` or higher.
- **yt-dlp**: Installed on system for YouTube extraction (`which yt-dlp`).
- **Git**: For cloning the repository.

### Hardware Recommendation

- **vCPU**: 1 Core
- **RAM**: 512 MB+

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yuurahz/yoru.git

# Navigate into the project directory
cd yoru

# Install dependencies
npm install
```

### 2. Configure Environment

Copy `.env.example` to create your configuration file:

```bash
cp .env.example .env
```

Edit `.env` with your bot credentials:

| Variable         | Description                                                                          | Default / Example |
| :--------------- | :----------------------------------------------------------------------------------- | :---------------- |
| `TOKEN_BOT`      | Unique bot token from [@BotFather](https://t.me/BotFather)                           | `7067266575:...`  |
| `OWNER_ID`       | Telegram User ID for Owner permissions from [@userinfobot](https://t.me/userinfobot) | `5494920186`      |
| `TZ`             | Server timezone                                                                      | `Asia/Jakarta`    |
| `LIMIT`          | Default daily command limit for regular users                                        | `50`              |
| `DATABASE_STATE` | Database provider (`json`, `mongo`, `supabase`)                                      | `json`            |
| `DATABASE_NAME`  | Database filename or MongoDB collection name                                         | `mydb`            |
| `MONGO_URL`      | MongoDB connection URI (if using MongoDB)                                            | `mongodb://...`   |

---

## 🎮 Running the Bot

```bash
# Development Mode (auto-reloads on file changes)
npm run dev

# Production Mode
npm start

# PM2 Background Service
npm run pm2
```

---

## 🧩 Plugin & Scraper Architecture

### 1. Scraper Layer (`system/scrapers/`)

All network scraping logic resides in standalone modules:

```javascript
const { spotify, ytdlp, tiktok } = require("@scrapers");

// Example: Searching Spotify
const tracks = await spotify.search("yoasobi idol");
```

### 2. Plugin Controller Layer (`plugins/`)

Plugins focus solely on user interaction, validation, and sending responses:

```javascript
const { spotify } = require("@scrapers");

module.exports = {
	help: ["spotify", "song"],
	category: "downloader",
	command: /^(spotify|song)$/i,
	desc: "Search & download songs from Spotify.",
	run: async (m, { func }) => {
		if (!m.text) return m.reply("Please provide a track name or URL.");
		const data = await spotify.download(m.text);
		await m.sendMedia(m.chat, data.downloadUrl, { type: "audio" });
	},
	limit: 1,
};
```

---

## 📜 Available Commands (Overview)

| Category             | Commands                                                                                          | Description                               |
| :------------------- | :------------------------------------------------------------------------------------------------ | :---------------------------------------- |
| **Downloader**       | `/play`, `/ytmp3`, `/ytmp4`, `/spotify`, `/tiktok`, `/ig`, `/fb`, `/mf`, `/gd`, `/cc`, `/threads` | Media & music downloaders                 |
| **Internet & Tools** | `/pinterest`, `/meme`, `/yts`, `/lyrics`, `/fetch`                                                | Web search, lyrics, meme, and HTTP client |
| **Games**            | `/chess`, `/tictactoe`                                                                            | Minimax AI & multiplayer games            |
| **Group Admin**      | `/setwelcome`, `/setleft`, `/kick`, `/ban`, `/mute`, `/warn`                                      | Group greeting & moderation               |
| **User & RPG**       | `/register`, `/unregister`, `/profile`, `/levelup`                                                | User registration & RPG levelling         |
| **Owner**            | `>`, `$`, `/enable`, `/disable`, `/setmenu`, `/setmsg`                                            | Hot eval, shell execution, bot controls   |

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo.
2. Create your branch (`git checkout -b feature/AmazingFeature`).
3. Commit changes (`git commit -m 'Add AmazingFeature'`).
4. Push to branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. Free for personal and commercial use.

<div align="center">

_Built with ❤️ for the Telegram community_

</div>
