const tiktok = require("../../system/scrapers/tiktok");

module.exports = {
	help: ["tiktok"],
	category: "downloader",
	command: /^t(ikt(ok(dl)?|dl)|t(dl)?)$/i,
	desc: "Downloads TikTok videos or images with audio metadata.",
	run: async (m, { func }) => {
		if (!m.text || !func.isUrl(m.text))
			return m.reply("Please provide a valid TikTok URL.");

		const loadingMsg = await m.reply(mess.wait);

		try {
			const data = await tiktok.download(m.text.trim());

			const caption = [
				`› *Author:* @${data.author.nickname}`,
				`› *Likes:* ${func.formatNumber(data.stats.likes)}`,
				`› *Comments:* ${func.formatNumber(data.stats.comments)}`,
				`\n${data.title}`,
			].join("\n");

			if (data.images?.length > 0) {
				for (let i = 0; i < data.images.length; i++) {
					await m.sendMedia(m.chat, data.images[i], {
						type: "photo",
						caption: i === 0 ? caption : undefined,
						parse_mode: "HTML",
					});
					if (i < data.images.length - 1) await func.delay(1500);
				}

				if (data.audio) {
					await m.sendMedia(m.chat, data.audio, {
						type: "audio",
						filename: `${data.audioMeta?.title || "Audio"} - ${data.audioMeta?.author || "TikTok"}.mp3`,
					});
				}
			} else if (data.video) {
				await m.sendMedia(m.chat, data.video, {
					type: "video",
					caption,
					parse_mode: "HTML",
				});
			} else {
				throw new Error("No media found in the response.");
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
