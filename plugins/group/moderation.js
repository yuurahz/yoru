module.exports = {
	help: ["kick", "add", "ban", "unban", "mute", "unmute", "warn", "warns"],
	category: "group",
	desc: "Group moderations",
	command: /^(kick|add|ban|unban|mute|unmute|warn|warns)$/i,
	run: async (m, { client }) => {
		const cmd = m.command;
		const target =
			m.quoted?.sender || m.args[0]?.replace(/[@+]/g, "") || null;

		if (!target && ["kick", "add", "ban", "unban", "warn"].includes(cmd)) {
			return m.reply(`Usage: /${cmd} <user/reply>`);
		}

		switch (cmd) {
			case "kick":
				try {
					await client.telegram.kickChatMember(m.chat, target);
					await m.reply(`User ${target} has been kicked.`);
				} catch (e) {
					m.reply("Failed kick user: " + e.message);
				}
				break;

			case "add":
				try {
					await client.telegram.unbanChatMember(m.chat, target);
					await client.telegram.inviteToChat(m.chat, [target]);
					await m.reply(`User ${target} has been added.`);
				} catch (e) {
					m.reply("Failed add user: " + e.message);
				}
				break;

			case "ban":
				global.db.users[target].banned = true;
				await m.reply(`User ${target} banned from bots.`);
				break;

			case "unban":
				global.db.users[target].banned = false;
				await m.reply(`User ${target} unbanned from bot.`);
				break;

			case "mute":
				global.db.groups[m.chat].muted = true;
				await m.reply("This group has been muted by admin.");
				break;

			case "unmute":
				global.db.groups[m.chat].muted = false;
				await m.reply("This group has been unmuted by admin.");
				break;

			case "warn":
				(global.db.groups[m.chat].member[target].warn || 0) + 1;
				const count = global.db.groups[m.chat].member[target].warn;
				await m.reply(
					`User ${target} given a warning. Total warning: ${count}`
				);

				if (count >= 3) {
					try {
						await client.telegram.kickChatMember(m.chat, target);
						await m.reply(
							`User ${target} automatically kicked because of 3 warnings.`
						);
						global.db.groups[m.chat].member[target].warn = 0;
					} catch (e) {
						m.reply("Failed kick user: " + e.message);
					}
				}
				break;

			case "warns":
				const warns =
					global.db.groups[m.chat].member[target || m.sender].warn ||
					0;
				await m.reply(
					`User ${target || m.sender} have ${warns} warning.`
				);
				break;
		}
	},
	group: true,
	admin: true,
	botAdmin: true,
};
