const spotify = require("../../system/scrapers/spotify");
const axios = require("axios");

module.exports = {
	help: ["spotify", "song"],
	category: "downloader",
	command: /^(spotify|song)$/i,
	desc: "Searches or downloads songs from Spotify.",
	run: async (m, { func }) => {
		if (!m.text) {
			return m.reply(
				`*~ Example:*\n• ${m.prefix + m.command} https://open.spotify.com/track/...\n• ${m.prefix + m.command} yoasobi idol`
			);
		}

		const loadingMsg = await m.reply(mess.wait);

		try {
			let targetUrl = m.text.trim();

			if (
				!func.isUrl(targetUrl) ||
				!/open\.spotify\.com/i.test(targetUrl)
			) {
				const searchResults = await spotify.search(targetUrl, {
					limit: 1,
				});
				if (!searchResults.length || !searchResults[0].url) {
					return m.reply("❌ Track not found on Spotify.");
				}
				targetUrl = searchResults[0].url;
			}

			const track = await spotify.download(targetUrl);
			if (!track.downloadUrl) {
				throw new Error(
					"Failed to get audio download URL from Spotify."
				);
			}

			const audioRes = await axios.get(track.downloadUrl, {
				responseType: "arraybuffer",
				timeout: 60000,
			});

			const caption = `🎵 *${track.title}*\n👤 *Artist:* ${track.artist}\n💿 *Album:* ${track.album}`;
			const fileName = `${track.title} - ${track.artist}.mp3`;

			await m.sendMedia(m.chat, Buffer.from(audioRes.data), {
				type: "audio",
				filename: fileName,
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
