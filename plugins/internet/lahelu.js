const lahelu = require("../../system/scrapers/lahelu");

module.exports = {
	help: ["meme"],
	category: "internet",
	command: /^(meme|lahelu)$/i,
	desc: "Getting random memes from the internet",
	run: async (m) => {
		try {
			const meme = await lahelu.getRandomMeme();
			if (!meme) return m.reply("No memes found!");

			const caption = `*${meme.title}*\n\n👤 By: ${meme.author}\n👍 ${meme.stats.upvotes} | 👎 ${meme.stats.downvotes} | 💬 ${meme.stats.comments}\n\n#${meme.hashtags.join(" #")}`;

			const buttons = {
				reply_markup: {
					inline_keyboard: [
						[{ text: "🔄 Next Meme", callback_data: "next_meme" }],
					],
				},
			};

			if (meme.type === "video") {
				await m.sendMedia(m.chat, meme.media, {
					type: "video",
					caption,
					...buttons,
				});
			} else if (meme.media) {
				await m.sendMedia(m.chat, meme.media, {
					type: "photo",
					caption,
					...buttons,
				});
			} else {
				await m.reply(caption);
			}
		} catch (e) {
			console.error(e);
			return m.reply("Failed to take meme, try again later!");
		}
	},

	callback: async (m) => {
		if (!m.isCallback) return;
		if (!m.callbackData?.startsWith("next_")) return;
		if (m.callbackData === "next_meme") {
			try {
				const meme = await lahelu.getRandomMeme();
				if (!meme) return m.edit("No memes found!");

				const caption = `*${meme.title}*\n\n👤 By: ${meme.author}\n👍 ${meme.stats.upvotes} | 👎 ${meme.stats.downvotes} | 💬 ${meme.stats.comments}\n\n#${meme.hashtags.join(" #")}`;

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

				if (meme.type === "video") {
					await m.edit(
						{
							type: "video",
							media: meme.media,
							caption,
						},
						buttons
					);
				} else if (meme.media) {
					await m.edit(
						{
							type: "photo",
							media: meme.media,
							caption,
						},
						buttons
					);
				} else {
					await m.edit(caption);
				}
			} catch (e) {
				console.error(e);
				m.edit("Failed to take the next meme!");
			}
		}
	},
	limit: 1,
};
