const axios = require("axios");

class Threads {
	UA = "Twitterbot/1.0";

	decode(s) {
		return s
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#x27;/g, "'")
			.replace(/&#39;/g, "'")
			.replace(/&#064;/g, "@")
			.replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
				String.fromCodePoint(parseInt(h, 16))
			)
			.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));
	}

	toEmbed(url) {
		const clean = url.split("?")[0].replace(/\/$/, "");
		return `${clean}/embed/`;
	}

	getMedia(html) {
		const vid = html.match(
			/SingleInnerMediaContainerVideo[\s\S]*?<source\s+src="([^"]+)"/
		);
		if (vid) return [this.decode(vid[1])];

		const carousel = [
			...html.matchAll(
				/MediaScrollImageContainer[\s\S]*?<img[^>]+src="([^"]+)"/g
			),
		];
		if (carousel.length) return carousel.map((m) => this.decode(m[1]));

		const single = html.match(
			/SingleInnerMediaContainer[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/
		);
		if (single) return [this.decode(single[1])];

		return [...html.matchAll(/<img[^>]+src="(https:\/\/scontent[^"]+)"/g)]
			.map((m) => this.decode(m[1]))
			.filter((u) => !u.includes("s100x100") && !u.includes("s150x150"));
	}

	getCaption(html) {
		const idx = html.indexOf('class="BodyTextContainer"');
		if (idx === -1) return null;

		const start = html.indexOf(">", idx) + 1;
		const end = html.indexOf("<div", start);
		const raw = html.slice(start, end > -1 ? end : start + 5000);
		const text = this.decode(raw.replace(/<[^>]+>/g, "").trim());
		return text || null;
	}

	async download(url) {
		if (!url?.trim()) throw new Error("Threads URL is required.");

		const { data: html } = await axios.get(this.toEmbed(url.trim()), {
			headers: {
				"User-Agent": this.UA,
				Accept: "text/html,application/xhtml+xml",
				"Accept-Language": "en-US,en;q=0.9",
			},
			timeout: 15000,
		});

		const media = this.getMedia(html);
		if (!media.length) {
			throw new Error("No media found. Post may be private or invalid.");
		}

		return { media, caption: this.getCaption(html) };
	}
}

module.exports = new Threads();
