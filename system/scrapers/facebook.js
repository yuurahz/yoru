const axios = require("axios");

class Facebook {
	USER_AGENTS = [
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
	];

	get UA() {
		return this.USER_AGENTS[
			Math.floor(Math.random() * this.USER_AGENTS.length)
		];
	}

	VIDEO_HD_PATTERNS = [
		/hd_src:"(https?[^"]+)"/,
		/"hd_src":"(https?[^"]+)"/,
		/hd_src_no_ratelimit:"(https?[^"]+)"/,
		/"hd_src_no_ratelimit":"(https?[^"]+)"/,
		/browser_native_hd_url":"(https?[^"]+)"/,
		/playable_url_quality_hd":"(https?[^"]+)"/,
	];

	VIDEO_SD_PATTERNS = [
		/sd_src:"(https?[^"]+)"/,
		/"sd_src":"(https?[^"]+)"/,
		/sd_src_no_ratelimit:"(https?[^"]+)"/,
		/"sd_src_no_ratelimit":"(https?[^"]+)"/,
		/browser_native_sd_url":"(https?[^"]+)"/,
		/playable_url":"(https?[^"]+)"/,
	];

	decode(str) {
		return str
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
				String.fromCodePoint(Number.parseInt(hex, 16))
			)
			.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
				String.fromCharCode(Number.parseInt(hex, 16))
			)
			.replace(/\\\//g, "/");
	}

	normalize(url) {
		return url
			.replace("m.facebook.com", "www.facebook.com")
			.replace("mbasic.facebook.com", "www.facebook.com")
			.replace("web.facebook.com", "www.facebook.com");
	}

	matchFirst(html, patterns) {
		for (const re of patterns) {
			const m = html.match(re);
			if (m) return this.decode(m[1]);
		}
		return null;
	}

	extractVideo(html) {
		return {
			hd: this.matchFirst(html, this.VIDEO_HD_PATTERNS),
			sd: this.matchFirst(html, this.VIDEO_SD_PATTERNS),
		};
	}

	extractCaption(html) {
		const msgMatch = html.match(
			/"message"\s*:\s*\{\s*"text"\s*:\s*"((?:[^"\\]|\\.)*)"/
		);
		if (msgMatch) {
			return this.decode(
				msgMatch[1]
					.replace(/\\n/g, "\n")
					.replace(/\\"/g, '"')
					.replace(/\\\\/g, "\\")
			);
		}
		const descMatch = html.match(
			/<meta\s+property="og:description"\s+content="([^"]+)"/i
		);
		if (descMatch) return this.decode(descMatch[1]);
		return null;
	}

	extractImages(html) {
		const seen = new Set();
		const images = [];
		const escaped = [
			...html.matchAll(
				/"uri":"(https:\\\/\\\/scontent[^"]+?\.jpg[^"]*)"/g
			),
		];
		for (const m of escaped) {
			const url = m[1].replace(/\\\//g, "/");
			if (!url.includes("/t39.30808-6/")) continue;
			const key = url.match(/\/(\d+_\d+_\d+_n\.jpg)/)?.[1] || url;
			if (seen.has(key)) continue;
			seen.add(key);
			images.push(url);
		}
		return images;
	}

	async download(url) {
		if (!url?.trim()) throw new Error("Facebook URL is required.");
		const normalizedUrl = this.normalize(url.trim());

		const { data: html } = await axios.get(normalizedUrl, {
			headers: {
				"User-Agent": this.UA,
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.9",
			},
			timeout: 15000,
			maxRedirects: 5,
		});

		const title =
			this.extractCaption(html) ||
			(html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
				html.match(/<title>([^<]+)<\/title>/i))?.[1] ||
			"";

		const thumbnail = html.match(
			/<meta\s+property="og:image"\s+content="([^"]+)"/i
		)?.[1];

		const { sd, hd } = this.extractVideo(html);

		if (sd || hd) {
			return {
				type: "video",
				title: title ? this.decode(title) : "",
				thumbnail: thumbnail ? this.decode(thumbnail) : "",
				sd: sd || "",
				hd: hd || "",
				video: hd || sd,
				images: [],
			};
		}

		const images = this.extractImages(html);
		if (images.length > 0) {
			return {
				type: "image",
				title: title ? this.decode(title) : "",
				thumbnail: thumbnail ? this.decode(thumbnail) : "",
				video: "",
				images,
			};
		}

		if (thumbnail) {
			return {
				type: "image",
				title: title ? this.decode(title) : "",
				thumbnail: this.decode(thumbnail),
				video: "",
				images: [this.decode(thumbnail)],
			};
		}

		throw new Error(
			"Could not extract media. Post might be private or URL is invalid."
		);
	}
}

module.exports = new Facebook();
