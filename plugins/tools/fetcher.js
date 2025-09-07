const axios = require("axios");
const { URLSearchParams } = require("url");

function escapeHtml(str = "") {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function chunkText(str, max = 3800) {
	const chunks = [];
	let i = 0;
	while (i < str.length) {
		chunks.push(str.slice(i, i + max));
		i += max;
	}
	return chunks;
}

function parseOptions(flagText = "") {
	const tokens = (flagText.match(/(".*?"|'.*?'|\S+)/g) || []).map((t) =>
		t.replace(/^['"]|['"]$/g, "")
	);

	const opts = {
		headers: {},
		data: {},
		raw: null,
		method: null,
		json: false,
		head: false,
		timeout: null,
		ua: null,
		bearer: null,
		forceDoc: false,
		filename: null,
	};

	for (let i = 0; i < tokens.length; i++) {
		const t = tokens[i];

		if ((t === "--method" || t === "-X") && tokens[i + 1]) {
			opts.method = tokens[++i].toUpperCase();
			continue;
		}

		if ((t === "--header" || t === "-H") && tokens[i + 1]) {
			const headerLine = tokens[++i];
			const [k, ...v] = headerLine.split(":");
			if (k && v.length) {
				opts.headers[k.trim()] = v.join(":").trim();
			}
			continue;
		}

		if ((t === "--data" || t === "-d") && tokens[i + 1]) {
			const pair = tokens[++i];
			const eq = pair.indexOf("=");
			if (eq > -1) {
				const key = pair.slice(0, eq).trim();
				const val = pair.slice(eq + 1).trim();
				if (key) opts.data[key] = val;
			}
			continue;
		}

		if (t === "--json") {
			opts.json = true;
			continue;
		}

		if (t === "--raw" && tokens[i + 1]) {
			opts.raw = tokens[++i];
			continue;
		}

		if (t === "--head" || t === "-I") {
			opts.head = true;
			continue;
		}

		if ((t === "--timeout" || t === "-t") && tokens[i + 1]) {
			let val = parseInt(tokens[++i], 10);
			if (!Number.isNaN(val)) {
				opts.timeout = val <= 60 ? val * 1000 : val;
			}
			continue;
		}

		if (t === "--ua" && tokens[i + 1]) {
			opts.ua = tokens[++i];
			continue;
		}

		if (t === "--bearer" || t === "-B") {
			if (tokens[i + 1]) {
				opts.bearer = tokens[++i];
			}
			continue;
		}

		if (t === "--force-doc") {
			opts.forceDoc = true;
			continue;
		}

		if (t === "--filename" && tokens[i + 1]) {
			opts.filename = tokens[++i];
			continue;
		}
	}

	return opts;
}

function buildRequestConfig(url, opts) {
	const headers = { ...opts.headers };

	if (opts.ua) headers["User-Agent"] = opts.ua;
	if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;

	let method = opts.method || (opts.head ? "HEAD" : "GET");
	let dataBody;

	if (!opts.method && (Object.keys(opts.data).length > 0 || opts.raw)) {
		method = "POST";
	}

	if (opts.raw != null) {
		dataBody = opts.raw;
		if (!headers["Content-Type"] && !opts.json) {
			headers["Content-Type"] = "text/plain; charset=utf-8";
		}
	} else if (Object.keys(opts.data).length > 0) {
		if (opts.json) {
			headers["Content-Type"] =
				headers["Content-Type"] || "application/json";
			dataBody = JSON.stringify(opts.data);
		} else {
			headers["Content-Type"] =
				headers["Content-Type"] || "application/x-www-form-urlencoded";
			dataBody = new URLSearchParams(opts.data).toString();
		}
	}

	if (
		(method === "GET" || method === "HEAD") &&
		dataBody &&
		typeof dataBody === "string" &&
		!opts.raw
	) {
		const sep = url.includes("?") ? "&" : "?";
		url = url + sep + dataBody;
		dataBody = undefined;
	}

	const axiosCfg = {
		url,
		method,
		headers,
		data: dataBody,
		responseType: "arraybuffer",
		validateStatus: () => true,
	};

	if (opts.timeout) axiosCfg.timeout = opts.timeout;

	return axiosCfg;
}

module.exports = {
	help: ["fetch"],
	category: "tools",
	command: /^(fetch|get)$/i,
	desc: "HTTP request like curl",
	run: async (m) => {
		const rawTokens = (m.text || "").match(/(".*?"|'.*?'|\S+)/g) || [];
		const urlToken = rawTokens.shift();
		if (!urlToken) {
			return m.reply(
				[
					"<b>Usage:</b> <code>/fetch &lt;url&gt; [flags]</code>",
					"",
					"Flags:",
					"  -X, --method      HTTP method (GET, POST, PUT, DELETE, HEAD, ...)",
					'  -H, --header      "Key: Value" (bisa banyak)',
					'  -d, --data        "key=value" (bisa banyak)',
					"      --json        Kirim data sebagai JSON",
					"      --raw         Raw body string (pakai apa adanya)",
					"  -I, --head        Hanya tampilkan response headers",
					"  -t, --timeout     Timeout (ms, atau detik jika 60)",
					"      --ua          User-Agent custom",
					"  -B, --bearer      Bearer token",
					"      --force-doc   Paksa kirim sebagai dokumen",
					"      --filename    Nama file saat kirim dokumen",
				].join("\n"),
				{ parse_mode: "HTML" }
			);
		}

		const url = urlToken.replace(/^['"]|['"]$/g, "");
		const flagsText = rawTokens.join(" ");
		const opts = parseOptions(flagsText);

		const loading = await m.reply("⚡ <i>Fetching...</i>", {
			parse_mode: "HTML",
		});

		try {
			const reqCfg = buildRequestConfig(url, opts);
			const res = await axios(reqCfg);

			const statusLine = `HTTP ${res.status}${
				res.statusText ? " " + res.statusText : ""
			}`;
			const contentType = String(
				res.headers["content-type"] || ""
			).toLowerCase();

			if (opts.head || reqCfg.method === "HEAD") {
				const headText = JSON.stringify(res.headers, null, 2);
				await m.reply(
					`<b>${escapeHtml(statusLine)}</b>\n<pre>${escapeHtml(headText)}</pre>`,
					{ parse_mode: "HTML" }
				);
				return;
			}

			const buffer = Buffer.from(res.data);

			if (opts.forceDoc) {
				const caption = `📎 <b>${escapeHtml(statusLine)}</b>\n<code>${escapeHtml(
					url
				)}</code>`;
				await m.sendMedia(buffer, {
					type: "document",
					caption,
					parse_mode: "HTML",
				});
				return;
			}

			const isJson =
				contentType.includes("application/json") ||
				contentType.includes("text/json");

			const isText =
				contentType.startsWith("text/") ||
				contentType.includes("application/xml") ||
				contentType.includes("application/xhtml+xml");

			if (isJson || isText) {
				let bodyText = buffer.toString("utf8");

				if (isJson) {
					try {
						const parsed = JSON.parse(bodyText);
						bodyText = JSON.stringify(parsed, null, 2);
					} catch {}
				}

				const headerLine =
					`<b>${escapeHtml(statusLine)}</b>\n` +
					`<code>${escapeHtml(url)}</code>\n\n`;

				const chunks = chunkText(bodyText, 3500);
				if (chunks.length === 0) {
					await m.reply(headerLine + "<pre></pre>", {
						parse_mode: "HTML",
					});
					return;
				}

				for (let i = 0; i < chunks.length; i++) {
					const prefix =
						i === 0
							? headerLine
							: `<b>— continued (${i + 1}/${chunks.length})</b>\n`;
					await m.reply(
						prefix + `<pre>${escapeHtml(chunks[i])}</pre>`,
						{
							parse_mode: "HTML",
						}
					);
				}
				return;
			}

			let type = "document";
			if (contentType.startsWith("image/")) type = "photo";
			else if (contentType.startsWith("video/")) type = "video";
			else if (contentType.startsWith("audio/")) type = "audio";
			else if (contentType.includes("application/pdf")) type = "document";

			const caption = `📎 <b>${escapeHtml(statusLine)}</b>\n<code>${escapeHtml(
				url
			)}</code>`;

			await m.sendMedia(m.chat, buffer, {
				type,
				caption,
				parse_mode: "HTML",
			});
		} catch (e) {
			console.error(e);
			await m.reply(
				`❌ <b>Fetch failed:</b> <code>${escapeHtml(e.message)}</code>`,
				{ parse_mode: "HTML" }
			);
		} finally {
			m.delete(loading);
		}
	},
	limit: 1,
};
