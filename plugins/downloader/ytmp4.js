const ytdlp = require("../../system/scrapers/ytdlp");
const yts = require("yt-search");

module.exports = {
	help: ["ytmp4"],
	category: "downloader",
	command: /^(ytmp4|ytv)$/i,
	desc: "Searches and downloads video from YouTube.",
	run: async (m, { func }) => {
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
				if (!search.videos.length) return m.reply("Video not found.");
				videoInfo = search.videos[0];
			}

			const dl = await ytdlp.download(videoInfo.url, "video");

			const caption = [
				`*${videoInfo.title}*`,
				"",
				`*› Channel:* ${videoInfo.author?.name || "-"}`,
				`*› Views:* ${func.formatNumber(videoInfo.views || 0)}`,
			].join("\n");

			await m.sendMedia(m.chat, dl.buffer, {
				type: "video",
				filename: `${videoInfo.title || "video"}.mp4`,
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
