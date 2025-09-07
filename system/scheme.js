module.exports = (m) => {
	const isNumber = (x) => typeof x === "number" && !isNaN(x);
	const user = global.db.users[m.sender];
	if (typeof user !== "object") {
		global.db.users[m.sender] = {};
	}
	if (user) {
		if (!isNumber(user.exp)) {
			user.exp = 0;
		}
		if (!isNumber(user.limit)) {
			user.limit = process.env.LIMIT;
		}
		if (!isNumber(user.money)) {
			user.money = 0;
		}
		if (!isNumber(user.expired)) {
			user.expired = 0;
		}
		if (!isNumber(user.level)) {
			user.level = 0;
		}
		if (!isNumber(user.afk)) {
			user.afk = -1;
		}
		if (!isNumber(user.lastseen)) {
			user.lastseen = 0;
		}
		if (!isNumber(user.warn)) {
			user.warn = 0;
		}
		if (!("registered" in user)) {
			user.registered = false;
		}
		if (!user.registered) {
			if (!("name" in user)) {
				user.name = "";
			}
			if (!isNumber(user.age)) {
				user.age = 1;
			}
			if (!isNumber(user.unreglast)) {
				user.unreglast = 0;
			}
			if (!isNumber(user.regis_time)) {
				user.regis_time = -1;
			}
			if (!("serial_number" in user)) {
				user.serial_number = null;
			}
		}
		if (!("afkReason" in user)) {
			user.afkReason = "";
		}
		if (!("banned" in user)) {
			user.banned = false;
		}
		if (!("premium" in user)) {
			user.premium = false;
		}
		if (!("role" in user)) {
			user.role = "Newbie";
		}
		if (!("activity" in user)) {
			user.activity = {};
		}
	} else {
		global.db.users[m.sender] = {
			exp: 0,
			limit: process.env.LIMIT,
			money: 0,
			expired: 0,
			level: 0,
			afk: -1,
			lastseen: 0,
			warn: 0,
			registered: false,
			name: "",
			age: 1,
			unreglast: 0,
			regis_time: -1,
			serial_number: null,
			afkReason: "",
			banned: false,
			premium: false,
			role: "Newbie",
			activity: {},
		};
	}

	if (m.isGroup) {
		const group = global.db.groups[m.chat];
		if (typeof group !== "object") {
			global.db.groups[m.chat] = {};
		}
		if (group) {
			if (!isNumber(group.activity)) {
				group.activity = 0;
			}
			if (!isNumber(group.expired)) {
				group.expired = 0;
			}
			if (!("welcome_text" in group)) {
				group.welcome_text = "";
			}
			if (!("left_text" in group)) {
				group.left_text = "";
			}
			if (!("muted" in group)) {
				group.muted = false;
			}
			if (!("greeting" in group)) {
				group.greeting = false;
			}
			if (!("antilink" in group)) {
				group.antilink = false;
			}
			if (!("antiporn" in group)) {
				group.antiporn = false;
			}
			if (!("antitoxic" in group)) {
				group.antitoxic = false;
			}
			if (!("stay" in group)) {
				group.stay = false;
			}
			if (!("member" in group)) {
				group.member = {};
			}
		} else {
			global.db.groups[m.chat] = {
				activity: 0,
				expired: 0,
				welcome_text: "",
				left_text: "",
				muted: false,
				greeting: false,
				antilink: false,
				antiporn: false,
				antitoxic: false,
				stay: false,
				member: {},
			};
		}
	}

	const other = global.db.others;
	if (typeof other !== "object") {
		global.db.others = {};
	}
	if (other) {
		if (!("game" in other)) other.game = {};
		if (!("store" in other)) other.store = {};
		if (!("badwords" in other)) other.badwords = [];
		if (!("links" in other))
			other.links = ["chat.whatsapp.com", "whatsapp.com", "t.me"];
	} else {
		global.db.others = {
			game: {},
			store: {},
			badwords: [],
			links: ["chat.whatsapp.com", "whatsapp.com", "t.me"],
		};
	}

	const setting = global.db.setting;
	if (typeof setting !== "object") {
		global.db.setting = {};
	}
	if (setting) {
		if (!isNumber(setting.menu_style)) {
			setting.menu_style = 0;
		}
		if (!isNumber(setting.lastreset)) {
			setting.lastreset = new Date() * 1;
		}
		if (!("action_mode" in setting)) {
			setting.action_mode = false;
		}
		if (!("self_mode" in setting)) {
			setting.self_mode = false;
		}
		if (!("debug_mode" in setting)) {
			setting.debug_mode = false;
		}
		if (!("group_mode" in setting)) {
			setting.group_mode = false;
		}
		if (!("private_mode" in setting)) {
			setting.private_mode = false;
		}
		if (!("stick_pack" in setting)) {
			setting.stick_pack = "Sticker by";
		}
		if (!("stick_auth" in setting)) {
			setting.stick_auth = "@yoshida.js";
		}
		if (!("cmd_blocked" in setting)) {
			setting.cmd_blocked = [];
		}
		if (!("plugin_disable" in setting)) {
			setting.plugin_disable = [];
		}
		if (!("owners" in setting)) {
			setting.owners = ["5494920186"];
		}
		if (!("cover" in setting)) {
			setting.cover = "https://files.catbox.moe/xxa4gz.jpg";
		}
		if (!("msg" in setting)) {
			setting.msg =
				"Hi +tag 👋\nI am an automated system *(Telegram Bot)* that can help to do something, search and get data / information only through telegram.\n\n*⚡ Bot Status*\n› *Uptime* : +uptime\n› *Memory* : +mem\n› *Database* : +db\n› *Library* : Telegraf v +version\n\nIf you find an error or want to upgrade *premium* plan contact the [owner](@yuurahz)\n\n*📚 Available Commands*";
		}
	} else {
		global.db.setting = {
			menu_style: 0,
			lastreset: new Date() * 1,
			action_mode: false,
			self_mode: false,
			debug_mode: false,
			group_mode: false,
			private_mode: false,
			stick_pack: "Sticker by",
			stick_auth: "@yoshida.js",
			cmd_blocked: [],
			plugin_disable: [],
			owners: ["5494920186"],
			cover: "https://files.catbox.moe/xxa4gz.jpg",
			msg: "Hi +tag 👋\nI am an automated system *(Telegram Bot)* that can help to do something, search and get data / information only through telegram.\n\n*⚡ Bot Status*\n› *Uptime* : +uptime\n› *Memory* : +mem\n› *Database* : +db\n› *Library* : Telegraf v +version\n\nIf you find an error or want to upgrade *premium* plan contact the [owner](@yuurahz)\n\n*📚 Available Commands*",
		};
	}
};
