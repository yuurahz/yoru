module.exports = {
	help: "setmsg",
	category: "owner",
	command: /^(setmsg)$/i,
	run: async (m, { func, setting }) => {
		if (!m.text) return m.reply(explain(m.prefix, m.command));
		try {
			setting.msg = m.text;
			m.reply(func.texted("bold", `Menu Message successfully set.`));
		} catch (e) {
			return m.reply(func.jsonFormat(e));
		}
	},
	owner: true,
};

const explain = (prefix, command) => {
	return `Sorry, can't return without text, and this explanation and how to use :

*1.* +tag : for mention sender.
*2.* +greeting : to display greetings by time.
*3.* +database : to display database systems currently in use.

~ *Example* : ${prefix + command} Hi +tag +greeting, i'm an automation system`;
};
