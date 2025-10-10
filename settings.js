const func = require("./system/functions");

global.mess = Object.freeze({
	owner: func.texted(
		"italic",
		"This command can only be used by the bot owner."
	),
	premium: func.texted("italic", "This command is for premium users only."),
	group: func.texted("italic", "This command can only be used in groups."),
	private: func.texted(
		"italic",
		"This command can only be used in private chat."
	),
	admin: func.texted(
		"italic",
		"This command can only be used by group admins."
	),
	botAdmin: func.texted(
		"italic",
		"This command can only be used when the bot is an admin."
	),
	blocked_cmd: func.texted(
		"italic",
		"Currently this command is not available or is being repaired."
	),
	wait: func.texted("bold", "Please wait. . ."),
	wrong: func.texted("bold", "Something wrong, try again later. . ."),
	error: func.texted("bold", "An error occurred, please try again later."),
	register:
		"`Only For Registered User`\n\nPlease register first to get a more interesting experience in interacting with bots\n\nType: `{{prefix}}register` to start registration.",
});

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};
