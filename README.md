<div align="center">
    <h1>YORU</h1>
    <img
        src="https://files.catbox.moe/obrip8.jpg"
        alt="Yoru"
    />
</div>

<div align="center">

[![Community](https://img.shields.io/badge/Telegram?style=for-the-badge&logo=telegram)](https://t.me/yoshida_team)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/yuurahz/yoru?style=for-the-badge)](https://github.com/yuurahz/yoru/issues)
[![Stars](https://img.shields.io/github/stars/yuurahz/yoru?style=for-the-badge)](https://github.com/yuurahz/yoru/stargazers)
[![Forks](https://img.shields.io/github/forks/yuurahz/yoru?style=for-the-badge)](https://github.com/yuurahz/yoru/network/members)

<h3>Lightweight & Powerful Telegram Bot</h3>

</div>

---

> An implementation of [@yoshx/func](https://www.npmjs.com/package/@yoshx/func) which has been optimized to be lightweigth.

> [!NOTE]
> **Yoru** is a modern, scalable Telegram bot framework designed for developers who need a robust foundation for building feature-rich bots. Whether you're creating a simple utility bot or a complex multi-service platform, Yoru provides the architecture and tools to scale efficiently.

# Why chose yoru?

- [x] **Free & Open Source** – 100% free, no hidden costs
- [x] **Modular Architecture** – Plug & Play plugins
- [x] **Fast & Stable** – Powered by [Telegraf](https://telegraf.js.org/)
- [x] **Hybrid Storage** – JSON + MongoDB support
- [ ] **Robust** – Advanced error handling & stable connection
- [ ] **Easy Deployment** – Works on local, VPS, PM2, or cloud services

---

### Requirements

- [x] NodeJS >= 16 (Recommended v20.18.1)
- [x] Server vCPU/RAM 100/500MB (Min)

### Server

- [x] NAT VPS [Hostdata](https://hostdata.id/nat-vps-usa/) (Recommended)
- [x] Hosting Panel [The Hoster](https://optiklink.com/)
- [x] VPS [Orange VPS](https://www.orangevps.com/)
- [x] RDP Windows [RDP Win](https://www.rdpwin.com/rdpbot.php)

### Cloud Database

- [x] MongoDB [MongoDB](https://www.mongodb.com)

---

### Quick Start

#### 1. Clone & Install

- **Clone the repository**
    ```bash
    git clone https://github.com/yuurahz/yoru.git
    ```
- **Open the cloned bot folder**
    ```bash
    cd yoru
    ```
- **Install all required packages**
    ```bash
    npm i
    ```

#### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` as needed:

| Variable       | Description                                    | Values       |
| -------------- | ---------------------------------------------- | ------------ |
| TOKEN_BOT      | Token from [BotFather](https://t.me/BotFather) | -            |
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

### Install & Run Via Docker

```bash
sudo apt update -y && sudo apt install curl -y
curl -fsSL https://get.docker.com | bash
git clone https://github.com/yuurahz/yoru
cd yoru
docker build -t bot .
docker run -d --name yoru bot && docker logs -f yoru
```

How to stop ?

```bash
docker stop yoru
```

---

### Plugin Development

> [!IMPORTANT]
> Yoru uses a flexible and easy to extend plugins calling system

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
	group: Boolean, // Works in groups
	admin: Boolean, // Requires admin
	limit: 1, // Uses command limit (can use between Number or Boolean)
	premium: Boolean, // Premium only
	botAdmin: Boolean, // Bot needs admin
	owner: Boolean, // Owner only
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

### PM2 Configuration

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

> [!TIP]
> Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push (`git push origin feature/new-feature`)
5. Open Pull Request

---

> [!WARNING]
> Troubleshooting

**Bot not responding:**

1. Check if the bot token is correct
2. Verify internet connectivity
3. Check the logs for error messages
4. Ensure the bot is not hitting rate limits

**Database connection issues:**

1. Verify MongoDB URL and credentials
2. Check if the database server is running
3. Ensure network connectivity to the database
4. Check for firewall or security group restrictions

**Plugin not loading:**

1. Check plugin syntax and structure
2. Verify all required dependencies are installed
3. Look for error messages in the console
4. Ensure the plugin file is in the correct directory

---

### License

Licensed under the **MIT License**. Free for personal & commercial use.

<div align="center">

**Need Help?** Open an [issue](https://github.com/yuurahz/yoru/issues) or join the discussions!  
**Star this repo if you like it!**

_Built with ❤️ for the Telegram community_

</div>
