const fs = require("node:fs");
const path = require("node:path");

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

// Helper: Extract menu data from plugins
function getMenuData(plugins) {
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
					if (cmd) {
						if (isLimited) limitedCommands[cmd] = true;
						if (isPremium) premiumCommands[cmd] = true;
					}
				});

				tagsArray.forEach((tag) => {
					if (tag) {
						const normalizedTag = tag.toLowerCase();
						if (tagCount[normalizedTag]) {
							tagCount[normalizedTag]++;
							tagHelpMapping[normalizedTag].push(...helpArray);
						} else {
							tagCount[normalizedTag] = 1;
							tagHelpMapping[normalizedTag] = [...helpArray];
						}
					}
				});
			}
		});

	return { tagCount, tagHelpMapping, limitedCommands, premiumCommands };
}

// Helper: Format a single command text
const formatCommand = (prefix, cmd, limitedCommands, premiumCommands) => {
	let badges = [];
	if (limitedCommands[cmd]) {
		badges.push("Ⓛ︎");
	}
	if (premiumCommands[cmd]) {
		badges.push("Ⓟ");
	}
	return `${prefix}${cmd}${badges.length > 0 ? ` ${badges.join(" ")}` : ""}`;
};

// Helper: Get top banner text
async function getTopText(m, func) {
	const dbFile = path.join(
		process.cwd(),
		process.env.DATABASE_NAME + ".json"
	);
	const local_size = fs.existsSync(dbFile)
		? await func.getSize(fs.statSync(dbFile).size)
		: "";

	const packageFile = path.join(process.cwd(), "package.json");
	const library = JSON.parse(fs.readFileSync(packageFile, "utf-8"));

	return global.db.setting.msg
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
}

// Helper: Build main menu keyboard buttons
function buildMenuKeyboard(tagCount, isOwner) {
	const sortedTags = Object.keys(tagCount).sort();
	const categoriesToDisplay = sortedTags.filter((tag) => {
		if (tag === "owner" && !isOwner) return false;
		return true;
	});

	const inlineKeyboard = [];

	// Create a 2-column grid for categories
	for (let i = 0; i < categoriesToDisplay.length; i += 2) {
		const row = [];
		const cat1 = categoriesToDisplay[i];
		const icon1 = tagIcons[cat1] || "📁";
		row.push({
			text: `${icon1} ${cat1.toUpperCase()}`,
			callback_data: `menu:tag:${cat1}`,
		});

		if (i + 1 < categoriesToDisplay.length) {
			const cat2 = categoriesToDisplay[i + 1];
			const icon2 = tagIcons[cat2] || "📁";
			row.push({
				text: `${icon2} ${cat2.toUpperCase()}`,
				callback_data: `menu:tag:${cat2}`,
			});
		}
		inlineKeyboard.push(row);
	}

	// Add 'Show All Commands' option
	inlineKeyboard.push([
		{
			text: "🧾 Show All Commands",
			callback_data: "menu:all",
		},
	]);

	// Add official support/links
	inlineKeyboard.push(
		[
			{ text: "💬 Official Group", url: "https://t.me/yoshida_team" },
			{ text: "📢 Updates Channel", url: "https://t.me/yoshida_tech" },
		],
		[
			{ text: "🔗 Official Site", url: "https://yoshida.biz.id" },
			{ text: "💰 Donate", url: "https://saweria.co/yoshida" },
		]
	);

	return { inline_keyboard: inlineKeyboard };
}

