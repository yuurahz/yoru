const { Buffer } = require("node:buffer");
const { createHmac, randomUUID } = require("node:crypto");
const axios = require("axios");

class Spotify {
	static SECRET =
		"376136387538459893883312310911992847112448894410210511297108";
	static TOTP_VERSION = 61;
	static CLIENT_VERSION = "1.2.88.61.ge172202b";
	static SEARCH_HASH =
		"21b3fe49546912ba782db5c47e9ef5a7dbd20329520ba0c7d0fcfadee671d24e";
	static SPOTIDOWN_URL = "https://spotidown.app";
	static SPOTIDOWN_UA =
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

	constructor({ timeout = 30000 } = {}) {
		this.tokenExpiresAt = 0;
		this.dlSession = {
			cookie: "",
			csrfName: "",
			csrfValue: "",
			expiresAt: 0,
		};
		this.http = axios.create({
			timeout,
			headers: {
				referer: "https://open.spotify.com/",
				origin: "https://open.spotify.com",
				"content-type": "application/json",
				accept: "application/json",
				"user-agent":
					"Mozilla/5.0 (Linux; Android 16; NX729J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36",
			},
		});
	}

	generateTOTP(timestampMs = Date.now()) {
		const counter = Math.floor(timestampMs / 1000 / 30);
		const buffer = Buffer.alloc(8);
		buffer.writeBigInt64BE(BigInt(counter));
		const digest = createHmac("sha1", Buffer.from(Spotify.SECRET, "utf8"))
			.update(buffer)
			.digest();
		const offset = digest[digest.length - 1] & 0x0f;
		const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1000000;
		return String(code).padStart(6, "0");
	}

	async getToken() {
		if (
			this.http.defaults.headers.common.authorization &&
			Date.now() < this.tokenExpiresAt - 60000
		) {
			return;
		}

		const now = Date.now();
		const { data: token } = await this.http.get(
			"https://open.spotify.com/api/token",
			{
				params: {
					reason: "init",
					productType: "web-player",
					totp: this.generateTOTP(now),
					totpServer: this.generateTOTP(
						Math.floor(now / 1000) * 1000
					),
					totpVer: String(Spotify.TOTP_VERSION),
				},
			}
		);

		const { data: client } = await this.http.post(
			"https://clienttoken.spotify.com/v1/clienttoken",
			{
				client_data: {
					client_version: Spotify.CLIENT_VERSION,
					client_id: token.clientId,
					js_sdk_data: {
						device_brand: "unknown",
						device_model: "unknown",
						os: "linux",
						os_version: "24.04",
						device_id: randomUUID(),
						device_type: "computer",
					},
				},
			}
		);

		Object.assign(this.http.defaults.headers.common, {
			authorization: `Bearer ${token.accessToken}`,
			"client-token": client.granted_token.token,
			"spotify-app-version": Spotify.CLIENT_VERSION,
			"app-platform": "WebPlayer",
		});

		this.tokenExpiresAt =
			Number(token.accessTokenExpirationTimestampMs) ||
			Date.now() + 55 * 60000;
	}

	async search(query, { limit = 5 } = {}) {
		if (!query?.trim()) throw new Error("Search query is required.");

		await this.getToken();

		const { data } = await this.http.post(
			"https://api-partner.spotify.com/pathfinder/v2/query",
			{
				variables: {
					searchTerm: query,
					offset: 0,
					limit,
					numberOfTopResults: 5,
					includeAudiobooks: false,
					includeArtistHasConcertsField: false,
					includePreReleases: true,
					includeAuthors: false,
					includeEpisodeContentRatingsV2: false,
				},
				operationName: "searchDesktop",
				extensions: {
					persistedQuery: {
						version: 1,
						sha256Hash: Spotify.SEARCH_HASH,
					},
				},
			}
		);

		const items = data?.data?.searchV2?.tracksV2?.items || [];
		return items
			.map((node) => {
				const track = node.item?.data;
				if (!track) return null;
				return {
					name: track.name ?? null,
					uri: track.uri ?? null,
					url: track.uri
						? `https://open.spotify.com/track/${track.uri.split(":")[2]}`
						: null,
					duration_ms: track.duration?.totalMilliseconds ?? 0,
					artists: (track.artists?.items || []).map((a) => ({
						name: a.profile?.name ?? null,
					})),
					album: {
						name: track.albumOfTrack?.name ?? null,
						image:
							track.albumOfTrack?.coverArt?.sources?.[0]?.url ??
							null,
					},
				};
			})
			.filter(Boolean);
	}

