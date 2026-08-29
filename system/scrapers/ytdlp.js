const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const fsPromises = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

const execFileAsync = promisify(execFile);
const YTDLP_BIN = "/root/.local/bin/yt-dlp";

async function info(url) {
	const args = [
		"-j",
		"--no-warnings",
		"--extractor-args",
		"youtube:player_client=web_embedded",
		url,
	];
	const { stdout } = await execFileAsync(YTDLP_BIN, args, {
		timeout: 30000,
	});
	const data = JSON.parse(stdout);
	return {
		id: data.id,
		title: data.title,
		channel: data.uploader || data.channel,
		duration: data.duration,
		thumbnail: data.thumbnail,
		description: data.description,
		url: data.webpage_url || url,
	};
}

async function search(query, limit = 5) {
	const args = [
		"-j",
		"--no-warnings",
		"--default-search",
		`ytsearch${limit}`,
		"--extractor-args",
		"youtube:player_client=web_embedded",
		query,
	];
	const { stdout } = await execFileAsync(YTDLP_BIN, args, {
		timeout: 30000,
	});
	const lines = stdout.trim().split("\n").filter(Boolean);
	return lines.map((line) => {
		const data = JSON.parse(line);
		return {
			id: data.id,
			title: data.title,
			channel: data.uploader || data.channel,
			duration: data.duration,
			thumbnail: data.thumbnail,
			url:
				data.webpage_url ||
				`https://www.youtube.com/watch?v=${data.id}`,
		};
	});
}

async function download(url, type = "audio") {
	const tmpDir = os.tmpdir();
	const outTemplate = path.join(tmpDir, `yt_${Date.now()}_%(id)s.%(ext)s`);

	const args = [
		"--no-warnings",
		"--extractor-args",
		"youtube:player_client=web_embedded",
		"-o",
		outTemplate,
	];

	if (type === "audio") {
		args.push("-x", "--audio-format", "mp3", "--audio-quality", "0", url);
	} else {
		args.push(
			"-f",
			"bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4]/best",
			url
		);
	}

	await execFileAsync(YTDLP_BIN, args, { timeout: 120000 });

	// Find the generated file
	const files = await fsPromises.readdir(tmpDir);
	const targetFile = files.find(
		(f) =>
			f.startsWith(`yt_`) &&
			(type === "audio" ? f.endsWith(".mp3") : f.endsWith(".mp4"))
	);

	if (!targetFile) {
		throw new Error("Downloaded output file not found.");
	}

	const filePath = path.join(tmpDir, targetFile);
	const buffer = await fsPromises.readFile(filePath);
	await fsPromises.unlink(filePath).catch(() => {});

	return {
		buffer,
		fileName: targetFile,
		type: type === "audio" ? "audio" : "video",
	};
}

module.exports = {
	info,
	search,
	download,
};