module.exports = {
	command: /^(menu|help|listmenu|list)$/i,
	desc: "Displays an interactive command menu with buttons.",
	run: async (m, { func, setting, plugins }) => {
		const getCmd = m.text.toLowerCase().trim() || "tags";
		const { tagCount, tagHelpMapping, limitedCommands, premiumCommands } =
			getMenuData(plugins);
		const topText = await getTopText(m, func);

		// 1. Tags / Main Menu
		if (getCmd === "tags") {
			const keyboard = buildMenuKeyboard(tagCount, m.isOwner);
			let fullMenuText = `${topText}\n\n💡 *Tip*: Click the buttons below to navigate sections interactively, or type \`${m.prefix}${m.command} <category>\`.`;

			if (setting.menu_style === 1) {
				return m.sendMedia(m.chat, setting.cover, {
					caption: fullMenuText.trim(),
					reply_markup: keyboard,
					disable_web_page_preview: true,
				});
			} else {
				return m.reply(fullMenuText.trim(), {
					reply_markup: keyboard,
					disable_web_page_preview: true,
				});
			}
		}

		// 2. All commands text mode
		if (getCmd === "all") {
			let allMenuText = "*🧾 Available Commands:*\n";
			Object.keys(tagCount)
				.sort()
				.forEach((tag) => {
					if (tag === "owner" && !m.isOwner) return;
					const icon = tagIcons[tag] || "📁";
					allMenuText += `\n*${icon} ${tag.toUpperCase()}*\n`;
					const commandList = tagHelpMapping[tag]
						.sort()
						.map(
							(cmd) =>
								"› " +
								formatCommand(
									m.prefix,
									cmd,
									limitedCommands,
									premiumCommands
								)
						)
						.join("\n");
					allMenuText += `${commandList}\n`;
				});

			const keyboard = {
				inline_keyboard: [
					[{ text: "⬅️ Back to Menu", callback_data: "menu:home" }],
				],
			};

			if (setting.menu_style === 1) {
				return m.sendMedia(m.chat, setting.cover, {
					caption: allMenuText.trim(),
					reply_markup: keyboard,
					disable_web_page_preview: true,
				});
			} else {
				return m.reply(allMenuText.trim(), {
					reply_markup: keyboard,
					disable_web_page_preview: true,
				});
			}
		}

		// 3. Specific category text mode
		const requestedCategory = Object.keys(tagCount).find(
			(tag) => tag.toLowerCase() === getCmd
		);

		if (requestedCategory) {
			if (requestedCategory === "owner" && !m.isOwner) {
				return m.reply(
					"This category can only be accessed by the bot owner."
				);
			}
			const icon = tagIcons[requestedCategory] || "📁";
			let categoryMenuText = `*${icon} ${requestedCategory.toUpperCase()}*\n\n`;
			const commandList = tagHelpMapping[requestedCategory]
				.sort()
				.map(
					(cmd) =>
						"› " +
						formatCommand(
							m.prefix,
							cmd,
							limitedCommands,
							premiumCommands
						)
				)
				.join("\n");
			categoryMenuText += commandList;

			const keyboard = {
				inline_keyboard: [
					[{ text: "⬅️ Back to Menu", callback_data: "menu:home" }],
				],
			};

			if (setting.menu_style === 1) {
				return m.sendMedia(m.chat, setting.cover, {
					caption: categoryMenuText.trim(),
					reply_markup: keyboard,
					disable_web_page_preview: true,
				});
			} else {
				return m.reply(categoryMenuText.trim(), {
					reply_markup: keyboard,
					disable_web_page_preview: true,
				});
			}
		}

		return m.reply(
			`Category \`${getCmd}\` not found. Please use \`${m.prefix}${m.command}\` to open the interactive menu.`
		);
	},

	// Callback query handler for interactive buttons
	callback: async (m, { func, setting, plugins }) => {
		if (!m.callbackData || !m.callbackData.startsWith("menu:")) return;
		const action = m.callbackData.split(":")[1];
		const { tagCount, tagHelpMapping, limitedCommands, premiumCommands } =
			getMenuData(plugins);

		// Handle Main Menu callback
		if (action === "home") {
			const topText = await getTopText(m, func);
			const keyboard = buildMenuKeyboard(tagCount, m.isOwner);
			let fullMenuText = `${topText}\n\n💡 *Tip*: Click the buttons below to navigate sections interactively, or type \`${m.prefix || "/"}menu <category>\`.`;

			await m.edit(fullMenuText.trim(), { reply_markup: keyboard });
			return;
		}

		// Handle All Commands callback
		if (action === "all") {
			let allMenuText = "*🧾 Available Commands:*\n";
			Object.keys(tagCount)
				.sort()
				.forEach((tag) => {
					if (tag === "owner" && !m.isOwner) return;
					const icon = tagIcons[tag] || "📁";
					allMenuText += `\n*${icon} ${tag.toUpperCase()}*\n`;
					const commandList = tagHelpMapping[tag]
						.sort()
						.map(
							(cmd) =>
								"› " +
								formatCommand(
									m.prefix || "/",
									cmd,
									limitedCommands,
									premiumCommands
								)
						)
						.join("\n");
					allMenuText += `${commandList}\n`;
				});

			const keyboard = {
				inline_keyboard: [
					[{ text: "⬅️ Back to Menu", callback_data: "menu:home" }],
				],
			};

			await m.edit(allMenuText.trim(), { reply_markup: keyboard });
			return;
		}

		// Handle Category callback
		if (action === "tag") {
			const tag = m.callbackData.split(":")[2];
			if (!tagCount[tag]) return;

			if (tag === "owner" && !m.isOwner) {
				return m.answer(
					"This category can only be accessed by the bot owner.",
					true
				);
			}

			const icon = tagIcons[tag] || "📁";
			let categoryMenuText = `*${icon} ${tag.toUpperCase()}*\n\n`;
			const commandList = tagHelpMapping[tag]
				.sort()
				.map(
					(cmd) =>
						"› " +
						formatCommand(
							m.prefix || "/",
							cmd,
							limitedCommands,
							premiumCommands
						)
				)
				.join("\n");
			categoryMenuText += commandList;

			const keyboard = {
				inline_keyboard: [
					[{ text: "⬅️ Back to Menu", callback_data: "menu:home" }],
				],
			};

			await m.edit(categoryMenuText.trim(), { reply_markup: keyboard });
		}
	},
};
