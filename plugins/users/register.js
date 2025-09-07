const otpStore = {};
const crypto = require("crypto");

function generateSN(name, sender) {
	return crypto
		.createHash("md5")
		.update(name + sender)
		.digest("hex")
		.slice(0, 8)
		.toUpperCase();
}

module.exports = {
	help: ["register"],
	category: "user",
	command: /^(daftar|reg(ister)?)$/i,
	run: async (m, { func, users }) => {
		if (users.registered) {
			return m.reply(
				`\`You're already registered!\`\nWant to re-register?, type: ${m.prefix}unreg`
			);
		}

		if (!m.text.includes("|")) {
			return m.reply(
				`Enter your *name* and *age*\n\nFormat: *<name>* | *<age>*\n\nExample: \`${m.prefix + m.command} yoshi | 20\``
			);
		}

		let [name, age] = m.text.split("|").map((v) => v.trim());
		if (!name) return m.reply("Enter your name!");
		if (!age || isNaN(age))
			return m.reply("Enter your age! Age must be in number format.");
		age = parseInt(age);
		if (name.length > 50) return m.reply("Name is too long!");
		if (age > 100) return m.reply("Too old!");
		if (age < 3) return m.reply("Age too young!");

		const duplicate = Object.values(global.db.users).find(
			(u) => u.registered && u.name.toLowerCase() === name.toLowerCase()
		);
		if (duplicate)
			return m.reply(
				"Name is already registered, please use another name."
			);

		const otp = Math.floor(100000 + Math.random() * 900000).toString();

		otpStore[m.sender] = { name, age, otp, time: Date.now() };

		return m.reply(
			`📩 We have generated an OTP code for verification.\n\n` +
				`Your OTP code is: *${otp}*\n\n` +
				`⚠️ Valid for 3 minutes\n` +
				`Type this OTP to complete registration.`
		);
	},

	before: async (m, { func, users }) => {
		if (otpStore[m.sender]) {
			const data = otpStore[m.sender];

			if (Date.now() - data.time > 180000) {
				delete otpStore[m.sender];
				return m.reply("⏰ OTP has expired, please re-register.");
			}

			if (m.body.trim() === data.otp) {
				const { name, age } = data;

				const duplicate = Object.values(global.db.users).find(
					(u) =>
						u.registered &&
						u.name.toLowerCase() === name.toLowerCase()
				);

				if (duplicate) {
					delete otpStore[m.sender];
					return m.reply(
						"Name is already registered, please use another name."
					);
				}

				users.name = name.trim();
				users.age = age;
				users.regis_time = +new Date();
				users.registered = true;
				users.limit += 100;
				users.exp += 20000;
				users.money += 10000;

				const sn = generateSN(users.name, m.sender);
				users.serial_number = sn;

				delete otpStore[m.sender];

				const capt =
					"✅ *Registration Successful!*\n\n" +
					`🧑 Name: *${name}*\n` +
					`🎂 Age: *${age} years*\n` +
					`📅 Registered on: *${func.date()}*\n` +
					`🔑 Serial Number (SN): \`${sn}\`\n\n` +
					"🎁 *Bonus for New Users:*\n" +
					"› + 100 Limit\n" +
					"› + 20.000 Exp\n" +
					"› + 10.000 Money";
				return m.reply(capt);
			} else {
				return m.reply("❌ Invalid OTP! Try again.");
			}
		}
	},
};
