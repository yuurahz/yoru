const gdrive = require("../../system/scrapers/gdrive");

module.exports = {
	help: ["gdrive", "gd"],
	category: "downloader",
	command: /^(gdrive|gd)$/i,
	desc: "Downloads files directly from Google Drive links.",
	run: async (m, { func }) => {
		if (!m.text || !func.isUrl(m.text)) {
			return m.reply(
				`*~ Example:* ${m.prefix + m.command} https://drive.google.com/file/d/...`
			);
		}

		const loadingMsg = await m.reply(mess.wait);

		try {
			const data = await gdrive.download(m.text.trim());
			const caption = `📁 *Google Drive File*\n🆔 *ID:* \`${data.id}\``;

			await m.sendMedia(m.chat, data.downloadUrl, {
				type: "document",
				filename: data.fileName,
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
