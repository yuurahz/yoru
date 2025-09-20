require("./settings");
require("dotenv/config");
require("module-alias/register");

const Color = require("./system/color");
const { loadPlugins, watchPlugins } = require("./system/plugins");
const { Telegraf } = require("telegraf");
const { LocalDB, MongoDB } = require("@system/provider");

module.exports = connectTelegram = async () => {
	const mydb = /json/i.test(process.env.DATABASE_STATE)
		? new LocalDB(process.env.DATABASE_NAME)
		: /mongo/i.test(process.env.DATABASE_STATE)
			? new MongoDB(process.env.MONGO_URL, process.env.DATABASE_NAME)
			: process.exit(1);

	/* load database */
	global.db = {
		users: {},
		groups: {},
		setting: {},
		stats: {},
		others: {},
		...((await mydb.read()) || {}),
	};

	/* save database */
	await mydb.write(global.db);

	/** Database auto-save */
	const saveInterval = setInterval(async () => {
		try {
			await mydb.write(global.db);
		} catch (error) {
			console.error("Failed to auto-save database:", error);
		}
	}, 60 * 1000);

	const client = new Telegraf(process.env.TOKEN_BOT);
	const botInfo = await client.telegram.getMe();
	client.botInfo = botInfo;
	console.log(
		`${Color.cyanBright}-- Bot started as @${botInfo.username} --${Color.reset}`
	);

	client.on(["message", "callback_query"], async (ctx) => {
		try {
			const m = await require("@system/serialize")(client, ctx.update);
			if (!m) {
				return;
			}

			require("@system/handler")(client, m);
		} catch (e) {
			console.error(e);
		}
	});

	client.on("chat_member", async (ctx) => {
		try {
			const chatId = ctx.chat.id;
			const update = ctx.update.chat_member;
			const oldStatus = update.old_chat_member.status;
			const newStatus = update.new_chat_member.status;
			const user = update.new_chat_member.user;

			const group = global.db.groups[chatId];

			if (!group.greeting) return;

			const isNewMember =
				newStatus === "member" && oldStatus !== "member";
			const isMemberLeft = newStatus === "left" && oldStatus !== "left";

			let message = null;
			if (isNewMember) {
				message = (group.welcome_text || "👋 Welcome @user!").replace(
					/@user/g,
					`@${user.username || user.first_name}`
				);
			} else if (isMemberLeft) {
				message = (group.left_text || "👋 Goodbye @user!").replace(
					/@user/g,
					`@${user.username || user.first_name}`
				);
			}

			if (message) {
				await ctx.telegram.sendMessage(chatId, message, {
					parse_mode: "Markdown",
				});
			}
		} catch (e) {
			console.error("Error handling chat_member:", e);
		}
	});

	/** load plugins directory */
	loadPlugins(client);
	/** watch plugins after change */
	watchPlugins(client);

	await client.launch();
	process.once("SIGINT", () => client.stop("SIGINT"));
	process.once("SIGTERM", () => client.stop("SIGTERM"));
};
