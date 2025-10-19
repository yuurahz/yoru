const yts = require("yt-search");
const axios = require("axios");

module.exports = {
	help: ["ytmp4"],
	category: "downloader",
	command: /^(ytmp4|ytv)$/i,
	desc: "Searches and downloads video from YouTube.",
	run: async (m, { func, api }) => {
		if (!m.text)
			return m.reply("Please provide a YouTube URL or search query.");

		const loadingMsg = await m.reply(mess.wait);

		try {
			let videoInfo;
			if (func.isUrl(m.text)) {
				const videoIdMatch = m.text.match(
					/(?:v=|\/)([0-9A-Za-z_-]{11}).*/
				);
				if (!videoIdMatch) return m.reply("Invalid YouTube URL.");
				videoInfo = await yts({ videoId: videoIdMatch[1] });
			} else {
				const search = await yts(m.text);
				if (!search.videos.length) return m.reply("Video not found.");
				videoInfo = search.videos[0];
			}

			const { data: apiData } = await axios.get(
				api("yosh", "/d/youtube", {
					url: videoInfo.url,
					type: "mp4",
				})
			);
			if (!apiData.result?.url)
				throw new Error("Failed to get download link from API.");

			const result = apiData.result;
			const caption = [
				`*${result.title}*`,
				"",
				`*› Channel:* ${videoInfo.author.name}`,
				`*› Views:* ${func.formatNumber(videoInfo.views)}`,
			].join("\n");

			await m.sendMedia(m.chat, result.url, { type: "video", caption });
		} catch (e) {
			console.error(e);
			return m.reply(e.message || mess.error);
		} finally {
			m.delete(loadingMsg);
		}
	},
	limit: 1,
};
