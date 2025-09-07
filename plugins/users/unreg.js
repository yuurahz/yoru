module.exports = {
	help: ["unregister", "checksn"],
	category: "user",
	command: /^(unreg(ister)?|checksn)$/i,
	run: async (m, { users }) => {
		if (/^checksn$/i.test(m.command)) {
			if (!users.registered) {
				return m.reply("❌ You're not registered yet!");
			}
			if (!users.serial_number) {
				return m.reply(
					"⚠️ You don't have a Serial Number yet. Please register again."
				);
			}
			return m.reply(
				`📌 Your Serial Number (SN): \`${users.serial_number}\``
			);
		}

		if (!users.registered) {
			return m.reply(
				`\`You're not registered yet!\`\nRegister first to *unreg*`
			);
		}

		if (!m.text) {
			return m.reply(
				`⚠️ Input your *serial number!*\nWant to check? Type: \`${m.prefix}checksn\``
			);
		}

		if (m.text !== users.serial_number) {
			return m.reply(
				`Invalid *serial number!*\nWant to check? Type: \`${m.prefix}checksn\``
			);
		}

		if (!users.unreglast || new Date() - users.unreglast > 86400000) {
			users.unreglast = new Date() * 1;

			users.registered = false;
			users.name = "";
			users.age = 0;
			users.regis_time = 0;
			users.serial_number = null;

			return m.reply(
				"✅ Successfully Unregistered. All your data has been reset."
			);
		} else {
			return m.reply(
				"⏰ You recently unregistered, please try again later!"
			);
		}
	},
};
