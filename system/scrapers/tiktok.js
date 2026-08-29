const axios = require("axios");
const NodeID3 = require("node-id3");

async function downloadTiktok(url) {
	if (!url?.trim()) throw new Error("TikTok URL is required.");

	const res = await fetch("https://tikwm.com/api/", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: `url=${encodeURIComponent(url.trim())}`,
	});
	const apiResponse = await res.json();
	const data = apiResponse.data;
	if (!data) {
		throw new Error(
			apiResponse.msg || "Failed to fetch media from TikTok URL."
		);
	}

	let audioBuffer = null;
	if (data.music) {
		const [rawAudio, coverBuffer] = await Promise.all([
			axios
				.get(data.music, { responseType: "arraybuffer" })
				.then((r) => r.data)
				.catch(() => null),
			data.music_info?.cover
				? axios
						.get(data.music_info.cover, {
							responseType: "arraybuffer",
						})
						.then((r) => r.data)
						.catch(() => null)
				: null,
		]);

		if (rawAudio) {
			const tags = {
				title: data.music_info?.title || "TikTok Audio",
				artist: data.music_info?.author || "TikTok",
				album: "TikTok",
				...(coverBuffer ? { APIC: coverBuffer } : {}),
			};
			audioBuffer = NodeID3.write(tags, rawAudio);
		}
	}

	return {
		title: data.title || "",
		author: {
			nickname: data.author?.nickname || "tiktok",
			unique_id: data.author?.unique_id || "",
			avatar: data.author?.avatar || "",
		},
		stats: {
			likes: data.digg_count || 0,
			comments: data.comment_count || 0,
			shares: data.share_count || 0,
			views: data.play_count || 0,
		},
		video: data.play || null,
		images: data.images || [],
		audio: audioBuffer,
		audioMeta: data.music_info || null,
	};
}

module.exports = {
	download: downloadTiktok,
};
