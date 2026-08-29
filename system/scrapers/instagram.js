const axios = require("axios");

class Instagram {
	UA =
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

	extractShortcode(url) {
		return (
			url.match(
				/(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i
			)?.[1] || null
		);
	}

	extractMedia(item) {
		const isVideo =
			item.is_video ||
			item.media_type === 2 ||
			item.__typename === "GraphVideo" ||
			!!item.video_versions?.length;

		if (isVideo) {
			const versions = item.video_versions || [];
			const best = versions.sort(
				(a, b) => (a.type || 0) - (b.type || 0)
			)[0];
			const videoUrl = best?.url || item.video_url || null;
			const imgCandidates = item.image_versions2?.candidates || [];
			const bestThumb = imgCandidates.sort(
				(a, b) => (b.width || 0) - (a.width || 0)
			)[0];
			const thumbnail =
				bestThumb?.url || item.display_url || item.thumbnail_url || "";
			return {
				type: "video",
				url: videoUrl,
				thumbnail,
			};
		}

		const candidates = item.image_versions2?.candidates || [];
		const best = candidates.sort(
			(a, b) => (b.width || 0) - (a.width || 0)
		)[0];
		const imageUrl =
			best?.url || item.display_url || item.thumbnail_url || "";
		return {
			type: "image",
			url: imageUrl,
			thumbnail: imageUrl,
		};
	}

	normalizeItem(item) {
		const isCarousel =
			item.media_type === 8 ||
			item.__typename === "GraphSidecar" ||
			item.__typename === "XIGPolarisCarouselMedia" ||
			!!item.carousel_media?.length ||
			!!item.edge_sidecar_to_children?.edges?.length;

		const owner = item.owner || item.user || {};
		const caption =
			item.edge_media_to_caption?.edges?.[0]?.node?.text ||
			item.caption?.text ||
			(typeof item.caption === "string" ? item.caption : "") ||
			"";

		const media = [];
		if (isCarousel) {
			const children =
				item.carousel_media ||
				item.edge_sidecar_to_children?.edges?.map((e) => e.node) ||
				[];
			for (const child of children) {
				media.push(this.extractMedia(child));
			}
		} else {
			media.push(this.extractMedia(item));
		}

		return {
			shortcode: item.code || "",
			caption,
			author: {
				username: owner.username || "",
				fullName: owner.full_name || "",
			},
			media: media.filter((m) => m.url),
		};
	}

	async fetchViaHtml(shortcode) {
		const res = await axios.get(
			`https://www.instagram.com/p/${shortcode}/`,
			{
				headers: {
					"User-Agent": this.UA,
					Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
					"Accept-Language": "en-US,en;q=0.9",
				},
				timeout: 20000,
				validateStatus: (s) => s < 500,
			}
		);

		const html = res.data;
		if (typeof html !== "string") return null;

		const blocks = [
			...html.matchAll(
				/<script[^>]*data-sjs[^>]*>(\{"require":\[\[.+?)<\/script>/gs
			),
		].map((m) => m[1]);

		for (const block of blocks) {
			if (
				!block.includes("RelayPrefetchedStreamCache") ||
				!block.includes("xig_polaris")
			) {
				continue;
			}

			try {
				const json = JSON.parse(block);
				const bbox = json?.require?.[0]?.[3]?.[0]?.__bbox;
				if (!bbox?.require) continue;

				for (const req of bbox.require) {
					if (req[0] !== "RelayPrefetchedStreamCache") continue;
					const inner = req[3]?.[1]?.__bbox;
					const media =
						inner?.result?.data?.xig_polaris_media ||
						inner?.data?.xig_polaris_media;
					if (!media) continue;

					const item = media.if_not_gated_logged_out || media;
					if (!item.pk && !item.code) continue;

					return this.normalizeItem(item);
				}
			} catch {}
		}

		return null;
	}

	async fetchViaEmbed(shortcode) {
		try {
			const res = await axios.get(
				`https://www.instagram.com/p/${shortcode}/embed/captioned/`,
				{
					headers: {
						"User-Agent": this.UA,
					},
					timeout: 15000,
				}
			);
			const html = res.data;
			const videoMatch = html.match(
				/class="EmbeddedMediaVideo"[^>]*src="([^"]+)"/i
			);
			const imgMatch = html.match(
				/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i
			);
			const captionMatch = html.match(/class="Caption"[^>]*>([^<]+)/i);

			if (videoMatch || imgMatch) {
				return {
					shortcode,
					caption: captionMatch ? captionMatch[1] : "",
					author: { username: "Instagram User" },
					media: [
						{
							type: videoMatch ? "video" : "image",
							url: (videoMatch
								? videoMatch[1]
								: imgMatch[1]
							).replace(/&amp;/g, "&"),
						},
					],
				};
			}
		} catch {}
		return null;
	}

	async download(url) {
		const shortcode = this.extractShortcode(url);
		if (!shortcode) throw new Error("Invalid Instagram URL.");

		let result = await this.fetchViaHtml(shortcode);
		if (!result || !result.media?.length) {
			result = await this.fetchViaEmbed(shortcode);
		}

		if (!result || !result.media?.length) {
			throw new Error(
				"Could not extract media. Post might be private or unavailable."
			);
		}

		return result;
	}
}

module.exports = new Instagram();
