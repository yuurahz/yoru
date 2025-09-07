<div align="center">
    <h1>Yoru</h1>
    <img
        src="https://files.catbox.moe/obrip8.jpg"
        alt="Yoru"
    />
</div>

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-blue?style=for-the-badge&logo=telegram)](https://t.me/BotFather)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/yuurahz/yoru?style=for-the-badge)](https://github.com/yuurahz/yoru/stargazers)

<h3>⚡ Lightweight & Powerful Telegram Bot ⚡</h3>
<p><em>Built with Telegraf • Powered by Yoshida-APIs • Completely Free</em></p>

</div>

---

## ✨ Features

- 🆓 **Free & Open Source** – 100% free, no hidden costs
- 🔌 **Modular Architecture** – Plug & Play plugins
- ⚡ **Fast & Stable** – Powered by [Telegraf](https://telegraf.js.org/)
- 💾 **Hybrid Storage** – JSON + MongoDB support
- 🛡️ **Robust** – Advanced error handling & stable connection
- 🎯 **Easy Deployment** – Works on local, VPS, PM2, or cloud services

---

## 🚀 Quick Start

### 1️⃣ Clone & Install
```bash
git clone https://github.com/yuurahz/yoru.git
cd yoru
npm install
```

### 2️⃣ Configure Environment
```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan:

| Variable       | Description                                   | Default                  |
| -------------- | --------------------------------------------- | ------------------------ |
| TOKEN_BOT      | Token dari [BotFather](https://t.me/BotFather)| -                        |
| TZ             | Timezone lokal                                | Asia/Jakarta             |
| LIMIT          | Limit harian per user                         | 50                       |
| DATABASE_STATE | Pilih antara `json` atau `mongodb`            | json                     |
| DATABASE_NAME  | Nama database                                 | mydb                     |
| MONGO_URL      | URL MongoDB                                   | -                        |

### 3️⃣ Run the Bot
- **Production**
  ```bash
  npm start
  ```
- **Development (auto reload)**
  ```bash
  npm run dev
  ```
- **PM2**
  ```bash
  npm run pm2
  ```

---

## 🔧 Plugin Development

Yoru menggunakan sistem plugin yang mudah di-extend.

### Basic Plugin
```js
module.exports = {
  help: ["ping"],
  category: "tools",
  command: /^ping$/i,
  run: async (m, { client }) => {
    const start = Date.now();
    const msg = await m.reply("Pong!");
    const latency = Date.now() - start;
    await client.telegram.editMessageText(
      m.chat, msg.message_id, null,
      `🏓 Pong!\n*Latency:* ${latency} ms`,
      { parse_mode: "Markdown" }
    );
  }
};
```

### Event Handler
```js
module.exports = {
  async before(m) {
    if (m.body?.includes("hello")) {
      await m.reply("👋 Hello there!");
    }
    return true;
  },
};
```

---

## 🛠️ PM2 Configuration
```js
module.exports = {
  apps: [
    {
      name: "yoru",
      script: "index.js",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "300M",
    },
  ],
};
```

---

## 🤝 Contributing
We welcome contributions!  

1. 🍴 Fork repository  
2. 🌟 Create feature branch (`git checkout -b feature/new-feature`)  
3. 💾 Commit your changes (`git commit -m "Add new feature"`)  
4. 📤 Push (`git push origin feature/new-feature`)  
5. 🔄 Open Pull Request  

---

## 📜 License
Licensed under the **MIT License**. Free for personal & commercial use.  

---

## 🙌 Acknowledgements
- 👨‍💻 Developer: [yuurahz](https://github.com/yuurahz)  
- 📦 Library: [@yoshx/func](https://www.npmjs.com/package/@yoshx/func)  
- 🌐 API: [Yoshida-APIs](https://api.yoshida.my.id)  

---

<div align="center">

💬 **Need Help?** Open an [issue](https://github.com/yuurahz/yoru/issues) or join the discussions!  
⭐ **Star this repo if you like it!**  

_Built with ❤️ for the Telegram community_

</div>
