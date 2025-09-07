const yts = require("yt-search");

module.exports = {
	help: ["ytsearch"],
	category: "internet",
	command: /^(yts|ytsearch)$/i,
	desc: "Searches for videos on YouTube.",
	run: async (m, { client, func }) => {
		if (!m.text) {
			return m.reply(
				"Please provide a search query.\nExample: `/ytsearch Alan Walker`"
			);
		}

		const loadingMsg = await m.reply(mess.wait);

		try {
			const search = await yts(m.text);
			const videos = search.videos.slice(0, 10);

			if (!videos.length) {
				return m.reply("No videos found for that query.");
			}

			let responseText = `*🎗️Search Results for "${m.text}"*\n\n`;

			videos.forEach((v, index) => {
				responseText += `*${index + 1}. ${v.title}*\n`;
				responseText += `› _Duration:_ ${v.timestamp}\n`;
				responseText += `› _Channel:_ ${v.author.name}\n`;
				responseText += `› _Link:_ [Watch on YouTube](${v.url})\n\n`;
			});

			await m.reply(responseText, { disable_web_page_preview: true });
		} catch (e) {
			console.error(e);
			return m.reply(mess.error);
		} finally {
			m.delete(loadingMsg);
		}
	},
	limit: 1,
};
