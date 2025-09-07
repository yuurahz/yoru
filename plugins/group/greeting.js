module.exports = {
	help: ["setwelcome", "setleft"],
	category: "group",
	command: /^(setwelcome|setleft)$/i,
	desc: "Greeting message settings (welcome/left)",
	run: async (m, { client, groupSet }) => {
		if (m.command === "setwelcome") {
			if (!m.text)
				return m.reply(
					"Usage: /setwelcome <message>\nUse `@user` to mention user."
				);
			groupSet.welcome_text = m.text;
			return m.reply(`Welcome message changed to:\n\n${m.text}`);
		} else if (m.command === "setleft") {
			if (!m.text)
				return m.reply(
					"Usage: /setleft <message>\nUse `@user` to mention user."
				);
			groupSet.left_text = m.text;
			return m.reply(`The left message is changed to:\n\n${m.text}`);
		}
	},
	group: true,
	admin: true,
	botAdmin: true,
};
