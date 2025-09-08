module.exports = {
	apps: [
		{
			name: "yoru",
			script: "index.js",
			exec_mode: "fork",
			instances: 1,
			max_memory_restart: "300M",
		},
	],
};
