<div align="center">
    <h1>YORU</h1>
    <a href="https://github.com/yuurahz/yoru">
        <img src="https://files.catbox.moe/obrip8.jpg" alt="Yoru"/>
    </a>
</div>

<div align="center">

<h3>A Lightweight, Powerful, and Scalable Telegram Bot</h3>

[![Community](https://img.shields.io/badge/Telegram-Community-Blue?style=for-the-badge&logo=telegram)](https://t.me/yoshida_team)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/issues)
[![Stars](https://img.shields.io/github/stars/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/stargazers)
[![Forks](https://img.shields.io/github/forks/yuurahz/yoru?style=for-the-badge&logo=github)](https://github.com/yuurahz/yoru/network/members)

</div>

---

> [!NOTE]
> **Yoru** is a modern Telegram bot framework designed for developers who need a robust foundation for building feature-rich bots. Whether you're creating a simple utility bot or a complex, multi-service platform, Yoru provides the architecture and tools to scale efficiently. It's built upon [@yoshx/func](https://www.npmjs.com/package/@yoshx/func) and optimized for lightweight performance.

---

## Table of Contents

- [Why Choose Yoru?](#why-choose-yoru)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Bot](#️running-the-bot)
- [Installation via Docker](#installation-via-docker)
- [Plugin Development](#plugin-development)
- [PM2 Configuration](#pm2-configuration)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Why Choose Yoru?

- **Free & Open Source:** Completely free for personal and commercial use under the MIT License.
- **Modular Architecture:** Easily extend functionality with a simple plug-and-play plugin system.
- **Fast & Stable:** Powered by [Telegraf](https://telegraf.js.org/), one of the most popular and reliable Telegram bot libraries.
- **Hybrid Storage:** Choose between simple JSON file-based storage or a powerful MongoDB database for scalability.
- **Active Roadmap:**
    - [x] **Robust Error Handling:** A more resilient system to gracefully handle errors and maintain a stable connection.
    - [ ] **Easy Deployment:** Streamlined processes for hosting on various platforms.

---

## Requirements

### Software

- **NodeJS:** Version `16.x` or higher. (Recommended `20.x`)
- **Git:** For cloning the repository.

### Hardware (Minimum Recommendation)

- **vCPU:** 1 Core
- **RAM:** 500 MB

### Recommended Services

- **Hosting:** [Hostdata (NAT VPS)](https://hostdata.id/nat-vps-usa/), [Optiklink](https://optiklink.com/), [VPS](https://www.orangevps.com/), [RDPWin](https://www.rdpwin.com/rdpbot.php)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a free cloud database.

---

## Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yuurahz/yoru.git

# Navigate into the project directory
cd yoru

# Install all required dependencies
npm install
```

### 2. Configure Environment

Copy the example `.env` file to create your own configuration file.

```bash
cp .env.example .env
```

Next, open the `.env` file and customize the values as needed.

---

## Configuration

Edit the `.env` file you just created:

| Variable         | Description                                                      | Example Value  |
| :--------------- | :--------------------------------------------------------------- | :------------- |
| `TOKEN_BOT`      | Your unique bot token from [@BotFather](https://t.me/BotFather). | -              |
| `OWNER_ID`       | ID of the account that will be used as the owner.                | -              |
| `TZ`             | The local timezone of your server.                               | `Asia/Jakarta` |
| `LIMIT`          | The daily command usage limit per user.                          | `50`           |
| `DATABASE_STATE` | Choose `json` for local files or `mongodb` for a database.       | `json`         |
| `DATABASE_NAME`  | The name of your database (for MongoDB).                         | `yoru_db`      |
| `MONGO_URL`      | Your MongoDB connection string (if using `mongodb`).             | -              |

---

## Running the Bot

You can run the bot in several different modes:

- **Production Mode:**
    ```bash
    npm start
    ```
- **Development Mode (with auto-reload on file changes):**
    ```bash
    npm run dev
    ```
- **Using PM2 (to keep the bot online):**
    ```bash
    npm run pm2
    ```

---

## Installation via Docker

For an easy and isolated setup, you can use Docker.

```bash
# Update packages and install dependencies
sudo apt update -y && sudo apt install curl git -y

# Install Docker
curl -fsSL https://get.docker.com | bash

# Clone the repository
git clone https://github.com/yuurahz/yoru

# Navigate into the directory
cd yoru

# (IMPORTANT) Create and edit your .env file before building the image
# cp .env.example .env
# nano .env

# Build the Docker image
docker build -t yoru-bot .

# Run the container in detached mode and set it to always restart
docker run -d --name yoru --restart always yoru-bot

# View the bot's logs in real-time
docker logs -f yoru
```

To stop the container:

```bash
docker stop yoru
```

---

## Plugin Development

Yoru uses a flexible and easy-to-extend plugin system.

#### Basic Plugin Example

This is a simple `ping` plugin to check the bot's latency.

```javascript
// file: plugins/tools/ping.js
module.exports = {
	// Plugin metadata
	help: ["ping"],
	category: "tools",
	command: "ping",

	// The main logic of the plugin
	run: async (m, { client }) => {
		const start = Date.now();
		const msg = await m.reply("Pinging...");
		const latency = Date.now() - start;

		await client.telegram.editMessageText(
			m.chat,
			msg.message_id,
			null,
			`🏓 Pong!\n*Latency:* ${latency} ms`,
			{ parse_mode: "Markdown" }
		);
	},

	// Plugin permissions and properties
	group: true, // Works in groups
	admin: false, // Does not require admin
	limit: 1, // Consumes 1 usage limit (can be a Number or Boolean)
	premium: false, // Not premium-only
	botAdmin: false, // Bot does not need to be an admin
	owner: false, // Not owner-only
};
```

#### Event Handler Example

Plugins can also respond to events instead of commands, such as replying to specific messages.

```javascript
// file: plugins/events/auto-reply.js
module.exports = {
	// The 'before' function runs on every incoming message
	before: async (m, { client }) => {
		if (m.body?.toLowerCase().includes("hello yoru")) {
			await m.reply("👋 Hello there!");
		}

		// Always return a boolean value
		return true;
	},
};
```

---

## PM2 Configuration

If you run the bot using `npm run pm2`, you can customize its configuration in the `ecosystem.config.js` file.

```javascript
module.exports = {
	apps: [
		{
			name: "yoru",
			script: "index.js",
			exec_mode: "fork",
			instances: 1,
			max_memory_restart: "300M",
			watch: false, // Set to true to automatically restart on file changes
		},
	],
};
```

---

## Contributing

Your contributions are highly appreciated! If you'd like to help improve Yoru, please follow these steps:

1.  **Fork** the repository.
2.  Create a new feature branch (`git checkout -b feature/NewFeature`).
3.  Make your changes and **commit** them (`git commit -m "Add NewFeature"`).
4.  **Push** to your branch (`git push origin feature/NewFeature`).
5.  Open a **Pull Request**.

---

## Troubleshooting

<details>
<summary><strong>Bot is not responding</strong></summary>

1.  **Check Bot Token:** Ensure the token in your `.env` file is correct and has no extra spaces.
2.  **Verify Internet Connectivity:** Try to `ping google.com` from your server.
3.  **Check Logs:** Run the bot in `dev` mode (`npm run dev`) or check Docker/PM2 logs for any error messages.
4.  **Rate Limits:** Make sure the bot is not sending too many messages in a short period, which could get it rate-limited by Telegram.
</details>

<details>
<summary><strong>Database connection issues</strong></summary>

1.  **Verify MongoDB URL:** Double-check that the URL and credentials (username/password) are correct.
2.  **Database Server is Running:** Ensure your database server is active.
3.  **Whitelist IP:** If using MongoDB Atlas, make sure your server's IP address has been whitelisted.
4.  **Firewall:** Check for any firewall rules that might be blocking the outbound connection to the database port.
</details>

<details>
<summary><strong>Plugin is not loading</strong></summary>

1.  **Check Syntax:** Ensure there are no syntax errors in your plugin file.
2.  **Plugin Structure:** Verify that the `module.exports` structure is correct.
3.  **Look for Errors:** Check the console on startup for any error messages related to loading plugins.
4.  **File Location:** Make sure the plugin file is inside the correct `plugins` directory.
</details>

---

## License

This project is licensed under the **MIT License**. Free for personal & commercial use.

<div align="center">

---

**Need Help?** Open an [Issue](https://github.com/yuurahz/yoru/issues) or join the discussions!  
**⭐ Star this repo if you like it! ⭐**

_Built with ❤️ for the Telegram community_

</div>
