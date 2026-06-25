const axios = require("axios");
const fsPromises = require("fs/promises");
const moment = require("moment-timezone");
const crypto = require("node:crypto");
const util = require("node:util");

class Function {
	generateRandomString = (length) => {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		return result;
	};

	generateRandomNumberString = (length) => {
		const characters = "0123456789";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		return result;
	};

	generateRandomUserAgent = () => {
		const androidVersions = [
			"4.0.3",
			"4.1.1",
			"4.2.2",
			"4.3",
			"4.4",
			"5.0.2",
			"5.1",
			"6.0",
			"7.0",
			"8.0",
			"9.0",
			"10.0",
			"11.0",
		];
		const deviceModels = [
			"M2004J19C",
			"S2020X3",
			"Xiaomi4S",
			"RedmiNote9",
			"SamsungS21",
			"GooglePixel5",
		];
		const buildVersions = [
			"RP1A.200720.011",
			"RP1A.210505.003",
			"RP1A.210812.016",
			"QKQ1.200114.002",
			"RQ2A.210505.003",
		];
		const selectedModel =
			deviceModels[Math.floor(Math.random() * deviceModels.length)];
		const selectedBuild =
			buildVersions[Math.floor(Math.random() * buildVersions.length)];
		const chromeVersion =
			"Chrome/" +
			(Math.floor(Math.random() * 80) + 1) +
			"." +
			(Math.floor(Math.random() * 999) + 1) +
			"." +
			(Math.floor(Math.random() * 9999) + 1);
		const userAgent = `Mozilla/5.0 (Linux; Android ${
			androidVersions[Math.floor(Math.random() * androidVersions.length)]
		}; ${selectedModel} Build/${selectedBuild}) AppleWebKit/537.36 (KHTML, like Gecko) ${chromeVersion} Mobile Safari/537.36 WhatsApp/1.${
			Math.floor(Math.random() * 9) + 1
		}.${Math.floor(Math.random() * 9) + 1}`;
		return userAgent;
	};

	shortlink = async (url) => {
		let isurl = /https?:\/\//.test(url);
		if (!isurl) return "";
		try {
			const response = await axios.get(
				"https://tinyurl.com/api-create.php?url=" +
					encodeURIComponent(url)
			);
			return response.data;
		} catch (e) {
			console.error("Error shortlink:", e);
			return "";
		}
	};

	generateRandomIP = () => {
		const octet = () => Math.floor(Math.random() * 256);
		return `${octet()}.${octet()}.${octet()}.${octet()}`;
	};

	generateUUIDv4 = () => {
		return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
			(c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
		);
	};

	randomBytes = (length) => {
		return crypto.randomBytes(length);
	};

	generateMessageID = () => {
		return this.randomBytes(10).toString("hex").toUpperCase();
	};

	getRandom = (ext) => {
		return `${Math.floor(Math.random() * 10000)}${ext}`;
	};

	ebinary = (binary) => {
		return binary
			.split(" ")
			.map((bin) => String.fromCharCode(parseInt(bin, 2)))
			.join("");
	};

	binary = (text) => {
		return text
			.split("")
			.map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
			.join(" ");
	};

	reverseText = (text) => {
		return text.split("").reverse().join("");
	};

	delay = (time) => new Promise((res) => setTimeout(res, time));

	isUrl = (url) => {
		try {
			return url.match(
				new RegExp(
					/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/,
					"gi"
				)
			);
		} catch {
			return false;
		}
	};

