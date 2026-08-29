const ig = require("../../system/scrapers/instagram");

module.exports = {
	help: ["instagram"],
	category: "downloader",
	command: /^i(nsta(gram(dl)?|dl)|g(dl)?)$/i,
	desc: "Downloads Instagram media.",
	run: async (m, { func }) => {
		if (!m.text || !func.isUrl(m.text))
			return m.reply("Please provide a valid Instagram URL.");

		const loadingMsg = await m.reply(mess.wait);

		try {
			const res = await ig.download(m.text.trim());
			const mediaList = res?.media || [];

			if (!mediaList.length) {
				throw new Error(
					"No downloadable media found. Ensure the post is public."
				);
			}

			const caption = res.caption
				? `› *Caption:* ${res.caption.slice(0, 200)}...`
				: `› *Source:* ${m.text.trim()}`;

			for (let i = 0; i < mediaList.length; i++) {
				const item = mediaList[i];
				const isVideo =
					item.type === "video" || item.url?.includes(".mp4");
				await m.sendMedia(m.chat, item.url, {
					type: isVideo ? "video" : "photo",
					caption: i === 0 ? caption : undefined,
				});
				if (i < mediaList.length - 1) await func.delay(1500);
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
