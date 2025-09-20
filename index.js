const connectTelegram = require("./main");

async function animateStartup() {
	const msg = "🚀 Starting Bot";
	for (let i = 0; i < 3; i++) {
		process.stdout.write(`\r${msg + ".".repeat(i + 1) + "   "}`);
		await new Promise((res) => setTimeout(res, 400));
	}
	process.stdout.write("\r" + " ".repeat(msg.length + 10) + "\r");
}

async function start() {
	try {
		await animateStartup();
		await connectTelegram();
	} catch (error) {
		console.error("Failed to start Bot:", error);
		process.exit(1);
	}
}

start();