	fetchJson = async (url, head = {}) => {
		try {
			const response = await fetch(url, {
				headers: head,
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (e) {
			console.error("Error fetchJson:", e);
			return {
				status: false,
			};
		}
	};

	fetchBuffer = async (file, options = {}) => {
		try {
			if (this.isUrl(file)) {
				let response = await axios.get(file, {
					responseType: "arraybuffer",
					headers: options,
				});
				return response.data;
			} else {
				return await fsPromises.readFile(file);
			}
		} catch (e) {
			console.error("Error fetchBuffer:", e);
			return {
				status: false,
			};
		}
	};

	fetchText = async (url, options = {}) => {
		try {
			let response = await axios.get(url, {
				headers: {
					...(options.headers || {}),
				},
				responseType: "text",
				...options,
			});
			return response.data;
		} catch (e) {
			console.error("Error fetchText:", e);
			return {
				status: false,
			};
		}
	};

	sort = (property, ascending = true) => {
		if (property)
			return (...args) =>
				args[ascending & 1][property] - args[!ascending & 1][property];
		else return (...args) => args[ascending & 1] - args[!ascending & 1];
	};

	toNumber = (property, _default = 0) => {
		if (property)
			return (a, i, b) => {
				return {
					...b[i],
					[property]:
						a[property] === undefined ? _default : a[property],
				};
			};
		else return (a) => (a === undefined ? _default : a);
	};

	enumGetKey = (a) => {
		return a.jid;
	};

	parseCookie = async (file, options = {}) => {
		try {
			let response = await axios.get(file, {
				responseType: "arraybuffer",
				headers: options,
			});
			return response.headers["set-cookie"];
		} catch (e) {
			console.error("Error parseCookie:", e);
			return {
				status: false,
			};
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

	uuid = () => {
		let dt = new Date().getTime();
		let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/g,
			function (c) {
				let r = ((dt + Math.random() * 16) % 16) | 0;
				let y = Math.floor(dt / 16);
				return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
			}
		);
		return uuid;
	};

	toZeroIfInfinity = (value) => {
		return Number.isFinite(value) ? value : 0;
	};

	parseNumber = (milliseconds) => {
		return {
			days: Math.trunc(milliseconds / 86400000),
			hours: Math.trunc((milliseconds / 3600000) % 24),
			minutes: Math.trunc((milliseconds / 60000) % 60),
			seconds: Math.trunc((milliseconds / 1000) % 60),
			milliseconds: Math.trunc(milliseconds % 1000),
			microseconds: Math.trunc(
				this.toZeroIfInfinity(milliseconds * 1000) % 1000
			),
			nanoseconds: Math.trunc(
				this.toZeroIfInfinity(milliseconds * 1e6) % 1000
			),
		};
	};

	parseBigint = (milliseconds) => {
		return {
			days: milliseconds / 86400000n,
			hours: (milliseconds / 3600000n) % 24n,
			minutes: (milliseconds / 60000n) % 60n,
			seconds: (milliseconds / 1000n) % 60n,
			milliseconds: milliseconds % 1000n,
			microseconds: 0n,
			nanoseconds: 0n,
		};
	};

	formatDuration = (milliseconds) => {
		if (typeof milliseconds === "number") {
			if (Number.isFinite(milliseconds)) {
				return this.parseNumber(milliseconds);
			}
		} else if (typeof milliseconds === "bigint") {
			return this.parseBigint(milliseconds);
		}
		throw new TypeError("Expected a finite number or bigint");
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
				let head = await axios.head(str);
				return this.formatSize(
					head.headers["content-length"]
						? parseInt(head.headers["content-length"])
						: 0
				);
			} else {
				const stats = await fsPromises.stat(str);
				return this.formatSize(stats.size);
			}
		} catch (e) {
			console.warn("Could not determine size for:", str, e.message);
			return "0 B";
		}
	};

	sizeLimit = (str, max) => {
		let data = { oversize: false };
		const sizeInBytes = this.parseSizeToBytes(str);

		if (sizeInBytes === null) {
			return { oversize: true, error: "Invalid size format" };
		}

		if (sizeInBytes > max * 1024 * 1024) {
			data.oversize = true;
		}
		return data;
	};

	parseSizeToBytes = (sizeStr) => {
		const match = sizeStr.match(/^(\d+(\.\d+)?)\s*(B|KB|MB|GB|TB)?$/i);
		if (!match) return null;

		let value = parseFloat(match[1]);
		const unit = (match[3] || "B").toUpperCase();

		switch (unit) {
			case "B":
				return value;
			case "KB":
				return value * 1024;
			case "MB":
				return value * 1024 * 1024;
			case "GB":
				return value * 1024 * 1024 * 1024;
			case "TB":
				return value * 1024 * 1024 * 1024 * 1024;
			default:
				return null;
		}
	};

	generateLink = (text) => {
		let regex =
			/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
		return text.match(regex);
	};

	jsonFormat = (obj) => {
		try {
			let print =
				obj &&
				(obj.constructor.name == "Object" ||
					obj.constructor.name == "Array")
					? util.format(JSON.stringify(obj, null, 2))
					: util.format(obj);
			return print;
		} catch (e) {
			console.error("Error in jsonFormat:", e);
			return util.format(obj);
		}
	};

	ucword = (str) => {
		return (str + "").replace(/^([a-z])|\s+([a-z])/g, function ($1) {
			return $1.toUpperCase();
		});
	};

	arrayJoin = (arr) => {
		let construct = [];
		for (let i = 0; i < arr.length; i++)
			construct = construct.concat(arr[i]);
		return construct;
	};

	removeItem = (arr, value) => {
		let index = arr.indexOf(value);
		if (index > -1) arr.splice(index, 1);
		return arr;
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

	greeting = () => {
		let time = moment.tz(process.env.TZ || "Asia/Jakarta").format("HH");
		let res = `Don't forget to sleep`;
		if (time >= 3 && time < 6) res = `Good Evening`;
		else if (time >= 6 && time < 11) res = `Good Morning`;
		else if (time >= 11 && time < 18) res = `Good Afternoon`;
		else if (time >= 18 || time < 3) res = `Good Night`;
		return res;
	};

	styleText = (text, style = 1) => {
		const xStr = [
			"a",
			"b",
			"c",
			"d",
			"e",
			"f",
			"g",
			"h",
			"i",
			"j",
			"k",
			"l",
			"m",
			"n",
			"o",
			"p",
			"q",
			"r",
			"s",
			"t",
			"u",
			"v",
			"w",
			"x",
			"y",
			"z",
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"0",
		];
		const yStr = Object.freeze({
			1: [
				"ᴀ",
				"ʙ",
				"ᴄ",
				"ᴅ",
				"ᴇ",
				"ꜰ",
				"ɢ",
				"ʜ",
				"ɪ",
				"ᴊ",
				"ᴋ",
				"ʟ",
				"ᴍ",
				"ɴ",
				"ᴏ",
				"ᴘ",
				"q",
				"ʀ",
				"ꜱ",
				"ᴛ",
				"ᴜ",
				"ᴠ",
				"ᴡ",
				"x",
				"ʏ",
				"ᴢ",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			2: [
				"𝑎",
				"𝑏",
				"𝑐",
				"𝑑",
				"𝑒",
				"𝑓",
				"𝑔",
				"ℎ",
				"𝑖",
				"𝑗",
				"𝑘",
				"𝑙",
				"𝑚",
				"𝑛",
				"𝑜",
				"𝑝",
				"𝑞",
				"𝑟",
				"𝑠",
				"𝑡",
				"𝑢",
				"𝑣",
				"𝑤",
				"𝑥",
				"𝑦",
				"𝑧",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			3: [
				"𝐚",
				"𝐛",
				"𝐜",
				"𝐝",
				"𝐞",
				"𝐟",
				"𝐠",
				"𝐡",
				"𝐢",
				"𝐣",
				"𝐤",
				"𝐥",
				"𝐦",
				"𝐧",
				"𝐨",
				"𝐩",
				"𝐪",
				"𝐫",
				"𝐬",
				"𝐭",
				"𝐮",
				"𝐯",
				"𝐰",
				"𝐱",
				"𝐲",
				"𝐳",
				"𝟏",
				"𝟐",
				"𝟑",
				"𝟒",
				"𝟓",
				"𝟔",
				"𝟕",
				"𝟖",
				"𝟗",
				"𝟎",
			],
			4: [
				"𝒂",
				"𝒃",
				"𝒄",
				"𝒅",
				"𝒆",
				"𝒇",
				"𝒈",
				"𝒉",
				"𝒊",
				"𝒋",
				"𝒌",
				"𝒍",
				"𝒎",
				"𝒏",
				"𝒐",
				"𝒑",
				"𝒒",
				"𝒓",
				"𝒔",
				"𝒕",
				"𝒖",
				"𝒗",
				"𝒘",
				"𝒙",
				"𝒚",
				"𝒛",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			5: [
				"𝗮",
				"𝗯",
				"𝗰",
				"𝗱",
				"𝗲",
				"𝗳",
				"𝗴",
				"𝗵",
				"𝗶",
				"𝗷",
				"𝗸",
				"𝗹",
				"𝗺",
				"𝗻",
				"𝗼",
				"𝗽",
				"𝗾",
				"𝗿",
				"𝘀",
				"𝘁",
				"𝘂",
				"𝘃",
				"𝘄",
				"𝘅",
				"𝘆",
				"𝘇",
				"𝟭",
				"𝟮",
				"𝟯",
				"𝟰",
				"𝟱",
				"𝟲",
				"𝟳",
				"𝟴",
				"𝟵",
				"𝟬",
			],
			6: [
				"ᵃ",
				"ᵇ",
				"ᶜ",
				"ᵈ",
				"ᵉ",
				"ᶠ",
				"ᵍ",
				"ʰ",
				"ⁱ",
				"ʲ",
				"ᵏ",
				"ˡ",
				"ᵐ",
				"ⁿ",
				"ᵒ",
				"ᵖ",
				"ᵠ",
				"ʳ",
				"ˢ",
				"ᵗ",
				"ᵘ",
				"ᵛ",
				"ʷ",
				"ˣ",
				"ʸ",
				"ᶻ",
				"¹",
				"²",
				"³",
				"⁴",
				"⁵",
				"⁶",
				"⁷",
				"⁸",
				"⁹",
				"⁰",
			],
			7: [
				"ᗩ",
				"ᗷ",
				"ᑕ",
				"ᗪ",
				"ᗴ",
				"ᖴ",
				"ᘜ",
				"ᕼ",
				"I",
				"ᒍ",
				"K",
				"ᒪ",
				"ᗰ",
				"ᑎ",
				"O",
				"ᑭ",
				"ᑫ",
				"ᖇ",
				"Տ",
				"T",
				"ᑌ",
				"ᐯ",
				"ᗯ",
				"᙭",
				"Y",
				"ᘔ",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			8: [
				"𝙖",
				"𝙗",
				"𝙘",
				"𝙙",
				"𝙚",
				"𝙛",
				"𝙜",
				"𝙝",
				"𝙞",
				"𝙟",
				"𝙠",
				"𝙡",
				"𝙢",
				"𝙣",
				"𝙤",
				"𝙥",
				"𝙦",
				"𝙧",
				"𝙨",
				"𝙩",
				"𝙪",
				"𝙫",
				"𝙬",
				"𝙭",
				"𝙮",
				"𝙯",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			9: [
				"𝘢",
				"𝘣",
				"𝘤",
				"𝘥",
				"𝘦",
				"𝘧",
				"𝘨",
				"𝘩",
				"𝑖",
				"𝑗",
				"𝑘",
				"𝑙",
				"𝑚",
				"𝑛",
				"𝑜",
				"𝑝",
				"𝑞",
				"𝑟",
				"𝑠",
				"𝑡",
				"𝑢",
				"𝑣",
				"𝑤",
				"𝑥",
				"𝑦",
				"𝑧",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			10: [
				"𝖺",
				"𝖻",
				"𝖼",
				"𝖽",
				"𝖾",
				"𝖿",
				"𝗀",
				"𝗁",
				"𝗂",
				"𝗃",
				"𝗄",
				"𝗅",
				"𝗆",
				"𝗇",
				"𝗈",
				"𝗉",
				"𝗊",
				"𝗋",
				"𝗌",
				"𝗍",
				"𝗎",
				"𝗏",
				"𝗐",
				"𝗑",
				"𝗒",
				"𝗓",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			11: [
				"Ⓐ︎",
				"Ⓑ",
				"︎Ⓒ",
				"︎Ⓓ︎",
				"Ⓔ︎",
				"Ⓕ︎",
				"Ⓖ︎",
				"Ⓗ︎",
				"Ⓘ︎",
				"Ⓙ︎",
				"Ⓚ︎",
				"Ⓛ︎",
				"Ⓜ︎",
				"Ⓝ︎",
				"Ⓞ︎",
				"Ⓟ",
				"︎Ⓠ︎",
				"Ⓡ︎",
				"Ⓢ",
				"︎Ⓣ︎",
				"Ⓤ︎",
				"Ⓥ︎",
				"Ⓦ︎",
				"Ⓧ︎",
				"Ⓨ︎",
				"Ⓩ︎",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			12: [
				"🅐︎",
				"🅑︎",
				"🅒",
				"︎🅓︎",
				"🅔︎",
				"🅕︎",
				"🅖︎",
				"🅗",
				"︎🅘︎",
				"🅙︎",
				"🅚",
				"︎🅛︎",
				"🅜",
				"︎🅝︎",
				"🅞",
				"︎🅟",
				"︎🅠︎",
				"🅡︎",
				"🅢",
				"︎🅣",
				"︎🅤",
				"︎🅥︎",
				"🅦︎",
				"🅧︎",
				"🅨︎",
				"🅩︎",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			13: [
				"卂",
				"乃",
				"匚",
				"ᗪ",
				"乇",
				"千",
				"ᘜ",
				"卄",
				"|",
				"ﾌ",
				"Ҝ",
				"ㄥ",
				"爪",
				"几",
				"ㄖ",
				"卩",
				"Ҩ",
				"尺",
				"丂",
				"ㄒ",
				"ㄩ",
				"ᐯ",
				"山",
				"乂",
				"ㄚ",
				"乙",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
			],
			14: [
				"ⓐ",
				"ⓑ",
				"ⓒ",
				"ⓓ",
				"ⓔ",
				"ⓕ",
				"ⓖ",
				"ⓗ",
				"ⓘ",
				"ⓙ",
				"ⓚ",
				"ⓛ",
				"ⓜ",
				"ⓝ",
				"ⓞ",
				"ⓟ",
				"ⓠ",
				"ⓡ",
				"ⓢ",
				"ⓣ",
				"ⓤ",
				"ⓥ",
				"ⓦ",
				"ⓧ",
				"ⓨ",
				"ⓩ",
				"①",
				"②",
				"③",
				"④",
				"⑤",
				"⑥",
				"⑦",
				"⑧",
				"⑨",
				"⓪",
			],
			15: [
				"𝚊",
				"𝚋",
				"𝚌",
				"𝚍",
				"𝚎",
				"𝚏",
				"𝚐",
				"𝚑",
				"𝚒",
				"𝚓",
				"𝚔",
				"𝚕",
				"𝚖",
				"𝚗",
				"𝚘",
				"𝚙",
				"𝚚",
				"𝚛",
				"𝚜",
				"𝚝",
				"𝘂",
				"𝘃",
				"𝚠",
				"𝚡",
				"𝚢",
				"𝚣",
				"𝟷",
				"𝟸",
				"𝟹",
				"𝟺",
				"𝟻",
				"𝟼",
				"𝟽",
				"𝟾",
				"𝟿",
				"𝟶",
			],
			16: [
				"a͢",
				"b͢",
				"c͢",
				"d͢",
				"e͢",
				"f͢",
				"g͢",
				"h͢",
				"i͢",
				"j͢",
				"k͢",
				"l͢",
				"m͢",
				"n͢",
				"o͢",
				"p͢",
				"q͢",
				"r͢",
				"s͢",
				"t͢",
				"u͢",
				"v͢",
				"w͢",
				"x͢",
				"y͢",
				"z͢",
				"1͢",
				"2͢",
				"3͢",
				"4͢",
				"5͢",
				"6͢",
				"7͢",
				"8͢",
				"9͢",
				"0͢",
			],
			17: [
				"𝕒",
				"𝕓",
				"𝕔",
				"𝕕",
				"𝕖",
				"𝕗",
				"𝕘",
				"𝕙",
				"𝕚",
				"𝕛",
				"𝕜",
				"𝕝",
				"𝕞",
				"𝕟",
				"𝕠",
				"𝕡",
				"𝕢",
				"𝕣",
				"𝕤",
				"𝕥",
				"𝕦",
				"𝕧",
				"𝕨",
				"𝕩",
				"𝕪",
				"𝕫",
				"𝟙",
				"𝟚",
				"𝟛",
				"𝟜",
				"𝟝",
				"𝟞",
				"𝟟",
				"𝟠",
				"𝟡",
				"𝟘",
			],
			18: [
				"【a】",
				"【b】",
				"【c】",
				"【d】",
				"【e】",
				"【f】",
				"【g】",
				"【h】",
				"【i】",
				"【j】",
				"【k】",
				"【l】",
				"【m】",
				"【n】",
				"【o】",
				"【p】",
				"【q】",
				"【r】",
				"【s】",
				"【t】",
				"【u】",
				"【v】",
				"【w】",
				"【x】",
				"【y】",
				"【z】",
				"【1】",
				"【2】",
				"【3】",
				"【4】",
				"【5】",
				"【6】",
				"【7】",
				"【8】",
				"【9】",
				"【0】",
			],
			19: [
				"ａ",
				"ｂ",
				"ｃ",
				"ｄ",
				"ｅ",
				"ｆ",
				"ｇ",
				"ｈ",
				"ｉ",
				"ｊ",
				"ｋ",
				"ｌ",
				"ｍ",
				"ｎ",
				"ｏ",
				"ｐ",
				"ｑ",
				"ｒ",
				"ｓ",
				"ｔ",
				"ｕ",
				"ｖ",
				"ｗ",
				"ｘ",
				"ｙ",
				"ｚ",
				"１",
				"２",
				"３",
				"４",
				"５",
				"６",
				"７",
				"８",
				"９",
				"０",
			],
			20: [
				"『a』",
				"『b』",
				"『c』",
				"『d』",
				"『e』",
				"『f』",
				"『g』",
				"『h』",
				"『i』",
				"『j』",
				"『k』",
				"『l』",
				"『m』",
				"『n』",
				"『o』",
				"『p』",
				"『q』",
				"『r』",
				"『s』",
				"『t』",
				"『u』",
				"『v』",
				"『w』",
				"『x』",
				"『y』",
				"『z』",
				"『1』",
				"『2』",
				"『3』",
				"『4』",
				"『5』",
				"『6』",
				"『7』",
				"『8』",
				"『9』",
				"『0』",
			],
		});

		const replacer = [];
		xStr.map((v, i) =>
			replacer.push({
				original: v,
				convert: yStr[style][i],
			})
		);

		const str = text.toLowerCase().split("");
		const output = [];
		str.map((v) => {
			const find = replacer.find((x) => x.original === v);
			find ? output.push(find.convert) : output.push(v);
		});

		return output.join("");
	};
}

module.exports = new Function();
