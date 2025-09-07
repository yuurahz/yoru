const util = require("util");
const { exec: _exec } = require("child_process");

function escapeHtml(str = "") {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function chunkText(str, max = 3500) {
	const chunks = [];
	let i = 0;
	while (i < str.length) {
		chunks.push(str.slice(i, i + max));
		i += max;
	}
	return chunks;
}

module.exports = {
	before: async (
		m,
		{
			api,
			client,
			func,
			users,
			setting,
			plugins,
			uploader,
			isPrems,
			groupSet,
		}
	) => {
		if (m.body.startsWith(">")) {
			if (!m.isOwner) {
				return m.reply(global.mess.owner);
			}

			const text = m.body.slice(2).trim();
			if (!text) return m.reply("Usage: => <code>");

			try {
				let result = await eval(`(async () => { ${text} })()`);
				if (typeof result !== "string") {
					result = util.inspect(result, { depth: 1 });
				}
				const chunks = chunkText(result, 3500);
				for (let c of chunks) {
					await m.reply(`<pre>${escapeHtml(c)}</pre>`, {
						parse_mode: "HTML",
					});
				}
			} catch (e) {
				await m.reply(`<pre>${escapeHtml(e.stack)}</pre>`, {
					parse_mode: "HTML",
				});
			}
		} else if (m.body.startsWith("=>")) {
			if (!m.isOwner) {
				return m.reply(global.mess.owner);
			}

			const text = m.body.slice(2).trim();
			if (!text) return m.reply("Usage: => <code>");

			try {
				let result = await eval(text);
				if (typeof result !== "string") {
					result = util.inspect(result, { depth: 1 });
				}
				const chunks = chunkText(result, 3500);
				for (let c of chunks) {
					await m.reply(`<pre>${escapeHtml(c)}</pre>`, {
						parse_mode: "HTML",
					});
				}
			} catch (e) {
				await m.reply(`<pre>${escapeHtml(e.stack)}</pre>`, {
					parse_mode: "HTML",
				});
			}
		} else if (m.body.startsWith("$")) {
			if (!m.isOwner) {
				return m.reply(global.mess.owner);
			}

			const text = m.body.slice(1).trim();
			if (!text) return m.reply("Usage: $ <shell command>");

			_exec(text, { timeout: 60000 }, async (err, stdout, stderr) => {
				let out = "";
				if (err) out = err.message;
				else out = stdout || stderr || "✅ Command executed.";

				const chunks = chunkText(out, 3500);
				for (let c of chunks) {
					await m.reply(`<pre>${escapeHtml(c)}</pre>`, {
						parse_mode: "HTML",
					});
				}
			});
			return;
		}
	},
};
