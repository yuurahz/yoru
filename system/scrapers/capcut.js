const axios = require("axios");

async function downloadCapcut(url) {
	let targetUrl = url;
	try {
		const head = await axios.get(url, {
			maxRedirects: 5,
			timeout: 10000,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});
		if (head.request?.res?.responseUrl) {
			targetUrl = head.request.res.responseUrl;
		}
	} catch {}

	const { data } = await axios.post(
		"https://3bic.com/api/download",
		{ url: targetUrl },
		{
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Referer: "https://3bic.com/",
				Origin: "https://3bic.com",
				"Content-Type": "application/json",
			},
			timeout: 20000,
		}
	);

	if (data.code !== 200 || !data.originalVideoUrl) {
		throw new Error(data.message || "Failed to fetch CapCut video.");
	}

	let videoUrl = data.originalVideoUrl;
	if (videoUrl.startsWith("/api/cdn/")) {
		const b64 = videoUrl.replace(/^\/api\/cdn\//, "");
		videoUrl = Buffer.from(b64, "base64").toString("utf8");
	}

	return {
		title: data.title || "CapCut Video",
		author: data.authorName || "Unknown",
		cover: data.coverUrl,
		videoUrl,
	};
}

module.exports = {
	download: downloadCapcut,
};
