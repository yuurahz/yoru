const threads = require("../../system/scrapers/threads");

module.exports = {
	help: ["threads"],
	category: "downloader",
	command: /^(threads|th)$/i,
	desc: "Downloads media from Instagram Threads.",
	run: async (m, { func }) => {
		if (!m.text || !func.isUrl(m.text)) {
			return m.reply(
				`*~ Example:* ${m.prefix + m.command} https://www.threads.net/@user/post/...`
			);
		}

		const loadingMsg = await m.reply(mess.wait);

		try {
			const data = await threads.download(m.text.trim());
			const caption = data.caption ? `› ${data.caption}` : undefined;

			for (let i = 0; i < data.media.length; i++) {
				const mediaUrl = data.media[i];
				const isVideo = mediaUrl.includes(".mp4");
				await m.sendMedia(m.chat, mediaUrl, {
					type: isVideo ? "video" : "photo",
					caption: i === 0 ? caption : undefined,
				});
				if (i < data.media.length - 1) await func.delay(1500);
			}
		} catch (e) {
			console.error(e);
			return m.reply(e.message || mess.error);
		} finally {
			m.delete(loadingMsg);
		}
	},
	limit: 1,
};
