<div align="center">
    <h1>YORU</h1>
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

<h3>Lightweight & Powerful Telegram Bot</h3>
<p><em>Built with Telegraf • Powered by Yoshida-APIs • Completely Free</em></p>

</div>

---

#### Features

> [!NOTE]

- **Free & Open Source** – 100% free, no hidden costs
- **Modular Architecture** – Plug & Play plugins
- **Fast & Stable** – Powered by [Telegraf](https://telegraf.js.org/)
- **Hybrid Storage** – JSON + MongoDB support
- **Robust** – Advanced error handling & stable connection
- **Easy Deployment** – Works on local, VPS, PM2, or cloud services

---

#### Quick Start

#### 1. Clone & Install

```bash
git clone https://github.com/yuurahz/yoru.git
cd yoru
npm install
```

#### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` as needed:

| Variable       | Description                                    | Values       |
| -------------- | ---------------------------------------------- | ------------ |
| TOKEN_BOT      | Token dari [BotFather](https://t.me/BotFather) | -            |
| TZ             | Local timezone                                 | Asia/Jakarta |
| LIMIT          | Daily limit per user                           | 50           |
| DATABASE_STATE | Choose between `json` or `mongodb`             | json         |
| DATABASE_NAME  | Database name                                  | mydb         |
| MONGO_URL      | MongoDB URL                                    | -            |

#### 3. Run the Bot

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

#### Plugin Development

Yoru uses a plugin system that is easy to extend.

#### Basic Plugin

```js
module.exports = {
	// Plugin metadata
	help: ["ping"],
	category: "tools",
	command: /^ping$/i,

	// The main logic of calling the plugin
	run: async (m, { client }) => {
		const start = Date.now();
		const msg = await m.reply("Pong!");
		const latency = Date.now() - start;
		await client.telegram.editMessageText(
			m.chat,
			msg.message_id,
			null,
			`🏓 Pong!\n*Latency:* ${latency} ms`,
			{ parse_mode: "Markdown" }
		);
	},

	// Plugin permissions
	group: false, // Works in groups
	admin: false, // Requires admin
	limit: false, // Uses command limit
	premium: false, // Premium only
	botAdmin: false, // Bot needs admin
	owner: false, // Owner only
};
```

#### Event Handler

```js
module.exports = {
	before: async (m, { client }) => {
		if (m.body?.includes("hello")) {
			await m.reply("👋 Hello there!");
		}
		return true;
	},
};
```

---

#### PM2 Configuration

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

#### Contributing

We welcome contributions!

> [!TIP]

1. Fork repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push (`git push origin feature/new-feature`)
5. Open Pull Request

---

#### License

Licensed under the **MIT License**. Free for personal & commercial use.

---

<div align="center">

**Need Help?** Open an [issue](https://github.com/yuurahz/yoru/issues) or join the discussions!  
**Star this repo if you like it!**

_Built with ❤️ for the Telegram community_

</div>
