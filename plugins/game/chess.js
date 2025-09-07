const { Chess } = require("chess.js");
const Jimp = require("jimp");
const chessGames = {};

async function sendBoard(m, gameSession) {
	try {
		const game = gameSession.chess;
		const fen = game.fen().split(" ")[0];
		const turnColor = game.turn() === "w" ? "white" : "black";

		const boardUrl = `https://chessboardimage.com/${fen}.png?turn=${turnColor}&check=${game.inCheck()}`;

		const caption = `Turn: *${turnColor.capitalize()}* | Move #${Math.floor(game.moveNumber())}${game.inCheck() ? "\n\n*CHECK!*" : ""}`;

		await m.sendMedia(m.chat, boardUrl, {
			caption,
			reply_markup: {
				inline_keyboard: [
					[
						{ text: "📝 Info", callback_data: "chess_info" },
						{ text: "🔴 Forfeit", callback_data: "chess_forfeit" },
					],
				],
			},
		});
	} catch (e) {
		console.error("Failed to send chess board:", e);
		m.reply("Error: Could not display the board.");
	}
}

module.exports = {
	help: ["chess"],
	category: "game",
	command: /^(chess|catur|skak)$/i,
	desc: "Play a game of chess with another user in the group.",
	run: async (m, { client }) => {
		const subCommand = m.text.toLowerCase().trim();
		const gameSession = chessGames[m.chat];

		switch (subCommand) {
			case "create":
			case "new":
				if (gameSession)
					return m.reply(
						"A game is already in progress in this chat."
					);

				chessGames[m.chat] = {
					chess: new Chess(),
					players: { [m.sender]: "white" },
					playerNames: { [m.sender]: m.name },
					host: m.sender,
					status: "waiting",
					createdAt: Date.now(),
				};

				return m.reply(
					`♟️ *Chess Room Created!* ♟️\n\n` +
						`Host (White): *@${m.name}*\n\n` +
						`Another player can type \`/chess join\` to start the game.`
				);

			case "join":
				if (!gameSession)
					return m.reply(
						"No game has been created in this chat. Use `/chess create` to start one."
					);
				if (gameSession.status !== "waiting")
					return m.reply("The game has already started or is full.");
				if (gameSession.host === m.sender)
					return m.reply(
						"You are the host, you cannot join your own game as the opponent."
					);

				gameSession.players[m.sender] = "black";
				gameSession.playerNames[m.sender] = m.name;
				gameSession.status = "playing";

				const whitePlayerId = Object.keys(gameSession.players).find(
					(id) => gameSession.players[id] === "white"
				);

				await m.reply(
					`♟️ *Game Started!* ♟️\n\n` +
						`⚪️ White: *@${gameSession.playerNames[whitePlayerId]}*\n` +
						`⚫️ Black: *@${m.name}*\n\n` +
						`It's White's turn to move. Good luck to both of you!`
				);

				await sendBoard(m, gameSession);
				break;

			case "end":
			case "delete":
				if (!gameSession)
					return m.reply("There is no active game to end.");
				if (gameSession.host !== m.sender && !m.isAdmin)
					return m.reply(
						"Only the host or a group admin can end the game."
					);

				delete chessGames[m.chat];
				return m.reply(
					"✅ The chess game has been successfully ended."
				);

			default:
				return m.reply(
					`♟️ *Chess Commands* ♟️\n\n` +
						`\`/chess create\` - Start a new game.\n` +
						`\`/chess join\` - Join a waiting game.\n` +
						`\`/chess end\` - End the current game.\n\n` +
						`*How to move:* Simply type your move in algebraic notation (e.g., \`e4\`, \`Nf3\`, \`O-O\`).`
				);
		}
	},

	before: async (m) => {
		const gameSession = chessGames[m.chat];
		if (!gameSession || gameSession.status !== "playing" || m.prefix) {
			return false;
		}

		const game = gameSession.chess;
		const playerColor = gameSession.players[m.sender];

		if (!playerColor) return false;

		if (game.turn() !== playerColor[0]) {
			return m.reply("It's not your turn!");
		}

		try {
			const move = game.move(m.body, { sloppy: true });

			await sendBoard(m, gameSession);

			if (game.isGameOver()) {
				let endText = `*GAME OVER!* 🏁\n\n`;
				if (game.isCheckmate()) {
					endText += `*Checkmate!* ${playerColor.capitalize()} (*@${m.name}*) wins the game!`;
				} else if (game.isDraw()) {
					endText += `*Draw!* The game is a tie.`;
				} else if (game.isStalemate()) {
					endText += `*Stalemate!* The game is a draw.`;
				}
				await m.reply(endText);
				delete chessGames[m.chat];
				return true;
			}
		} catch (e) {
			return m.reply(
				`Invalid move: "${m.body}". Try again.\n_(e.g., e4, Nf3, O-O)_`
			);
		}

		return true;
	},

	callback: async (m) => {
		if (!m.callbackData.startsWith("chess_")) return;

		const gameSession = chessGames[m.chat];
		if (!gameSession)
			return m.answer("This game session has already ended.", true);

		switch (m.callbackData) {
			case "chess_info":
				const whitePlayerId = Object.keys(gameSession.players).find(
					(id) => gameSession.players[id] === "white"
				);
				const blackPlayerId = Object.keys(gameSession.players).find(
					(id) => gameSession.players[id] === "black"
				);
				const infoText = `*Game Info*\n- Status: ${gameSession.status}\n- White: @${gameSession.playerNames[whitePlayerId]}\n- Black: @${gameSession.playerNames[blackPlayerId] || "Waiting..."}`;
				return m.answer(infoText, true);

			case "chess_forfeit":
				if (!gameSession.players[m.sender])
					return m.answer("You are not a player in this game.", true);

				const winnerColor =
					gameSession.players[m.sender] === "white"
						? "Black"
						: "White";
				const winnerId = Object.keys(gameSession.players).find(
					(id) =>
						gameSession.players[id].toLowerCase() ===
						winnerColor.toLowerCase()
				);
				const winnerName =
					gameSession.playerNames[winnerId] || winnerColor;

				await m.reply(
					`*@${m.name} has forfeited the game!* 🐔\n\n*${winnerName} (${winnerColor}) wins!*`
				);

				delete chessGames[m.chat];
				return m.conn.telegram
					.deleteMessage(m.chat, m.id)
					.catch(() => {});
		}
	},
	group: true,
	game: true,
};
