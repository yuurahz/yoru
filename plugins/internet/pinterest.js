module.exports = {
	help: ["pinterest"],
	category: "internet",
	command: /^(pinterest|pin)$/i,
	desc: "Searches for images on Pinterest.",
	run: async (m, { client, func, api }) => {
		if (!m.text) {
			return m.reply(
				`*~ Example:* ${m.prefix + m.command} anime\n\n*options:*\n${m.prefix + m.command} *<query>*\n\`search an ${m.command} image with query.\`\n${m.prefix + m.command} *<query> --<amount>*\n\`search an ${m.command} image with the specified amount (max 10 images).\``
			);
		}

		const loadingMsg = await m.reply(mess.wait);

		try {
			let input = m.text.trim();
			let numberOfImages = 1;
			let searchQuery = input;

			const numberFlagMatch = input.match(/--(\d+)$/);
			if (numberFlagMatch) {
				numberOfImages = parseInt(numberFlagMatch[1]);
				searchQuery = input.replace(/--\d+$/, "").trim();

				if (numberOfImages > 10) {
					numberOfImages = 10;
					m.reply(
						func.texted(
							"bold",
							"Maximum 10 images allowed. Downloading 10 images..."
						)
					);
				}
				if (numberOfImages < 1) {
					numberOfImages = 1;
				}
			}

			const { result } = await func.fetchJson(
				api("yosh", "/i/pinterest", { query: searchQuery })
			);
			if (Object.values(result).length < 1) {
				return m.reply(mess.notfound);
			}

			let selectedImages = [];
			let availableResults = Object.values(result);

			for (
				let i = 0;
				i < numberOfImages && i < availableResults.length;
				i++
			) {
				let randomImage = func.random(availableResults);
				selectedImages.push(randomImage);
				availableResults = availableResults.filter(
					(img) => img !== randomImage
				);
			}

			for (let i = 0; i < selectedImages.length; i++) {
				const hasil = selectedImages[i];

				await m.sendMedia(m.chat, hasil.image, { type: "photo" });

				if (i < selectedImages.length - 1) {
					await new Promise((resolve) => setTimeout(resolve, 1500));
				}
			}

			if (selectedImages.length > 1) {
				m.reply(
					`Successfully downloaded *${selectedImages.length}* Pinterest images for *${searchQuery}*`
				);
			}
		} catch (e) {
			console.log(e);
			return m.reply(mess.eror);
		} finally {
			m.delete(loadingMsg);
		}
	},
	limit: 1,
};
