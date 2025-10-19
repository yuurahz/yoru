const axios = require("axios");
const NodeID3 = require("node-id3");

module.exports = {
	help: ["tiktok"],
	category: "downloader",
	command: /^t(ikt(ok(dl)?|dl)|t(dl)?)$/i,
	desc: "Downloads TikTok videos or images with audio metadata.",
	run: async (m, { func, api }) => {
		if (!m.text || !func.isUrl(m.text))
			return m.reply("Please provide a valid TikTok URL.");

		const loadingMsg = await m.reply(mess.wait);

		try {
			const apiResponse = await func.fetchJson(
				api("yosh", "/d/tiktok", { url: m.text })
			);
			const data = apiResponse.result.data;
			if (!data) throw new Error("Failed to fetch media from the URL.");

			const caption = [
				`› Author: @${data.author.nickname}`,
				`› Likes: ${func.formatNumber(data.digg_count)}`,
				`› Comments: ${func.formatNumber(data.comment_count)}`,
				`\n${data.title || ""}`,
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

				if (data.music && data.music_info) {
					const [audioBuffer, coverBuffer] = await Promise.all([
						axios
							.get(data.music, { responseType: "arraybuffer" })
							.then((res) => res.data),
						axios
							.get(data.music_info.cover, {
								responseType: "arraybuffer",
							})
							.then((res) => res.data),
					]);

					const tags = {
						title: data.music_info.title,
						artist: data.music_info.author,
						album: "TikTok",
						APIC: coverBuffer,
					};
					const taggedBuffer = NodeID3.write(tags, audioBuffer);

					await m.sendMedia(m.chat, taggedBuffer, {
						type: "audio",
						filename: `${data.music_info.title} - ${data.music_info.author}.mp3`,
					});
				}
			} else {
				await m.sendMedia(m.chat, data.play, {
					type: "video",
					caption,
					parse_mode: "HTML",
				});
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
