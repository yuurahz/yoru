module.exports = {
	help: ["facebook"],
	category: "downloader",
	command: /^f(ace(book(dl)?|dl)|b(dl)?)$/i,
	desc: "Download media from facebook.",
	run: async (m, { func, api }) => {
		if (!m.text || !func.isUrl(m.text))
			return m.reply(func.example(m.prefix, m.command, "link"));

		const loadingMsg = await m.reply(mess.wait);

		try {
			const data = await func.fetchJson(
				api("yosh", "/downloader/facebook", { url: m.text })
			);
			if (!data.status) return m.reply(mess.wrong);

			let caption = `› *${data.result.type === "video" ? "Video" : "Post"} Facebook.*\n`;
			caption += `› *Title:* ${data.result.title || "Facebook"}\n`;
			caption += `› *Source:* ${data.result.url}\n`;
			if (data.result.externalUrl)
				caption += `› *External URL:* ${data.result.externalUrl}\n`;

			if (data.result.comments?.length > 0) {
				caption += "\n— *Top Comments:*\n";
				for (const comment of data.result.comments.slice(0, 3)) {
					if (comment.text?.trim())
						caption += `› *${comment.author.name}:* ${comment.text}\n`;
				}
			}

			if (data.result.type === "image" && data.result.image?.length > 0) {
				for (let i = 0; i < data.result.image.length; i++) {
					await m.sendMedia(m.chat, data.result.image[i], {
						caption: i === 0 ? caption.trim() : "",
					});
					await func.delay(1500);
				}
			} else if (
				data.result.type === "video" &&
				(data.result.hd || data.result.sd)
			) {
				const videoUrl = data.result.hd || data.result.sd;
				const quality = data.result.hd ? "HD" : "SD";
				await m.sendMedia(m.chat, videoUrl, {
					type: "video",
					caption: `› *Quality:* ${quality}\n${caption}`,
				});
			}
		} catch (e) {
			console.error(e);
			return m.reply(mess.eror);
		} finally {
			m.delete(loadingMsg);
		}
	},
	limit: 1,
};
