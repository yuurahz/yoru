const axios = require("axios");

function extractGdriveId(url) {
	if (!url) return null;
	const m = url.match(/(?:id=|\/d\/|\/file\/d\/)([a-zA-Z0-9_-]{15,})/i);
	return m ? m[1] : null;
}

async function downloadGdrive(url) {
	const id = extractGdriveId(url);
	if (!id) {
		throw new Error("Invalid Google Drive URL or File ID.");
	}

	const dlUrl = `https://drive.google.com/uc?export=download&id=${id}`;
	const res = await axios.get(dlUrl, {
		maxRedirects: 5,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
		},
		validateStatus: () => true,
		timeout: 20000,
	});

	let finalUrl = dlUrl;
	let fileName = "gdrive_file";

	const confirmMatch =
		typeof res.data === "string" &&
		res.data.match(/confirm=([0-9A-Za-z_]+)/);
	if (confirmMatch) {
		finalUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${id}`;
	}

	const cd = res.headers["content-disposition"];
	if (cd) {
		const fnMatch = cd.match(/filename="?([^";]+)"?/);
		if (fnMatch) {
			fileName = fnMatch[1];
		}
	}

	return {
		id,
		downloadUrl: finalUrl,
		fileName,
	};
}

module.exports = {
	download: downloadGdrive,
	extractId: extractGdriveId,
};
