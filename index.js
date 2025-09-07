const connectTelegram = require("./main");
const Component = require("@yoshx/func").default;
const { Color } = new Component();

async function animateStartup() {
	const msg = "🚀 Starting Bot";
	for (let i = 0; i < 3; i++) {
		process.stdout.write(
			`\r${Color.bgRed(msg + ".".repeat(i + 1) + "   ")}`
		);
		await new Promise((res) => setTimeout(res, 400));
	}
	process.stdout.write("\r" + " ".repeat(msg.length + 10) + "\r");
}

async function start() {
	try {
		await animateStartup();
		await connectTelegram();
	} catch (error) {
		console.error(Color.bgRed("Failed to start Bot:"), error);
		process.exit(1);
	}
}

start();
