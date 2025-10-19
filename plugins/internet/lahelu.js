module.exports = {
	help: ["meme"],
	category: "internet",
	command: /^(meme|lahelu)$/i,
	desc: "Getting random memes from the internet",
	run: async (m, { client, func, api }) => {
		try {
			const { result } = await func.fetchJson(
				api("yosh", "/r/lahelu")
			);
			if (!result || !result?.length) return m.reply("No memes found!");

			const meme = result[Math.floor(Math.random() * result.length)];

			const caption = `*${meme.title || "No Title"}*\n\n👤 By: ${meme.userUsername}\n👍 ${meme.totalUpvotes} | 👎 ${meme.totalDownvotes} | 💬 ${meme.totalComments}\n\n#${(meme.hashtags || []).join(" #")}`;

			const buttons = {
				reply_markup: {
					inline_keyboard: [
						[{ text: "🔄 Next Meme", callback_data: "next_meme" }],
					],
				},
			};

			if (meme.mediaType === 0) {
				await m.sendMedia(m.chat, meme.media, {
					type: "photo",
					caption,
					...buttons,
				});
			} else if (meme.mediaType === 1) {
				await m.sendMedia(m.chat, meme.media, {
					type: "video",
					caption,
					...buttons,
				});
			} else {
				await m.reply(caption + `\n\n🔗 ${meme.media}`);
			}
		} catch (e) {
			console.error(e);
			return m.reply("Failed to take meme, try again later!");
		}
	},

	callback: async (m, { client, func, api }) => {
		if (!m.isCallback) return;
		if (!m.callbackData.startsWith("next_")) return;
		if (m.callbackData === "next_meme") {
			try {
				const { result } = await func.fetchJson(
					api("yosh", "/random/lahelu")
				);
				if (!result || !result?.length)
					return m.edit("No memes found!");

				const meme = result[Math.floor(Math.random() * result.length)];

				const caption = `*${meme.title || "No Title"}*\n\n👤 By: ${meme.userUsername}\n👍 ${meme.totalUpvotes} | 👎 ${meme.totalDownvotes} | 💬 ${meme.totalComments}\n\n#${(meme.hashtags || []).join(" #")}`;

				const buttons = {
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "🔄 Next Meme",
									callback_data: "next_meme",
								},
							],
						],
					},
				};

				if (meme.mediaType === 0) {
					await m.edit(
						{
							type: "photo",
							media: meme.media,
							caption,
						},
						buttons
					);
				} else if (meme.mediaType === 1) {
					await m.edit(
						{
							type: "video",
							media: meme.media,
							caption,
						},
						buttons
					);
				} else {
					await m.edit(caption + `\n\n🔗 ${meme.media}`);
				}
			} catch (e) {
				console.error(e);
				m.edit("Failed to take the next meme!");
			}
		}
	},
	limit: 1,
};
