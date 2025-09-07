module.exports = {
	help: ["instagram"],
	category: "downloader",
	command: /^i(nsta(gram(dl)?|dl)|g(dl)?)$/i,
	desc: "Downloads Instagram media.",
	run: async (m, { func, api }) => {
		if (!m.text || !func.isUrl(m.text))
			return m.reply("Please provide a valid Instagram URL.");

		const loadingMsg = await m.reply(mess.wait);

		try {
			const apiResponse = await func.fetchJson(
				api("gratis", "/downloader/instagram", { url: m.text })
			);
			if (!apiResponse.status)
				throw new Error(
					apiResponse.message || "Failed to fetch content from API."
				);

			const result = apiResponse.result;
			if (!result.urls?.length)
				throw new Error("No media found in the provided URL.");

			const meta = result.meta;
			const caption = [
				`› Author: @${meta?.username || ""}`,
				`› Likes: ${func.formatNumber(meta?.like_count || 0)}`,
				`\n${meta?.title || ""}`,
			].join("\n");

			for (let i = 0; i < result.urls.length; i++) {
				const media = result.urls[i];
				await m.sendMedia(m.chat, media.url, {
					type: media.type === "mp4" ? "video" : "photo",
					caption: i === 0 ? caption : undefined,
					parse_mode: "HTML",
				});
				await func.delay(1500);
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