	async ensureDlSession() {
		if (this.dlSession.cookie && Date.now() < this.dlSession.expiresAt) {
			return;
		}

		const { headers, data } = await axios.get(Spotify.SPOTIDOWN_URL, {
			headers: { "User-Agent": Spotify.SPOTIDOWN_UA },
			timeout: 15000,
		});

		const cookies = headers["set-cookie"];
		const cookie = cookies?.map((c) => c.split(";")[0]).join("; ") || "";
		const csrfMatch = data.match(
			/<input\s+name="([^"]+)"\s+type="hidden"\s+value="([^"]+)"/i
		);

		this.dlSession = {
			cookie,
			csrfName: csrfMatch?.[1] || "",
			csrfValue: csrfMatch?.[2] || "",
			expiresAt: Date.now() + 50 * 60000,
		};
	}

	async download(url) {
		if (!url?.trim()) throw new Error("Spotify URL is required.");

		await this.ensureDlSession();

		const form = new URLSearchParams();
		form.append("url", url.trim());
		form.append("g-recaptcha-response", "");
		if (this.dlSession.csrfName) {
			form.append(this.dlSession.csrfName, this.dlSession.csrfValue);
		}

		const { data: actionResp } = await axios.post(
			`${Spotify.SPOTIDOWN_URL}/action`,
			form,
			{
				headers: {
					"User-Agent": Spotify.SPOTIDOWN_UA,
					"Content-Type": "application/x-www-form-urlencoded",
					"X-Requested-With": "XMLHttpRequest",
					Referer: `${Spotify.SPOTIDOWN_URL}/`,
					Origin: Spotify.SPOTIDOWN_URL,
					Cookie: this.dlSession.cookie,
				},
				timeout: 20000,
			}
		);

		if (actionResp.error) {
			if (actionResp.errorcode === "error_token") {
				this.dlSession.expiresAt = 0;
				await this.ensureDlSession();
				return this.download(url);
			}
			throw new Error(actionResp.message || "SpotiDown error.");
		}

		const match = actionResp.data?.match(
			/name=["']data["']\s*value=["']([^"']+)["']/i
		);
		const baseValue =
			actionResp.data?.match(
				/name=["']base["']\s*value=["']([^"']+)["']/i
			)?.[1] || "";
		const tokenValue =
			actionResp.data?.match(
				/name=["']token["']\s*value=["']([^"']+)["']/i
			)?.[1] || "";

		if (!match) throw new Error("Could not parse track form data.");

		const info = JSON.parse(
			Buffer.from(match[1], "base64").toString("utf8")
		);

		const resolveForm = new URLSearchParams();
		resolveForm.append("data", match[1]);
		if (baseValue) resolveForm.append("base", baseValue);
		if (tokenValue) resolveForm.append("token", tokenValue);

		const { data: trackResp } = await axios.post(
			`${Spotify.SPOTIDOWN_URL}/action/track`,
			resolveForm,
			{
				headers: {
					"User-Agent": Spotify.SPOTIDOWN_UA,
					"Content-Type": "application/x-www-form-urlencoded",
					"X-Requested-With": "XMLHttpRequest",
					Referer: `${Spotify.SPOTIDOWN_URL}/`,
					Origin: Spotify.SPOTIDOWN_URL,
					Cookie: this.dlSession.cookie,
				},
				timeout: 30000,
			}
		);

		const html =
			typeof trackResp === "object"
				? trackResp.data || ""
				: String(trackResp);
		const dlMatch =
			html.match(/<a[^>]*id=["']popup["'][^>]*href=["']([^"']+)["']/i) ||
			html.match(
				/href=["'](https?:\/\/rapid\.spotidown\.app[^"']+)["']/i
			) ||
			html.match(/href=["'](https?:\/\/[^"']*\.mp3[^"']*)["']/i);

		return {
			title: info.name || "Unknown Track",
			artist: info.artist || "Unknown Artist",
			album: info.album || "",
			cover: info.cover || "",
			downloadUrl: dlMatch?.[1] || null,
		};
	}
}

module.exports = new Spotify();
