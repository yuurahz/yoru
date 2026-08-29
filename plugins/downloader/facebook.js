const fb = require("../../system/scrapers/facebook");

module.exports = {
	help: ["facebook"],
	category: "downloader",
	command: /^f(ace(book(dl)?|dl)|b(dl)?)$/i,
	desc: "Download media from Facebook.",
	run: async (m, { func }) => {
		if (!m.text || !func.isUrl(m.text))
			return m.reply(func.example(m.prefix, m.command, "link"));

		const loadingMsg = await m.reply(mess.wait);

		try {
			const data = await fb.download(m.text.trim());

			if (data.type === "video" && data.video) {
				const quality = data.hd ? "HD" : "SD";
				const caption = `› *Quality:* ${quality}\n› *Title:* ${data.title || "Facebook Video"}`;
				await m.sendMedia(m.chat, data.video, {
					type: "video",
					caption,
				});
			} else if (data.type === "image" && data.images?.length > 0) {
				for (let i = 0; i < data.images.length; i++) {
					await m.sendMedia(m.chat, data.images[i], {
						type: "photo",
						caption:
							i === 0 ? `› *Title:* ${data.title}` : undefined,
					});
					if (i < data.images.length - 1) await func.delay(1500);
				}
			} else {
				throw new Error("No media found in Facebook URL.");
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
