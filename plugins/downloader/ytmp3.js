const ytdlp = require("../../system/scrapers/ytdlp");
const yts = require("yt-search");
const axios = require("axios");
const NodeID3 = require("node-id3");

module.exports = {
	help: ["ytmp3", "play"],
	category: "downloader",
	command: /^(ytmp3|play)$/i,
	desc: "Downloads audio from YouTube with full metadata.",
	run: async (m, { func, client }) => {
		if (!m.text)
			return m.reply("Please provide a YouTube URL or search query.");

		const loadingMsg = await m.reply(mess.wait);

		try {
			let videoInfo;
			if (func.isUrl(m.text)) {
				const videoIdMatch = m.text.match(
					/(?:v=|\/)([0-9A-Za-z_-]{11})/
				);
				if (!videoIdMatch) return m.reply("Invalid YouTube URL.");
				videoInfo = await yts({ videoId: videoIdMatch[1] });
			} else {
				const search = await yts(m.text);
				if (!search.videos.length) return m.reply("Audio not found.");
				videoInfo = search.videos[0];
			}

			const dl = await ytdlp.download(videoInfo.url, "audio");

			let thumbnailBuffer = null;
			if (videoInfo.thumbnail) {
				thumbnailBuffer = await axios
					.get(videoInfo.thumbnail, { responseType: "arraybuffer" })
					.then((res) => res.data)
					.catch(() => null);
			}

			const tags = {
				title: videoInfo.title,
				artist: videoInfo.author?.name || "YouTube",
				album: "YouTube",
				...(thumbnailBuffer ? { APIC: thumbnailBuffer } : {}),
				comment: {
					text: `Downloaded by ${client.botInfo?.first_name || "Bot"}`,
				},
			};
			const taggedBuffer = NodeID3.write(tags, dl.buffer);

			const caption = `*${videoInfo.title}*\n› _By: ${videoInfo.author?.name || "-"}_`;
			const fileName = `${videoInfo.title || "audio"}.mp3`;

			await m.sendMedia(m.chat, taggedBuffer, {
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
