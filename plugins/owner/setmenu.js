module.exports = {
	help: "setmenu",
	category: "owner",
	command: /^(setmenu)$/i,
	run: async (m, { func, setting }) => {
		try {
			if (!m.text) return m.reply(func.example(m.prefix, m.command, "2"));
			m.reply(`Successfully use styles *${m.text}*.`).then(
				() => (setting.menu_style = parseInt(m.text))
			);
		} catch (e) {
			return m.reply(func.jsonFormat(e));
		}
	},
	owner: true,
};
