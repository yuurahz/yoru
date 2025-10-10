const fs = require("fs");
const cron = require("node-cron");
const uploader = require("@library/uploader");
const api = require("./api");
const Color = require("./color");
const func = require("@system/functions");
const { plugins } = require("./plugins");

module.exports = async (client, m) => {
	try {
		require("./scheme")(m);

		const users = global.db.users[m.sender];
		const groupSet = global.db.groups[m.chat];
		const setting = global.db.setting;
		const others = global.db.others;
		const isPrems = users.premium || m.isOwner;

		if (setting.action_mode) {
			await client.telegram
				.sendChatAction(m.chat, "typing")
				.catch(() => {});
		}

		if (setting.debug_mode && m.isOwner) {
			await m.reply(func.jsonFormat(m));
		}

		if (
			m.isGroup &&
			!groupSet.stay &&
			new Date() * 1 >= groupSet.expired &&
			groupSet.expired != 0
		) {
			await m.reply(
				func.texted(
					"bold",
					"Bot rental time has expired and will leave this group. Thank you. 😊✨"
				)
			);
			groupSet.expired = 0;
			return client.telegram.leaveChat(m.chat);
		}

		if (users && new Date() * 1 >= users.expired && users.expired != 0) {
			await m.reply(
				func.texted(
					"bold",
					"Your premium package has expired. Thank you for using our service. 😊✨"
				)
			);
			users.premium = false;
			users.expired = 0;
			users.limit = parseInt(process.env.LIMIT);
		}

		if (!global.dailyResetScheduled) {
			cron.schedule(
				"00 00 * * *",
				() => {
					try {
						setting.lastreset = Date.now();
						const defaultLimit = parseInt(process.env.LIMIT);

						Object.values(global.db.users).forEach((user) => {
							if (user.limit < defaultLimit && !user.premium) {
								user.limit = defaultLimit;
							}
						});

						Object.values(global.db.stats).forEach((stat) => {
							if (stat && typeof stat === "object") {
								stat.today = 0;
							}
						});

						console.log(
							Color.cyanBright +
								"All users limit successfully reseted. . ." +
								Color.reset
						);
					} catch (error) {
						console.error("Daily reset error:", error);
					}
				},
				{ scheduled: true, timezone: process.env.TZ }
			);
			global.dailyResetScheduled = true;
		}

		if (m.isGroup) {
			groupSet.activity = new Date() * 1;
		}

		if (users) {
			users.lastseen = new Date() * 1;
		}

		if (m.isGroup && !m.fromMe) {
			const now = new Date() * 1;
			if (!groupSet.member[m.sender]) {
				groupSet.member[m.sender] = {
					lastseen: now,
					warn: 0,
				};
			} else {
				groupSet.member[m.sender].lastseen = now;
			}
		}

		const extra = {
			api,
			client,
			func,
			users,
			setting,
			others,
			plugins,
			uploader,
			isPrems,
			groupSet,
		};

		if (m.isCallback) {
			for (const name in plugins) {
				const plugin = plugins[name];
				if (typeof plugin.callback === "function") {
					try {
						await plugin.callback.call(client, m, extra);
					} catch (e) {
						console.error(`Callback error in plugin ${name}:`, e);
					}
				}
			}
			await m.answer().catch(() => {});
			return;
		}

		for (let name in plugins) {
			let plugin;
			if (typeof plugins[name].run === "function") {
				let runner = plugins[name];
				plugin = runner.run;
				for (let prop in runner) {
					if (prop !== "run") {
						plugin[prop] = runner[prop];
					}
				}
			} else {
				plugin = plugins[name];
			}
			if (!plugin) {
				continue;
			}

			if (typeof plugin.all === "function") {
				try {
					await plugin.all.call(client, m, extra);
				} catch (e) {
					console.error(e);
				}
			}

			if (typeof plugin.before === "function") {
				try {
					await plugin.before.call(client, m, extra);
				} catch (e) {
					console.error(e);
				}
			}

			if (!m.command) {
				continue;
			}

			const command = m.command.toLowerCase();

			const isAccept =
				plugin.command instanceof RegExp
					? plugin.command.test(command)
					: Array.isArray(plugin.command)
						? plugin.command.some((cmd) =>
								cmd instanceof RegExp
									? cmd.test(command)
									: cmd === command
							)
						: typeof plugin.command === "string"
							? plugin.command === command
							: false;

			if (!isAccept) {
				continue;
			}

			Object.assign(users, {
				exp: (users.exp || 0) + Math.ceil(Math.random() * 10),
			});

			m.plugin = name;

			if (m.chat in global.db.groups || m.sender in global.db.users) {
				if (
					!["moderation.js"].includes(name.split("/").pop()) &&
					groupSet &&
					groupSet.muted
				)
					return;
				if (
					!["moderation.js"].includes(name.split("/").pop()) &&
					users &&
					users.banned
				)
					return;
			}
			if (setting.cmd_blocked.includes(command) && !m.isOwner) {
				return m.reply(global.mess.blocked_cmd);
			}
			if (setting.self_mode && !m.isOwner) {
				continue;
			}
			if (plugin.owner && !m.isOwner) {
				return m.reply(global.mess.owner);
			}
			if (plugin.premium && !isPrems) {
				return m.reply(global.mess.premium);
			}
			if (plugin.group && !m.isGroup) {
				return m.reply(global.mess.group);
			}
			if (plugin.admin && !m.isAdmin) {
				return m.reply(global.mess.admin);
			}
			if (plugin.botAdmin && !m.isBotAdmin) {
				return m.reply(global.mess.botAdmin);
			}
			if (plugin.private && m.isGroup) {
				return m.reply(global.mess.private);
			}
			if (plugin.register && !users.registered) {
				return m.reply(
					global.mess.register.replace("{{prefix}}", m.prefix)
				);
			}
			if (plugin.limit && users.limit < plugin.limit * 1) {
				return m.reply(
					"Your limit has reached the limit. Wait at *00:00* to reset, or upgrade to premium for *unlimited* limit."
				);
			}
			if (!isPrems && plugin.limit && users.limit > 0) {
				const limit = plugin.limit === "Boolean" ? 1 : plugin.limit;
				if (users.limit >= limit) {
					users.limit -= limit;
				} else {
					m.reply("Your limit is not enough to use this feature.");
					continue;
				}
			}

			try {
				await plugin.call(client, m, extra);
			} catch (e) {
				console.error(e);

				if (setting.owners > 0) {
					await client.telegram.sendMessage(
						setting.owners[0],
						`*Error Detected*\n\nPlugin: ${name}\nFrom: ${m.from?.username || m.sender || m.name}\n\n${func.jsonFormat(e)}`,
						{ parse_mode: "Markdown" }
					);
				}
			} finally {
				if (typeof plugin.after === "function") {
					try {
						await plugin.after.call(client, m, extra);
					} catch (e) {
						console.error(e);
					}
				}
			}

			break;
		}
	} catch (e) {
		console.error(e);
	} finally {
		const stats = global.db.stats;
		if (m && m.plugin) {
			const now = +new Date();
			const pluginName = m.plugin.split("/").pop().replace(".js", "");
			let stat = stats[pluginName] || {
				hitstat: 0,
				today: 0,
				lasthit: 0,
			};
			stat.hitstat += 1;
			stat.today += 1;
			stat.lasthit = now;
			stats[pluginName] = stat;
		}

		if (m && !m.fromMe) {
			console.log(Color.bgRed + " Telegram Message Info " + Color.reset);
			console.log(
				`   - Date: ${new Date().toLocaleString("id-ID")} WIB \n` +
					`   - Message: ${m.body || m.type} \n` +
					`   - Sender: ${m.sender} \n` +
					`   - Name: ${m.name} \n` +
					`   - ID: ${m.id}`
			);
			if (m.isGroup) {
				console.log(`   - GroupID: ${m.chat}`);
			}
			console.log("---------------------------");
		}
	}
};
