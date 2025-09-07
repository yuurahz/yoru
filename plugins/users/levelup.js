const Component = require("@yoshx/func").default;
const { levelling } = new Component();

module.exports = {
	help: ["levelup"],
	category: "user",
	command: /^level(|up)|lvl(|up)$/i,
	run: async (m, { users }) => {
		const multiplier = process.env.LEVEL_MULTIPLIER;

		if (!levelling.canLevelUp(users.level, users.exp, multiplier)) {
			const { min, xp, max } = levelling.xpRange(users.level, multiplier);
			return m.reply(
				`📊 *Level Info*\n\n` +
					`› Current Level: *${users.level}*\n` +
					`› Exp: *${users.exp - min}/${xp}*\n` +
					`› Next Level in: *${max - users.exp} exp*`
			);
		}

		const before = users.level;
		while (levelling.canLevelUp(users.level, users.exp, multiplier)) {
			users.level++;
		}

		if (before !== users.level) {
			let role;
			const lvl = users.level;
			if (lvl <= 3) role = "Warrior V";
			else if (lvl <= 6) role = "Warrior IV";
			else if (lvl <= 9) role = "Warrior III";
			else if (lvl <= 12) role = "Warrior II";
			else if (lvl <= 15) role = "Warrior I";
			else if (lvl <= 18) role = "Elite V";
			else if (lvl <= 21) role = "Elite IV";
			else if (lvl <= 24) role = "Elite III";
			else if (lvl <= 27) role = "Elite II";
			else if (lvl <= 30) role = "Elite I";
			else if (lvl <= 33) role = "Master V";
			else if (lvl <= 36) role = "Master IV";
			else if (lvl <= 39) role = "Master III";
			else if (lvl <= 42) role = "Master II";
			else if (lvl <= 45) role = "Master I";
			else if (lvl <= 48) role = "Grand Master V";
			else if (lvl <= 51) role = "Grand Master IV";
			else if (lvl <= 54) role = "Grand Master III";
			else if (lvl <= 57) role = "Grand Master II";
			else if (lvl <= 60) role = "Grand Master I";
			else if (lvl <= 63) role = "Epic V";
			else if (lvl <= 66) role = "Epic IV";
			else if (lvl <= 69) role = "Epic III";
			else if (lvl <= 71) role = "Epic II";
			else if (lvl <= 74) role = "Epic I";
			else if (lvl <= 77) role = "Legend V";
			else if (lvl <= 80) role = "Legend IV";
			else if (lvl <= 83) role = "Legend III";
			else if (lvl <= 86) role = "Legend II";
			else if (lvl <= 89) role = "Legend I";
			else if (lvl <= 91) role = "Mythic V";
			else if (lvl <= 94) role = "Mythic IV";
			else if (lvl <= 97) role = "Mythic III";
			else if (lvl <= 100) role = "Mythic II";
			else if (lvl <= 105) role = "Mythic I";
			else if (lvl <= 185) role = "Mythical Honor";
			else if (lvl <= 400) role = "Mythical Glory";
			else role = "Mythical Immortal";

			users.role = role;

			return m.reply(
				`🎉 *Congratulations!*\n\n` +
					`You leveled up from *${before}* → *${users.level}*\n` +
					`🏅 New Role: *${users.role}*`
			);
		}
	},
	register: true,
};
