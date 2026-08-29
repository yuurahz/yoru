<div align="center">
    <h1>YORU</h1>
    <a href="https://github.com/yuurahz/yoru">
        <img src="https://files.catbox.moe/x2iv5t.jpg" alt="Yoru" width="600"/>
    </a>
</div>

<div align="center">

<h3>Kerangka Kerja Bot Telegram yang Ringan, Kuat, dan Skalabel</h3>

[![Community](https://img.shields.io/badge/Telegram-Community-Blue?style=for-the-badge&logo=telegram)](https://t.me/yoshida_team)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/issues)
[![Stars](https://img.shields.io/github/stars/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/stargazers)
[![Forks](https://img.shields.io/github/forks/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/network/members)

</div>

---

> [!NOTE]
> **Yoru** adalah kerangka kerja bot Telegram modern dan modular berbasis Node.js dan [Telegraf](https://telegraf.js.org/). Dirancang dengan arsitektur _clean decoupling_, bebas dari dependensi berat/bloatware, serta dilengkapi engine scraper mandiri untuk berbagai platform media sosial tanpa ketergantungan pada langganan REST API luar yang rentan mati.

---

## ⚡ Fitur & Keunggulan Utama

- **Arsitektur Terpisah (Decoupled)**: Logika parsing & scraper diisolasi penuh di [system/scrapers/](file:///root/yoru/system/scrapers), menjaga plugin controller tetap bersih, cepat, dan mudah diuji.
- **Media & Social Downloader Mandiri**:
    - **YouTube**: Download MP3 kualitas tinggi (dengan ID3 thumbnail tagging) dan MP4 menggunakan binary lokal `yt-dlp`.
    - **Spotify**: Pencarian lagu & download MP3 langsung (TOTP Auth + SpotiDown).
    - **TikTok**: Download video HD tanpa watermark, album slide foto, dan audio MP3.
    - **Instagram**: Download video Reels, Post, dan Carousel album publik.
    - **Facebook**: Download video Watch/Reels Facebook kualitas HD/SD.
    - **MediaFire & Google Drive**: Generator direct link dan pengunduh file langsung.
    - **CapCut & Threads**: Pengunduh video template tanpa watermark dan postingan Threads.
    - **Lirik Lagu**: Pencarian lirik tersinkronisasi (LRC) dan teks via LRCLIB.
    - **Pinterest**: Pencarian gambar HD & multi-download.
- **Game Interaktif dengan Minimax AI**:
    - **Catur (Chess)**: Mode solo vs Bot AI Minimax & multiplayer dengan papan visual FEN dinamis.
    - **Tic-Tac-Toe**: Mode solo vs Bot AI Minimax & multiplayer menggunakan tombol keyboard inline.
- **Multi-Database Provider**: Pilihan penyimpanan Local JSON, MongoDB, atau Supabase (PostgreSQL) hanya melalui pengaturan satu baris di `.env`.
- **Hot-Reloading Plugin**: File watcher otomatis memperbarui kode plugin tanpa perlu me-restart proses bot.

---

## 📋 Persyaratan Sistem

### Perangkat Lunak (Software)

- **NodeJS**: Versi `20.x` atau lebih tinggi.
- **yt-dlp**: Terpasang pada server/sistem (`which yt-dlp`).
- **Git**: Untuk mengkloning repositori.

### Rekomendasi Perangkat Keras

- **vCPU**: 1 Core
- **RAM**: 512 MB+

---

## 🚀 Memulai

### 1. Kloning & Instalasi

```bash
# Kloning repositori
git clone https://github.com/yuurahz/yoru.git

# Masuk ke direktori proyek
cd yoru

# Instal semua dependensi
npm install
```

### 2. Konfigurasi Lingkungan (.env)

Salin contoh file `.env`:

```bash
cp .env.example .env
```

Buka file `.env` dan sesuaikan nilainya:

| Variabel         | Deskripsi                                                            | Contoh / Default |
| :--------------- | :------------------------------------------------------------------- | :--------------- |
| `TOKEN_BOT`      | Token unik bot dari [@BotFather](https://t.me/BotFather)             | `7067266575:...` |
| `OWNER_ID`       | ID akun Telegram Owner dari [@userinfobot](https://t.me/userinfobot) | `5494920186`     |
| `TZ`             | Zona waktu server                                                    | `Asia/Jakarta`   |
| `LIMIT`          | Batas limit command harian per user                                  | `50`             |
| `DATABASE_STATE` | Provider database (`json`, `mongo`, `supabase`)                      | `json`           |
| `DATABASE_NAME`  | Nama file database JSON atau nama DB Mongo                           | `mydb`           |
| `MONGO_URL`      | URI koneksi MongoDB (jika menggunakan MongoDB)                       | `mongodb://...`  |

---

## 🎮 Menjalankan Bot

```bash
# Mode Development (auto-reload saat file diubah)
npm run dev

# Mode Produksi Standar
npm start

# Mode Background PM2
npm run pm2
```

---

## 🧩 Arsitektur Plugin & Scraper

### 1. Scraper Layer (`system/scrapers/`)

Seluruh logika scraping & pengambilan data diisolasi ke dalam modul mandiri:

```javascript
const { spotify, ytdlp, tiktok } = require("@scrapers");

// Contoh: Pencarian lagu Spotify
const tracks = await spotify.search("yoasobi idol");
```

### 2. Plugin Controller Layer (`plugins/`)

Plugin murni hanya menangani interaksi pengguna dan pengiriman pesan:

```javascript
const { spotify } = require("@scrapers");

module.exports = {
	help: ["spotify", "song"],
	category: "downloader",
	command: /^(spotify|song)$/i,
	desc: "Cari dan download lagu dari Spotify.",
	run: async (m, { func }) => {
		if (!m.text) return m.reply("Masukkan judul lagu atau URL.");
		const data = await spotify.download(m.text);
		await m.sendMedia(m.chat, data.downloadUrl, { type: "audio" });
	},
	limit: 1,
};
```

---

## 📜 Ringkasan Perintah (Commands)

| Kategori             | Perintah                                                                                          | Deskripsi                                           |
| :------------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------------------------- |
| **Downloader**       | `/play`, `/ytmp3`, `/ytmp4`, `/spotify`, `/tiktok`, `/ig`, `/fb`, `/mf`, `/gd`, `/cc`, `/threads` | Pengunduh media, musik, & video                     |
| **Internet & Tools** | `/pinterest`, `/meme`, `/yts`, `/lyrics`, `/fetch`                                                | Pencarian web, lirik lagu, meme, & HTTP cURL client |
| **Games**            | `/chess`, `/tictactoe`                                                                            | Game catur & tic-tac-toe vs Bot AI / Teman          |
| **Group Admin**      | `/setwelcome`, `/setleft`, `/kick`, `/ban`, `/mute`, `/warn`                                      | Sambutan otomatis & moderasi grup                   |
| **User & RPG**       | `/register`, `/unregister`, `/profile`, `/levelup`                                                | Pendaftaran user & sistem RPG level/limit           |
| **Owner**            | `>`, `$`, `/enable`, `/disable`, `/setmenu`, `/setmsg`                                            | Evaluator runtime, eksekusi terminal, setting bot   |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **Lisensi MIT**. Bebas untuk penggunaan pribadi maupun komersial.

<div align="center">

_Dibuat dengan ❤️ untuk komunitas Telegram_

</div>
