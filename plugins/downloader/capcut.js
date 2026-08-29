const capcut = require("../../system/scrapers/capcut");

module.exports = {
	help: ["capcut", "cc"],
	category: "downloader",
	command: /^(capcut|cc)$/i,
	desc: "Downloads CapCut template videos without watermark.",
	run: async (m, { func }) => {
		if (!m.text || !func.isUrl(m.text)) {
			return m.reply(
				`*~ Example:* ${m.prefix + m.command} https://www.capcut.com/t/...`
			);
		}

		const loadingMsg = await m.reply(mess.wait);

		try {
			const data = await capcut.download(m.text.trim());
			const caption = `🎬 *${data.title}*\n👤 *Author:* ${data.author}`;

			await m.sendMedia(m.chat, data.videoUrl, {
				type: "video",
				caption,
			});
		} catch (e) {
			console.error(e);
			return m.reply(e.message || mess.error);
		} finally {
			m.delete(loadingMsg);
		}
	},
	limit: 1,
};
