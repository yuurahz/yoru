const path = require("node:path");
const { ReadStream } = require("node:fs");

module.exports = async (client, update) => {
	try {
		const cq = update.callback_query || null;
		const msg =
			update.message || update.edited_message || cq?.message || null;
		if (!msg && !cq) return;

		const actor = cq ? cq.from : msg?.from;

		let m = {};
		m.msg = msg;
		m.id = msg?.message_id || cq?.message?.message_id;
		m.chat = (msg?.chat && msg.chat.id) || cq?.message?.chat.id;
		m.sender = actor?.id;
		m.from = actor || {};
		m.username = actor?.username;
		m.name =
			[actor?.first_name, actor?.last_name].filter(Boolean).join(" ") ||
			(actor?.username ? `@${actor.username}` : "User");

		m.fromMe = m.sender == client.botInfo?.id;
		m.isBot = actor?.is_bot || false;
		const chatType = msg?.chat?.type || cq?.message?.chat?.type;
		m.isGroup = chatType === "group" || chatType === "supergroup";
		m.type = Object.keys(msg || cq)[0];
		m.body = msg?.text || msg?.caption || cq?.data || "";

		const prefixRegex = /^[\\/!.#]/;
		m.prefix = prefixRegex.test(m.body)
			? m.body.match(prefixRegex)[0]
			: "/";

		if (m.prefix) {
			let command = m.body
				.slice(m.prefix.length)
				.trim()
				.split(/ +/)
				.shift()
				.toLowerCase();
			if (command.includes("@")) {
				const [cmd, botUsername] = command.split("@");
				if (botUsername === client.botInfo.username) command = cmd;
				else m.prefix = null;
			}

			if (m.prefix) {
				const args = m.body.slice(m.prefix.length).trim().split(/ +/);
				args.shift();
				m.command = command;
				m.args = args;
				m.text = args.join(" ").trim();
			}
		} else {
			m.command = null;
			m.args = [];
			m.text = m.body.trim();
		}

		m.isUrl = (m.body.match(/https?:\/\/[^\s]+/g) || [])[0] || "";

		m.mentions = [];
		if (msg?.entities) {
			msg.entities.forEach((ent) => {
				if (ent.type === "mention") {
					m.mentions.push(m.text.substr(ent.offset, ent.length));
				}
			});
		}

		const owners = Array.isArray(global.db?.setting?.owners)
			? global.db.setting.owners
			: [];
		const norm = (v) => String(v).replace(/[^\d]/g, "");
		const ownerIds = owners.map(norm);
		m.isOwner = ownerIds.includes(norm(m.sender));

		m.isAdmin = false;
		m.isBotAdmin = false;
		if (m.isGroup) {
			try {
				const meId =
					client.botInfo?.id || (await client.telegram.getMe()).id;
				const me = await client.telegram.getChatMember(m.chat, meId);
				const usr = await client.telegram.getChatMember(
					m.chat,
					m.sender
				);
				const admin = new Set(["administrator", "creator"]);
				m.isBotAdmin = admin.has(me.status);
				m.isAdmin = admin.has(usr.status);
			} catch (e) {
				m.isAdmin = m.isBotAdmin = false;
			}
		}

		if (cq) {
			m.isCallback = true;
			m.callbackId = cq.id;
			m.callbackData = cq.data;
		} else {
			m.isCallback = false;
			m.callbackId = null;
			m.callbackData = null;
		}

		m.quoted = null;
		m.isQuoted = false;
		if (msg?.reply_to_message) {
			m.isQuoted = true;
			let q = msg.reply_to_message;
			let qBody = q.text || q.caption || "";
			const prefixQ = prefixRegex.test(qBody)
				? qBody.match(prefixRegex)[0]
				: null;

			let qCommand = null;
			let qArgs = [];
			let qText = qBody.trim();

			if (prefixQ) {
				const [cmd, ...rest] = qBody
					.slice(prefixQ.length)
					.trim()
					.split(/\s+/);
				qCommand = cmd ? cmd.toLowerCase() : null;
				qArgs = rest;
				qText = rest.join(" ").trim();
			}

			m.quoted = {
				id: q.message_id,
				chat: q.chat.id,
				sender: q.from?.id,
				name: q.from?.first_name || "",
				isBot: q.from?.is_bot || false,
				type: Object.keys(q)[0],
				body: qBody,
				prefix: prefixQ,
				command: qCommand,
				args: qArgs,
				text: qText,
				isUrl: (qBody.match(/https?:\/\/[^\s]+/g) || [])[0] || "",
				download: async () => {
					try {
						if (q.photo) {
							const file = await client.telegram.getFileLink(
								q.photo[q.photo.length - 1].file_id
							);
							return file.href;
						}
						if (q.document) {
							const file = await client.telegram.getFileLink(
								q.document.file_id
							);
							return file.href;
						}
						if (q.audio) {
							const file = await client.telegram.getFileLink(
								q.audio.file_id
							);
							return file.href;
						}
						if (q.video) {
							const file = await client.telegram.getFileLink(
								q.video.file_id
							);
							return file.href;
						}
						return null;
					} catch (e) {
						console.error("Quoted download error:", e);
						return null;
					}
				},
			};
		}

		m.answer = (text, showAlert = false) => {
			if (!m.isCallback) return;
			client.telegram.answerCbQuery(m.callbackId, text, {
				show_alert: showAlert,
			});
		};

		m.reply = (text, opt = {}) =>
			client.telegram.sendMessage(m.chat, text, {
				reply_to_message_id: m.id,
				parse_mode: "Markdown",
				...opt,
			});

		m.react = async (emoji) => {
			try {
				client.telegram.setMessageReaction(from, m.id, [
					{ type: "emoji", emoji },
				]);
			} catch {}
		};

		m.edit = async (content, opt = {}) => {
			try {
				if (typeof content === "string") {
					return await client.telegram
						.editMessageText(m.chat, m.id, undefined, content, {
							parse_mode: "Markdown",
							...opt,
						})
						.catch(() =>
							client.telegram.editMessageCaption(
								m.chat,
								m.id,
								undefined,
								content,
								{
									parse_mode: "Markdown",
									...opt,
								}
							)
						);
				} else if (
					content &&
					typeof content === "object" &&
					content.type &&
					content.media
				) {
					return await client.telegram.editMessageMedia(
						m.chat,
						m.id,
						undefined,
						{
							type: content.type,
							media: content.media,
							caption: opt.caption || "",
							parse_mode: "Markdown",
						},
						{ reply_markup: opt.reply_markup }
					);
				}
			} catch (e) {
				console.error("Edit error:", e.message);
			}
		};

		m.delete = (messageId = m.id) =>
			client.telegram.deleteMessage(m.chat, messageId).catch(() => {});

		m.sendMedia = async (jid, input, opt = {}) => {
			const source =
				Buffer.isBuffer(input) || input instanceof ReadStream
					? { source: input }
					: input;

			let type = opt.type;
			if (!type && typeof input === "string") {
				const ext = path.extname(input).toLowerCase();
				if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext))
					type = "photo";
				else if ([".mp4", ".mkv", ".mov"].includes(ext)) type = "video";
				else if ([".mp3", ".ogg", ".wav"].includes(ext)) type = "audio";
				else if (
					[".pdf", ".zip", ".rar", ".txt", ".doc", ".docx"].includes(
						ext
					)
				)
					type = "document";
				else if ([".webp"].includes(ext)) type = "sticker";
			}

			const baseOpt = {
				reply_to_message_id: m.id,
				parse_mode: "Markdown",
				...opt,
			};

			switch (type) {
				case "photo":
					return client.telegram.sendPhoto(jid, source, baseOpt);
				case "video":
					return client.telegram.sendVideo(jid, source, baseOpt);
				case "audio":
					return client.telegram.sendAudio(jid, source, baseOpt);
				case "document":
					return client.telegram.sendDocument(jid, source, baseOpt);
				case "sticker":
					return client.telegram.sendSticker(jid, source, baseOpt);
				default:
					return client.telegram.sendDocument(jid, source, baseOpt);
			}
		};

		m.forward = (jid) => client.telegram.forwardMessage(jid, m.chat, m.id);

		m.download = async () => {
			try {
				if (msg?.photo) {
					const file = await client.telegram.getFileLink(
						msg.photo[msg.photo.length - 1].file_id
					);
					return file.href;
				}
				if (msg?.document) {
					const file = await client.telegram.getFileLink(
						msg.document.file_id
					);
					return file.href;
				}
				if (msg?.audio) {
					const file = await client.telegram.getFileLink(
						msg.audio.file_id
					);
					return file.href;
				}
				if (msg?.video) {
					const file = await client.telegram.getFileLink(
						msg.video.file_id
					);
					return file.href;
				}
				return null;
			} catch (e) {
				console.error("Download error:", e);
				return null;
			}
		};

		return m;
	} catch (e) {
		console.error("Serialize error:", e);
		return null;
	}
};
