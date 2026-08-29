const lyrics = require("../../system/scrapers/lyrics");

module.exports = {
	help: ["lyrics", "lirik"],
	category: "tools",
	command: /^(lyrics|lirik)$/i,
	desc: "Searches song lyrics from LRCLIB.",
	run: async (m) => {
		if (!m.text) {
			return m.reply(`*~ Example:* ${m.prefix + m.command} yoasobi idol`);
		}

		const loadingMsg = await m.reply(mess.wait);

		try {
			const track = await lyrics.search(m.text.trim());
			if (!track) {
				return m.reply("❌ Lyrics not found for that song.");
			}

			const lyricsText =
				track.plainLyrics ||
				track.syncedLyrics ||
				"No lyrics available.";
			const text = `🎵 *${track.title}*\n👤 *Artist:* ${track.artist}\n💿 *Album:* ${track.album || "-"}\n\n${lyricsText}`;

			if (text.length > 4000) {
				await m.reply(
					text.slice(0, 4000) + "\n\n...(lyrics truncated)"
				);
			} else {
				await m.reply(text);
			}
		} catch (e) {
			console.error(e);
			return m.reply(mess.error);
		} finally {
			m.delete(loadingMsg);
		}
	},
	limit: 1,
};
