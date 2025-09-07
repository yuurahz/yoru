module.exports = {
	apps: [
		{
			script: "index.js",
			name: "ayumi",
			node_args: "--max-old-space-size=256",
			max_memory_restart: "300M",
			exp_backoff_restart_delay: 1000,
			min_uptime: 5000,
			max_restarts: 5,
			instances: 1,
			exec_mode: "fork",
		},
	],
};
