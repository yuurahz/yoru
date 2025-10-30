<div align="center">
    <h1>YORU</h1>
    <a href="https://github.com/yuurahz/yoru">
        <img src="https://files.catbox.moe/obrip8.jpg" alt="Yoru"/>
    </a>
</div>

<div align="center">

<h3>Bot Telegram yang Ringan, Kuat, dan Skalabel</h3>

[![Community](https://img.shields.io/badge/Telegram-Community-Blue?style=for-the-badge&logo=telegram)](https://t.me/yoshida_team)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/issues)
[![Stars](https://img.shields.io/github/stars/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/stargazers)
[![Forks](https://img.shields.io/github/forks/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/network/members)

</div>

---

> [!NOTE]
> **Yoru** adalah kerangka kerja bot Telegram modern yang dirancang untuk pengembang yang membutuhkan fondasi yang kuat untuk membangun bot yang kaya fitur. Baik Anda membuat bot utilitas sederhana atau platform multi-layanan yang kompleks, Yoru menyediakan arsitektur dan alat untuk menskala secara efisien dan dioptimalkan untuk kinerja yang ringan.

---

## Daftar Isi

- [Mengapa Memilih Yoru?](#why-choose-yoru)
- [Persyaratan](#requirements)
- [Memulai](#getting-started)
- [Konfigurasi](#configuration)
- [Menjalankan Bot](#️running-the-bot)
- [Instalasi via Docker](#installation-via-docker)
- [Pengembangan Plugin](#plugin-development)
- [Konfigurasi PM2](#pm2-configuration)
- [Berkontribusi](#contributing)
- [Penyelesaian Masalah (Troubleshooting)](#troubleshooting)
- [Lisensi](#license)

---

## Mengapa Memilih Yoru?

- **Gratis & Sumber Terbuka:** Sepenuhnya gratis untuk penggunaan pribadi dan komersial di bawah Lisensi MIT.
- **Arsitektur Modular:** Perluas fungsionalitas dengan mudah menggunakan sistem plugin yang sederhana (plug-and-play).
- **Cepat & Stabil:** Didukung oleh [Telegraf](https://telegraf.js.org/), salah satu pustaka bot Telegram paling populer dan andal.
- **Penyimpanan Hibrida:** Pilih antara penyimpanan berbasis file JSON sederhana atau database MongoDB yang kuat untuk skalabilitas.
- **Peta Jalan Aktif (Active Roadmap):**
    - [x] **Penanganan Kesalahan yang Kuat (Robust Error Handling):** Sistem yang lebih tangguh untuk menangani kesalahan dengan anggun dan menjaga koneksi tetap stabil.
    - [ ] **Penyebaran yang Mudah (Easy Deployment):** Proses yang disederhanakan untuk hosting di berbagai platform.

---

## Persyaratan

### Perangkat Lunak (Software)

- **NodeJS:** Versi `16.x` atau lebih tinggi. (Direkomendasikan `20.x`)
- **Git:** Untuk mengkloning repositori.

### Perangkat Keras (Minimum Rekomendasi)

- **vCPU:** 1 Core
- **RAM:** 500 MB

### Layanan yang Direkomendasikan

- **Hosting:** [Hostdata (NAT VPS)](https://hostdata.id/nat-vps-usa/), [Optiklink](https://optiklink.com/), [VPS](https://www.orangevps.com/), [RDPWin](https://www.rdpwin.com/rdpbot.php)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) untuk database cloud gratis.

---

## Memulai

### 1. Kloning & Instalasi

```bash
# Kloning repositori
git clone https://github.com/yuurahz/yoru.git

# Masuk ke direktori proyek
cd yoru

# Instal semua dependensi yang diperlukan
npm install
```

### 2. Konfigurasi Lingkungan

Salin contoh file `.env` untuk membuat file konfigurasi Anda sendiri.

```bash
cp .env.example .env
```

Selanjutnya, buka file `.env` dan sesuaikan nilainya sesuai kebutuhan.

---

## Konfigurasi

Edit file `.env` yang baru saja Anda buat:

| Variabel         | Deskripsi                                                      | Contoh Nilai   |
| :--------------- | :------------------------------------------------------------- | :------------- |
| `TOKEN_BOT`      | Token bot unik Anda dari [@BotFather](https://t.me/BotFather). | -              |
| `OWNER_ID`       | ID akun yang akan digunakan sebagai pemilik (owner).           | -              |
| `TZ`             | Zona waktu lokal server Anda.                                  | `Asia/Jakarta` |
| `LIMIT`          | Batas penggunaan perintah harian per pengguna.                 | `50`           |
| `DATABASE_STATE` | Pilih `json` untuk file lokal atau `mongodb` untuk database.   | `json`         |
| `DATABASE_NAME`  | Nama database Anda (untuk MongoDB).                            | `yoru_db`      |
| `MONGO_URL`      | String koneksi MongoDB Anda (jika menggunakan `mongodb`).      | -              |

---

## Menjalankan Bot

Anda dapat menjalankan bot dalam beberapa mode berbeda:

- **Mode Produksi:**
    ```bash
    npm start
    ```
- **Mode Pengembangan (dengan pemuatan ulang otomatis saat ada perubahan file):**
    ```bash
    npm run dev
    ```
- **Menggunakan PM2 (untuk menjaga bot tetap online):**
    ```bash
    npm run pm2
    ```

---

## Instalasi via Docker

Untuk pengaturan yang mudah dan terisolasi, Anda dapat menggunakan Docker.

```bash
# Perbarui paket dan instal dependensi
sudo apt update -y && sudo apt install curl git -y

# Instal Docker
curl -fsSL https://get.docker.com | bash

# Kloning repositori
git clone https://github.com/yuurahz/yoru

# Masuk ke direktori
cd yoru

# (PENTING) Buat dan edit file .env Anda sebelum membangun image
# cp .env.example .env
# nano .env

# Bangun image Docker
docker build -t yoru-bot .

# Jalankan kontainer dalam mode terlepas (detached) dan atur agar selalu restart
docker run -d --name yoru --restart always yoru-bot

# Lihat log bot secara real-time
docker logs -f yoru
```

Untuk menghentikan kontainer:

```bash
docker stop yoru
```

---

## Pengembangan Plugin

Yoru menggunakan sistem plugin yang fleksibel dan mudah diperluas.

#### Contoh Plugin Dasar

Ini adalah plugin `ping` sederhana untuk memeriksa latensi bot.

```javascript
// file: plugins/tools/ping.js
module.exports = {
	// Metadata Plugin
	help: ["ping"],
	category: "tools",
	command: "ping",

	// Logika utama plugin
	run: async (m, { client }) => {
		const start = Date.now();
		const msg = await m.reply("Pinging...");
		const latency = Date.now() - start;

		await client.telegram.editMessageText(
			m.chat,
			msg.message_id,
			null,
			`🏓 Pong!\n*Latensi:* ${latency} ms`,
			{ parse_mode: "Markdown" }
		);
	},

	// Izin dan properti Plugin
	group: true, // Berfungsi di grup
	admin: false, // Tidak memerlukan admin
	limit: 1, // Mengkonsumsi 1 batas penggunaan (bisa berupa Angka atau Boolean)
	premium: false, // Bukan hanya untuk premium
	botAdmin: false, // Bot tidak perlu menjadi admin
	owner: false, // Bukan hanya untuk pemilik
};
```

#### Contoh Penangan Acara (Event Handler)

Plugin juga dapat merespons acara (events) alih-alih perintah, seperti membalas pesan tertentu.

```javascript
// file: plugins/events/auto-reply.js
module.exports = {
	// Fungsi 'before' berjalan di setiap pesan masuk
	before: async (m, { client }) => {
		if (m.body?.toLowerCase().includes("hello yoru")) {
			await m.reply("👋 Halo!");
		}

		// Selalu kembalikan nilai boolean
		return true;
	},
};
```

---

## Konfigurasi PM2

Jika Anda menjalankan bot menggunakan `npm run pm2`, Anda dapat menyesuaikan konfigurasinya di file `ecosystem.config.js`.

```javascript
module.exports = {
	apps: [
		{
			name: "yoru",
			script: "index.js",
			exec_mode: "fork",
			instances: 1,
			max_memory_restart: "300M",
			watch: false, // Atur ke true untuk memulai ulang secara otomatis saat ada perubahan file
		},
	],
};
```

---

## Berkontribusi

Kontribusi Anda sangat dihargai! Jika Anda ingin membantu meningkatkan Yoru, silakan ikuti langkah-langkah berikut:

1.  **Fork** repositori.
2.  Buat cabang fitur baru (`git checkout -b feature/FiturBaru`).
3.  Buat perubahan Anda dan **commit** (`git commit -m "Tambahkan FiturBaru"`).
4.  **Push** ke cabang Anda (`git push origin feature/FiturBaru`).
5.  Buka **Pull Request**.

---

## Penyelesaian Masalah (Troubleshooting)

<details>
<summary><strong>Bot tidak merespons</strong></summary>

1.  **Periksa Token Bot:** Pastikan token di file `.env` Anda benar dan tidak ada spasi ekstra.
2.  **Verifikasi Konektivitas Internet:** Coba `ping google.com` dari server Anda.
3.  **Periksa Log:** Jalankan bot dalam mode `dev` (`npm run dev`) atau periksa log Docker/PM2 untuk pesan kesalahan.
4.  **Batas Tingkat (Rate Limits):** Pastikan bot tidak mengirim terlalu banyak pesan dalam waktu singkat, yang dapat menyebabkan Telegram menerapkan batas tingkat (rate-limited).
</details>

<details>
<summary><strong>Masalah koneksi database</strong></summary>

1.  **Verifikasi URL MongoDB:** Periksa kembali apakah URL dan kredensial (nama pengguna/kata sandi) sudah benar.
2.  **Server Database Berjalan:** Pastikan server database Anda aktif.
3.  **Whitelist IP:** Jika menggunakan MongoDB Atlas, pastikan alamat IP server Anda telah di-whitelist.
4.  **Firewall:** Periksa aturan firewall yang mungkin memblokir koneksi keluar ke port database.
</details>

<details>
<summary><strong>Plugin tidak memuat</strong></summary>

1.  **Periksa Sintaks:** Pastikan tidak ada kesalahan sintaks di file plugin Anda.
2.  **Struktur Plugin:** Verifikasi bahwa struktur `module.exports` sudah benar.
3.  **Cari Kesalahan:** Periksa konsol saat startup untuk pesan kesalahan apa pun yang terkait dengan pemuatan plugin.
4.  **Lokasi File:** Pastikan file plugin berada di dalam direktori `plugins` yang benar.
</details>

---

## Lisensi

Proyek ini dilisensikan di bawah **Lisensi MIT**. Gratis untuk penggunaan pribadi & komersial.

<div align="center">

---

**Butuh Bantuan?** Buka [Issue](https://github.com/yuurahz/yoru/issues) atau bergabung dalam diskusi!  
**⭐ Bintang (Star) repo ini jika Anda menyukainya! ⭐**

_Dibangun dengan ❤️ untuk komunitas Telegram_

</div>
