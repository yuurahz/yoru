const yts = require("yt-search");
const axios = require("axios");
const NodeID3 = require("node-id3");

module.exports = {
	help: ["ytmp3", "play"],
	category: "downloader",
	command: /^(ytmp3|play)$/i,
	desc: "Downloads audio from YouTube with full metadata.",
	run: async (m, { func, client, api }) => {
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
				if (!search.videos.length) return m.reply("Audio not found.");
				videoInfo = search.videos[0];
			}

			const { data: apiData } = await axios.get(
				api("yosh", "/downloader/youtube", {
					url: videoInfo.url,
					type: "mp3",
				})
			);
			if (!apiData.result?.url)
				throw new Error("Failed to get download link from API.");

			const [audioBuffer, thumbnailBuffer] = await Promise.all([
				axios
					.get(apiData.result.url, { responseType: "arraybuffer" })
					.then((res) => res.data),
				axios
					.get(videoInfo.thumbnail, { responseType: "arraybuffer" })
					.then((res) => res.data),
			]);

			const tags = {
				title: videoInfo.title,
				artist: videoInfo.author.name,
				album: "YouTube",
				APIC: thumbnailBuffer,
				comment: { text: `Downloaded by ${client.botInfo.first_name}` },
			};
			const taggedBuffer = NodeID3.write(tags, audioBuffer);

			const caption = `*${videoInfo.title}*\n› _By: ${videoInfo.author.name}_`;
			const fileName = `${videoInfo.title}.mp3`;

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
