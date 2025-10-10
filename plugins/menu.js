const fs = require("node:fs");

module.exports = {
	command: /^(menu|help|listmenu|list)$/i,
	desc: "Displays an interactive command menu.",
	run: async (m, { func, setting, plugins }) => {
		const getCmd = m.text.toLowerCase() || "tags";

		let tagCount = {};
		let tagHelpMapping = {};
		let limitedCommands = {};
		let premiumCommands = {};

		Object.keys(plugins)
			.filter((plugin) => !plugins[plugin].disabled)
			.forEach((plugin) => {
				const category = plugins[plugin].category;
				const tagsArray = Array.isArray(category)
					? category
					: category
						? [category]
						: [];

				if (tagsArray.length > 0) {
					const helpArray = Array.isArray(plugins[plugin].help)
						? plugins[plugin].help
						: [plugins[plugin].help];

					const isLimited =
						typeof plugins[plugin].limit !== "undefined" &&
						plugins[plugin].limit > 0;
					const isPremium = plugins[plugin].premium === true;

					helpArray.forEach((cmd) => {
						if (isLimited) limitedCommands[cmd] = true;
						if (isPremium) premiumCommands[cmd] = true;
					});

					tagsArray.forEach((tag) => {
						if (tag) {
							if (tagCount[tag]) {
								tagCount[tag]++;
								tagHelpMapping[tag].push(...helpArray);
							} else {
								tagCount[tag] = 1;
								tagHelpMapping[tag] = [...helpArray];
							}
						}
					});
				}
			});

		const tagIcons = {
			ai: "🧠",
			tools: "🛠️",
			game: "🎮",
			downloader: "📥",
			internet: "🌐",
			maker: "🎨",
			group: "👥",
			owner: "👑",
			general: "ℹ️",
			user: "👤",
		};

		const formatCommand = (prefix, cmd) => {
			let badges = [];
			if (limitedCommands[cmd]) {
				badges.push("Ⓛ︎");
			}
			if (premiumCommands[cmd]) {
				badges.push("Ⓟ");
			}
			return `${prefix}${cmd}${badges.length > 0 ? ` ${badges.join(" ")}` : ""}`;
		};

		const local_size = fs.existsSync(
			"./" + process.env.DATABASE_NAME + ".json"
		)
			? await func.getSize(
					fs.statSync("./" + process.env.DATABASE_NAME + ".json").size
				)
			: "";
		const library = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

		const topText = global.db.setting.msg
			.replace("+tag", `@${m.name}`)
			.replace("+uptime", func.toDate(process.uptime() * 1000))
			.replace("+mem", func.formatSize(process.memoryUsage().heapUsed))
			.replace(
				"+db",
				/json/i.test(process.env.DATABASE_STATE)
					? `Local : (${local_size})`
					: /mongo/i.test(process.env.DATABASE_STATE)
						? "MongoDB"
						: /supabase/i.test(process.env.DATABASE_STATE)
							? "Supabase (PostgreSQL)"
							: "Dummy"
			)
			.replace("+version", library.dependencies.telegraf);

		if (getCmd === "tags") {
			let categoryList = "";
			Object.keys(tagCount)
				.sort()
				.forEach((tag) => {
					const icon = tagIcons[tag] || "📁";
					categoryList += `› \`${m.prefix}${m.command} ${tag}\` (${tagHelpMapping[tag].length})\n`;
				});

			let fullMenuText = `${topText}\n\n${categoryList}\n\nTo see all commands at once, type \`${m.prefix}${m.command} all\`.`;

			var buttons = [
				[
					{
						text: "💬 Official Group",
						url: "https://t.me/yoshida_team",
					},
					{
						text: "📢 Updates Channel",
						url: "https://t.me/yoshida_tech",
					},
				],
				[
					{ text: "🔗 Official Site", url: "https://yoshida.my.id" },
					{ text: "💰 Donate", url: "https://saweria.co/yoshida" },
				],
			];

			if (setting.menu_style === 1) {
				return m.sendMedia(m.chat, setting.cover, {
					caption: fullMenuText.trim(),
					reply_markup: { inline_keyboard: buttons },
					disable_web_page_preview: true,
				});
			} else {
				return m.reply(fullMenuText.trim(), {
					reply_markup: { inline_keyboard: buttons },
					disable_web_page_preview: true,
				});
			}
		}

		if (getCmd === "all") {
			let allMenuText = "*🧾 Available Commands:*\n";
			Object.keys(tagCount)
				.sort()
				.forEach((tag) => {
					const icon = tagIcons[tag.toLowerCase()] || "📁";
					allMenuText += `\n*${icon} ${tag.toUpperCase()}*\n`;
					const commandList = tagHelpMapping[tag]
						.sort()
						.map((cmd) => "› " + formatCommand(m.prefix, cmd))
						.join("\n");
					allMenuText += `${commandList}\n`;
				});

			if (setting.menu_style === 1) {
				return m.sendMedia(m.chat, setting.cover, {
					caption: allMenuText.trim(),
					reply_markup: { inline_keyboard: buttons },
					disable_web_page_preview: true,
				});
			} else {
				return m.reply(allMenuText.trim(), {
					reply_markup: { inline_keyboard: buttons },
					disable_web_page_preview: true,
				});
			}
		}

		const requestedCategory = Object.keys(tagCount).find(
			(tag) => tag.toLowerCase() === getCmd
		);

		if (requestedCategory) {
			const icon = tagIcons[requestedCategory.toLowerCase()] || "📁";
			let categoryMenuText = `*${icon} ${requestedCategory.toUpperCase()}*\n\n`;
			const commandList = tagHelpMapping[requestedCategory]
				.sort()
				.map((cmd) => "› " + formatCommand(m.prefix, cmd))
				.join("\n");
			categoryMenuText += commandList;

			if (setting.menu_style === 1) {
				return m.sendMedia(m.chat, setting.cover, {
					caption: categoryMenuText.trim(),
					reply_markup: { inline_keyboard: buttons },
					disable_web_page_preview: true,
				});
			} else {
				return m.reply(categoryMenuText.trim(), {
					reply_markup: { inline_keyboard: buttons },
					disable_web_page_preview: true,
				});
			}
		}

		return m.reply(
			`Category \`${getCmd}\` not found. Please use \`${m.prefix}${m.command}\` to see all available categories.`
		);
	},
};
