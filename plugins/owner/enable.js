module.exports = {
	help: ["enable", "disable"],
	category: ["owner", "group"],
	command: /^(enable|disable)$/i,
	desc: "Activate or deactivate bot features.",
	run: async (m, { setting }) => {
		const groupSet = global.db.groups[m.chat];

		const groupFeatures = ["greeting", "antilink", "antiporn", "antitoxic"];

		const globalFeatures = [
			"self_mode",
			"debug_mode",
			"action_mode",
			"group_mode",
			"private_mode",
		];

		const makeButtons = () => {
			let buttons = [];

			if (m.isGroup) {
				groupFeatures.forEach((feat) => {
					const status = groupSet[feat] ? "✅" : "❌";
					buttons.push([
						{
							text: `${status} ${feat}`,
							callback_data: `toggle_${feat}`,
						},
					]);
				});
			}
			if (m.isOwner) {
				globalFeatures.forEach((feat) => {
					const status = setting[feat] ? "✅" : "❌";
					buttons.push([
						{
							text: `${status} ${feat}`,
							callback_data: `toggle_${feat}`,
						},
					]);
				});
			}

			return buttons;
		};

		return m.reply("*Select feature to toggle:*", {
			reply_markup: { inline_keyboard: makeButtons() },
		});
	},

	callback: async (m, { setting }) => {
		if (!m.isCallback) return;
		if (!m.callbackData.startsWith("toggle_")) return;

		const feature = m.callbackData.replace("toggle_", "");
		const groupSet = global.db.groups[m.chat];

		const groupFeatures = ["greeting", "antilink", "antiporn", "antitoxic"];

		const globalFeatures = [
			"self_mode",
			"debug_mode",
			"action_mode",
			"group_mode",
			"private_mode",
		];

		let msg = "";

		if (groupFeatures.includes(feature)) {
			if (!m.isGroup) return m.answer(global.mess.group, true);
			if (!m.isAdmin && !m.isOwner)
				return m.answer(global.mess.admin, true);
			groupSet[feature] = !groupSet[feature];
			msg = `*${feature}* is now *${groupSet[feature] ? "enabled ✅" : "disabled ❌"}*`;
		} else if (globalFeatures.includes(feature)) {
			if (!m.isOwner) return m.answer(global.mess.owner, true);
			setting[feature] = !setting[feature];
			msg = `*${feature}* is now *${setting[feature] ? "enabled ✅" : "disabled ❌"}*`;
		} else {
			return m.answer("Unknown feature!", true);
		}

		const makeButtons = () => {
			let buttons = [];
			if (m.isGroup) {
				groupFeatures.forEach((feat) => {
					const status = groupSet[feat] ? "✅" : "❌";
					buttons.push([
						{
							text: `${status} ${feat}`,
							callback_data: `toggle_${feat}`,
						},
					]);
				});
			}
			if (m.isOwner) {
				globalFeatures.forEach((feat) => {
					const status = setting[feat] ? "✅" : "❌";
					buttons.push([
						{
							text: `${status} ${feat}`,
							callback_data: `toggle_${feat}`,
						},
					]);
				});
			}
			return buttons;
		};

		return m.edit(`${msg}\n\n*Select feature to toggle:*`, {
			reply_markup: { inline_keyboard: makeButtons() },
		});
	},
};
