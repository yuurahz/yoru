# <div align="center">YORU</div>

<div align="center">
  <h3>Lightweight & Powerful Telegram Bot</h3>
  <p><em>Built with Telegraf • Powered by Yoshida-APIs • Completely Free</em></p>
</div>

## ✨ **Why Choose Yoru?**

<table>
<tr>
<td>🆓 <strong>100% Free</strong></td>
<td>No hidden costs, completely open-source</td>
</tr>
<tr>
<td>🔌 <strong>Plug & Play</strong></td>
<td>Modular architecture for easy customization</td>
</tr>
<tr>
<td>⚡ <strong>Lightning Fast</strong></td>
<td>Built on Telegraf for optimal performance</td>
</tr>
<tr>
<td>💾 <strong>Hybrid Storage</strong></td>
<td>MongoDB + JSON for optimal performance</td>
</tr>
<tr>
<td>🛡️ <strong>Reliable</strong></td>
<td>Stable connection with advanced error handling</td>
</tr>
<tr>
<td>🎯 <strong>Easy Deploy</strong></td>
<td>Multiple deployment options available</td>
</tr>
</table>

## 🚀 **Quick Start Guide**

### 1️⃣ **Installation**

```bash
# Clone the repository
git clone https://github.com/yuurahz/yoru.git

# Navigate to project directory
cd yoru

# Install dependencies
npm install or yarn install
```

### 2️⃣ **Configuration**

```bash
cp .env.example .env
```

### 3️⃣ **Configuration ".env" according to your needs**

| Variable       | Description                                   | Default                  |
| -------------- | --------------------------------------------- | ------------------------ |
| TOKEN_BOT      | The token used to connect to the bot          | get from: t.me/BotFather |
| TZ             | Your time zone location                       | Optional                 |
| LIMIT          | Number of limits per user                     | 50                       |
| DATABASE_STATE | You can choose between json (local) & MongoDB | json                     |
| DATABASE_NAME  | Name for the database                         | mydb                     |
| MONGO_URL      | Link to connect connection to mongodb         | url                      |

### 4️⃣ **Launch Your Bot**

Choose your preferred method:

- **Production:**
    ```bash
    npm start
    ```
- **Development (auto-reload):**
    ```bash
    npm run dev
    ```
- **Using PM2:**
    ```bash
    npm run pm2
    ```

---

## 🔧 **Plugin Development**

### **Creating a Basic Plugin**

```javascript
module.exports = {
	// Plugin metadata
	help: ["ping", "test"],
	category: "tools",
	command: /^(ping|test)$/i,

	// Main plugin logic
	run: async (m, { client }) => {
		const startTime = Date.now();
		const msg = await m.reply("Pong!");
		const latency = Date.now() - startTime;
		await client.telegram.editMessageText(
			m.chat,
			msg.message_id,
			null,
			`Pong! 🏓\n*Latency:* ${latency} ms`,
			{ parse_mode: "Markdown" }
		);
	},

	// Plugin permissions
	group: false, // Works in groups
	admin: false, // Requires admin
	limit: false, // Uses command limit (String / Boolean)
	premium: false, // Premium only
	botAdmin: false, // Bot needs admin
	owner: false, // Owner only
};
```

### **Creating Event Handlers**

```javascript
module.exports = {
	async before(m, { client }) {
		try {
			// Pre-processing logic
			if (m.body && m.body.includes("hello")) {
				await m.reply("👋 Hello there!");
			}
		} catch (error) {
			console.error("Event handler error:", error);
		}
		return true;
	},
};
```

### **PM2 Configuration**

```javascript
module.exports = {
	apps: [
		{
			script: "index.js",
			name: "yoru",
			node_args: "--max-old-space-size=256",
			max_memory_restart: "300M",
			exp_backoff_restart_delay: 1000,
			min_uptime: 5000,
			max_restarts: 5,
			instances: 1,
			exec_mode: "fork",
		},
	],
};
```

---

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌟 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔄 **Open** a Pull Request

## 📜 **License & Terms**

<div align="center">

**MIT License** - Free for personal and commercial use

⭐ **Please star this repository if you find it useful!**

</div>

### **Usage Guidelines**

- ✅ Free to use and modify
- ✅ Commercial use allowed
- ✅ Private use allowed
- ⚠️ Must include license and copyright notice
- ❌ No warranty provided

## **Credits & Acknowledgements**

<div align="center">

| Role                 | Contributor  | Links                                            |
| -------------------- | ------------ | ------------------------------------------------ |
| **Developer**        | yuurahz      | [GitHub](https://github.com/yuurahz)             |
| **Library Provider** | @yoshx/func  | [npm](https://www.npmjs.com/package/@yoshx/func) |
| **API Provider**     | Yoshida-APIs | [Try it](https://api.yoshida.my.id)              |

</div>

## **Support & Community**

<div align="center">

[![GitHub Issues](https://img.shields.io/github/issues/yuurahz/yoru?style=for-the-badge)](https://github.com/yuurahz/yoru/issues)
[![GitHub Stars](https://img.shields.io/github/stars/yuurahz/yoru?style=for-the-badge)](https://github.com/yuurahz/yoru/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/yuurahz/yoru?style=for-the-badge)](https://github.com/yuurahz/yoru/network/members)

**Need help?** Open an issue or join our community discussions!

</div>

<div align="center">

**Built with ❤️**

_Building the future of Telegram automation_

</div>
