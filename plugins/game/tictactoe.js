const { TicTacToe, TicTacToeBot } = require("@library/tictactoe");
const ticTacToeGames = {};

function renderBoard(boardArray, playerXName) {
	const emojis = {
		X: "❌",
		O: "⭕",
		1: "1️⃣",
		2: "2️⃣",
		3: "3️⃣",
		4: "4️⃣",
		5: "5️⃣",
		6: "6️⃣",
		7: "7️⃣",
		8: "8️⃣",
		9: "9️⃣",
	};
	const board = boardArray.map((cell) => emojis[cell]);
	return (
		`🎮 *TIC TAC TOE vs BOT* 🤖\n\n` +
		`${board.slice(0, 3).join("")}\n` +
		`${board.slice(3, 6).join("")}\n` +
		`${board.slice(6, 9).join("")}\n\n` +
		`Your turn, *@${playerXName}* (❌).\nType a number from 1-9 to move.`
	);
}

module.exports = {
	help: ["tictactoe"],
	category: "game",
	command: /^(tictactoe|ttc|ttt)$/i,
	desc: "Play a game of Tic Tac Toe with a bot.",
	run: async (m, { client }) => {
		const subCommand = m.text.toLowerCase().trim();
		const userId = m.sender;

		if (subCommand === "delete" || subCommand === "end") {
			if (ticTacToeGames[userId]) {
				delete ticTacToeGames[userId];
				return m.reply("Your Tic Tac Toe session has been deleted.");
			}
			return m.reply("You are not in a game session.");
		}

		if (ticTacToeGames[userId]) {
			return m.reply(
				"You are already in a game! Type `surrender` to end your current game."
			);
		}

		const newGame = {
			id: `ttt-${Date.now()}`,
			game: new TicTacToe(userId, "bot"),
			bot: new TicTacToeBot(),
			state: "PLAYING",
		};
		ticTacToeGames[userId] = newGame;

		const boardText = renderBoard(newGame.game.render(), m.name);
		return m.reply(boardText);
	},

	before: async (m, { func }) => {
		const userId = m.sender;
		const room = ticTacToeGames[userId];

		if (!room || m.prefix) {
			return false;
		}

		const input = m.body.toLowerCase();

		if (["surrender", "nyerah"].includes(input)) {
			await m.reply("🏳️ You surrendered! The bot wins this time.");
			delete ticTacToeGames[userId];
			return true;
		}

		const move = parseInt(input);
		if (isNaN(move) || move < 1 || move > 9) {
			return false;
		}

		const game = room.game;
		const moveResult = game.turn(0, move - 1);

		if (moveResult < 1) {
			const errorMsg = {
				"-3": "The game has already ended.",
				"-1": "Invalid position.",
				0: "That position is already taken.",
			}[moveResult];
			m.reply(errorMsg || "Invalid move.");
			return true;
		}

		if (game.winner === userId || game.board === 511) {
			const isWin = game.winner === userId;
			let endText =
				renderBoard(game.render(), m.name).split("\n\n")[1] + "\n\n";
			endText += isWin
				? `🎉 Congratulations, you win!`
				: `🤝 It's a tie!`;
			await m.reply(endText);
			delete ticTacToeGames[userId];
			return true;
		}

		await m.reply("_🤖 Bot is thinking. . ._");
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const botMove = room.bot.getBestMove(game);
		game.turn(1, botMove);

		let botResponseText = renderBoard(game.render(), m.name);

		if (game.winner === "bot" || game.board === 511) {
			const isBotWin = game.winner === "bot";
			botResponseText =
				renderBoard(game.render(), m.name).split("\n\n")[1] + "\n\n";
			botResponseText += isBotWin
				? `🪄 The bot wins! Better luck next time.`
				: `🤝 It's a tie!`;
			delete ticTacToeGames[userId];
		}
		await m.reply(botResponseText);

		return true;
	},
};
