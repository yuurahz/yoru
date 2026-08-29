const fsPromises = require("fs/promises");
const util = require("node:util");

class Function {
	delay = (time) => new Promise((res) => setTimeout(res, time));

	isUrl = (url) => {
		try {
			return !!url && Boolean(new URL(url));
		} catch {
			return false;
		}
	};

	fetchJson = async (url, head = {}) => {
		try {
			const response = await fetch(url, { headers: head });
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (e) {
			console.error("Error fetchJson:", e);
			return { status: false };
		}
	};

	fetchBuffer = async (file, options = {}) => {
		try {
			if (this.isUrl(file)) {
				const response = await fetch(file, { headers: options });
				const arrayBuffer = await response.arrayBuffer();
				return Buffer.from(arrayBuffer);
			} else {
				return await fsPromises.readFile(file);
			}
		} catch (e) {
			console.error("Error fetchBuffer:", e);
			return { status: false };
		}
	};

	fetchText = async (url, options = {}) => {
		try {
			const response = await fetch(url, options);
			return await response.text();
		} catch (e) {
			console.error("Error fetchText:", e);
			return { status: false };
		}
	};

	texted = (type, text) => {
		switch (type) {
			case "dot":
				return "- " + text;
			case "gray":
				return "> " + text;
			case "glow":
				return "`" + text + "`";
			case "bold":
				return "*" + text + "*";
			case "italic":
				return "_" + text + "_";
			case "monospace":
				return "```" + text + "```";
			default:
				return text;
		}
	};

	example = (usedPrefix, command, text) => {
		return `${this.texted("bold", "Wrong Input")}\n~ Example : ${usedPrefix + command} ${text}`;
	};

	random = (list) => {
		return list[Math.floor(Math.random() * list.length)];
	};

	randomInt = (min, max) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	formatNumber = (integer, zone) => {
		let numb = parseInt(integer);
		if (isNaN(numb)) return "0";
		return Number(numb)
			.toLocaleString(zone || "en-US")
			.replace(/,/g, ".");
	};

	formatSize = (size) => {
		function round(value, precision) {
			let multiplier = Math.pow(10, precision || 0);
			return Math.round(value * multiplier) / multiplier;
		}
		let megaByte = 1024 * 1024;
		let gigaByte = 1024 * megaByte;
		let teraByte = 1024 * gigaByte;
		if (size < 1024) {
			return size + " B";
		} else if (size < megaByte) {
			return round(size / 1024, 1) + " KB";
		} else if (size < gigaByte) {
			return round(size / megaByte, 1) + " MB";
		} else if (size < teraByte) {
			return round(size / gigaByte, 1) + " GB";
		} else {
			return round(size / teraByte, 1) + " TB";
		}
	};

	getSize = async (str) => {
		if (!isNaN(str) && typeof str !== "string") return this.formatSize(str);
		try {
			if (this.isUrl(str)) {
				const res = await fetch(str, { method: "HEAD" });
				const len = res.headers.get("content-length");
				return this.formatSize(len ? parseInt(len, 10) : 0);
			} else {
				const stats = await fsPromises.stat(str);
				return this.formatSize(stats.size);
			}
		} catch (e) {
			return "0 B";
		}
	};

	jsonFormat = (obj) => {
		try {
			return obj &&
				(obj.constructor?.name === "Object" ||
					obj.constructor?.name === "Array")
				? util.format(JSON.stringify(obj, null, 2))
				: util.format(obj);
		} catch (e) {
			return util.format(obj);
		}
	};

	toDate = (ms) => {
		let days = Math.floor(ms / (24 * 60 * 60 * 1000));
		let daysms = ms % (24 * 60 * 60 * 1000);
		let hours = Math.floor(daysms / (60 * 60 * 1000));
		let hoursms = ms % (60 * 60 * 1000);
		let minutes = Math.floor(hoursms / (60 * 1000));
		if (days === 0 && hours === 0 && minutes === 0) {
			return "Recently";
		} else {
			return days + "D " + hours + "H " + minutes + "M";
		}
	};

	date = (ts = Date.now()) => {
		return new Date(ts).toLocaleString("en-GB", {
			timeZone: process.env.TZ || "Asia/Jakarta",
		});
	};

	greeting = () => {
		const hour = parseInt(
			new Intl.DateTimeFormat("en-US", {
				hour: "numeric",
				hour12: false,
				timeZone: process.env.TZ || "Asia/Jakarta",
			}).format(new Date()),
			10
		);
		if (hour >= 3 && hour < 6) return "Good Evening";
		if (hour >= 6 && hour < 11) return "Good Morning";
		if (hour >= 11 && hour < 18) return "Good Afternoon";
		return "Good Night";
	};
}

module.exports = new Function();
