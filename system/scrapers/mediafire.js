const { basename, extname } = require("node:path");

class Mediafire {
	async get(url) {
		const link = url.trim();
		if (!/^https?:\/\/(?:[\w-]+\.)*mediafire\.com\/.+/i.test(link)) {
			throw new Error("URL must be a MediaFire link (*.mediafire.com).");
		}

		const res = await fetch(link, {
			headers: {
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const html = await res.text();

		const titleMatch = html.match(
			/<meta\s+property="og:title"\s+content="([^"]+)"/i
		);
		const title = titleMatch ? titleMatch[1] : "Unknown";

		const sizeMatch = html.match(/Download\s*\(([\d.]+\s*[KMGT]?B)\)/i);
		const size = sizeMatch ? sizeMatch[1] : "Unknown";

		const dlMatch = html.match(/href="(https?:\/\/download[^"]+)"/i);
		if (!dlMatch) throw new Error("Download URL not found.");

		const dl = dlMatch[1];
		return {
			name: title,
			filename: basename(dl),
			type: extname(dl),
			size,
			download: dl,
		};
	}
}

module.exports = new Mediafire();
