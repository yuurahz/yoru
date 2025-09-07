module.exports = {
	help: ["ping"],
	category: "general",
	command: /^(ping)$/i,
	desc: "Checks bot's response latency.",
	run: async (m, { client }) => {
		const startTime = Date.now();
		const msg = await m.reply("Pong!");
		const latency = Date.now() - startTime;
		await client.telegram.editMessageText(
			m.chat,
			msg.message_id,
			null,
			`Pong! 🏓\n*Latency:* ${latency} ms`,
			{ parse_mode: "Markdown" }
		);
	},
};
