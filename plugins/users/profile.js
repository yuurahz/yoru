const moment = require("moment-timezone");
const levelling = require("@system/levelling");

function makeProgressBar(value, max, length = 20) {
	let percent = Math.min(value / max, 1);
	let filled = Math.round(percent * length);
	let empty = length - filled;
	return (
		"█".repeat(filled) +
		"─".repeat(empty) +
		` ${Math.round(percent * 100)}%`
	);
}

module.exports = {
	help: ["profile"],
	category: "user",
	command: /^(profile|cekprofil|me)$/i,
	run: async (m) => {
		let target =
			m.mentions && m.mentions[0]
				? m.mentions[0]
				: m.quoted
					? m.quoted.sender
					: m.sender;

		let user = global.db.users[target];
		if (!user) return m.reply("❌ User not found in database.");
		if (!user.registered)
			return m.reply("❌ That user is not registered yet!");

		const formatDate = (ts) =>
			ts
				? moment(ts).tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss")
				: "-";

		const multiplier = process.env.LEVEL_MULTIPLIER;
		const { min, xp, max } = levelling.xpRange(user.level, multiplier);

		let progressBar = makeProgressBar(user.exp - min, xp);

		let profile =
			`👤 *User Profile*\n\n` +
			`🆔 Name: *${user.name}*\n` +
			`🎂 Age: *${user.age} years*\n` +
			`📅 Registered on: *${formatDate(user.regis_time)}*\n` +
			`⏳ Last Seen: *${formatDate(user.lastseen)}*\n\n` +
			`📊 *Stats*\n` +
			`› Exp: *${(user.exp - min).toLocaleString()} / ${xp.toLocaleString()}*\n` +
			`› Level: *${user.level}*\n` +
			`› Role: *${user.role}*\n` +
			`› Progress: [${progressBar}]\n` +
			`› Limit: *${user.limit}*\n` +
			`› Money: *${user.money.toLocaleString()}*\n` +
			`› Warn: *${m.isGroup ? (typeof global.db.groups[m.chat].member[target] != "undefined" ? global.db.groups[m.chat].member[target].warn : 0) + " / 5" : user.warn + " / 5"}*\n\n` +
			`⚙️ *Status*\n` +
			`› Premium: *${user.premium ? "Yes" : "No"}*\n` +
			`› Banned: *${user.banned ? "Yes" : "No"}*\n` +
			`› AFK: *${user.afk > -1 ? "Yes" : "No"}* ${user.afkReason ? `(_${user.afkReason}_)` : ""}`;

		return m.reply(profile);
	},
};
