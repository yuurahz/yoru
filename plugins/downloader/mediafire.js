const mediafire = require("../../system/scrapers/mediafire");

module.exports = {
	help: ["mediafire", "mf"],
	category: "downloader",
	command: /^(mediafire|mf)$/i,
	desc: "Downloads files directly from MediaFire links.",
	run: async (m, { func }) => {
		if (!m.text || !func.isUrl(m.text)) {
			return m.reply(
				`*~ Example:* ${m.prefix + m.command} https://www.mediafire.com/file/...`
			);
		}

		const loadingMsg = await m.reply(mess.wait);

		try {
			const data = await mediafire.get(m.text.trim());
			const caption = `📁 *${data.name}*\n📦 *Size:* ${data.size}\n🏷️ *Type:* ${data.type || "-"}`;

			await m.sendMedia(m.chat, data.download, {
				type: "document",
				filename: data.filename,
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
