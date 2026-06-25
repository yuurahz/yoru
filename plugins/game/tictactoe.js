const tttGames = {};

const winPatterns = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8], // Rows
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8], // Columns
	[0, 4, 8],
	[2, 4, 6], // Diagonals
];

function checkWin(board, symbol) {
	return winPatterns.some((pattern) => {
		return pattern.every((index) => board[index] === symbol);
	});
}

function evaluateBoard(board, botSymbol, playerSymbol) {
	for (let pattern of winPatterns) {
		if (
			board[pattern[0]] === botSymbol &&
			board[pattern[1]] === botSymbol &&
			board[pattern[2]] === botSymbol
		) {
			return 10;
		}
		if (
			board[pattern[0]] === playerSymbol &&
			board[pattern[1]] === playerSymbol &&
			board[pattern[2]] === playerSymbol
		) {
			return -10;
		}
	}
	return 0;
}

function getBestMove(board, botSymbol, playerSymbol) {
	function minimax(tempBoard, depth, isMax) {
		const score = evaluateBoard(tempBoard, botSymbol, playerSymbol);
		if (score === 10) return score - depth;
		if (score === -10) return score + depth;
		if (!tempBoard.includes("")) return 0;

		if (isMax) {
			let best = -Infinity;
			for (let i = 0; i < 9; i++) {
				if (tempBoard[i] === "") {
					tempBoard[i] = botSymbol;
					best = Math.max(best, minimax(tempBoard, depth + 1, false));
					tempBoard[i] = "";
				}
			}
			return best;
		} else {
			let best = Infinity;
			for (let i = 0; i < 9; i++) {
				if (tempBoard[i] === "") {
					tempBoard[i] = playerSymbol;
					best = Math.min(best, minimax(tempBoard, depth + 1, true));
					tempBoard[i] = "";
				}
			}
			return best;
		}
	}

	let bestVal = -Infinity;
	let bestMove = -1;
	for (let i = 0; i < 9; i++) {
		if (board[i] === "") {
			board[i] = botSymbol;
			let moveVal = minimax(board, 0, false);
			board[i] = "";
			if (moveVal > bestVal) {
				bestVal = moveVal;
				bestMove = i;
			}
		}
	}
	return bestMove;
}

function renderBoard(board) {
	const inlineKeyboard = [];
	for (let i = 0; i < 9; i += 3) {
		const row = [];
		for (let j = 0; j < 3; j++) {
			const index = i + j;
			const val = board[index];
			const text = val === "X" ? "❌" : val === "O" ? "⭕" : "⬜";
			row.push({
				text: text,
				callback_data: `ttt_move:${index}`,
			});
		}
		inlineKeyboard.push(row);
	}

	inlineKeyboard.push([{ text: "🏳️ Forfeit", callback_data: "ttt_forfeit" }]);

	return { inline_keyboard: inlineKeyboard };
}

function renderFinalBoard(board) {
	const inlineKeyboard = [];
	for (let i = 0; i < 9; i += 3) {
		const row = [];
		for (let j = 0; j < 3; j++) {
			const index = i + j;
			const val = board[index];
			const text = val === "X" ? "❌" : val === "O" ? "⭕" : "⬜";
			row.push({
				text: text,
				callback_data: "ttt_ended",
			});
		}
		inlineKeyboard.push(row);
	}
	return { inline_keyboard: inlineKeyboard };
}

module.exports = {
	help: ["tictactoe"],
	category: "game",
	command: /^(tictactoe|ttt|ttc)$/i,
	desc: "Play an interactive game of Tic Tac Toe (Solo vs Bot or Multiplayer).",
	run: async (m, { client }) => {
		const subCommand = m.text.toLowerCase().trim();
		const gameSession = tttGames[m.chat];

		switch (subCommand) {
			case "create":
			case "new":
				if (gameSession) {
					return m.reply(
						"A Tic-Tac-Toe game is already in progress in this chat."
					);
				}

				tttGames[m.chat] = {
					board: Array(9).fill(""),
					players: { [m.sender]: "X" },
					playerNames: { [m.sender]: m.name },
					host: m.sender,
					status: "waiting",
					createdAt: Date.now(),
				};

				return m.reply(
					`❌ *Tic-Tac-Toe Game Created!* ⭕\n\n` +
						`Host (X): *@${m.name}*\n\n` +
						`Another player can type \`${m.prefix}ttt join\` to start the game.`
				);

			case "solo":
			case "bot":
				if (gameSession) {
					return m.reply(
						"A Tic-Tac-Toe game is already in progress in this chat."
					);
				}

				const botName = client.botInfo?.first_name || "Yoru Bot";
				const botId = "bot";

				tttGames[m.chat] = {
					board: Array(9).fill(""),
					players: {
						[m.sender]: "X",
						[botId]: "O",
					},
					playerNames: {
						[m.sender]: m.name,
						[botId]: botName,
					},
					host: m.sender,
					isSolo: true,
					status: "playing",
					turn: m.sender,
					createdAt: Date.now(),
				};

				await m.reply(
					`🎮 *Solo Tic-Tac-Toe Started!* 🎮\n\n` +
						`❌ Player: *@${m.name}*\n` +
						`⭕ Bot: *@${botName}*\n\n` +
						`It's your turn. Play using the buttons below.`
				);

				await m.reply(`*Grid Layout:*`, {
					reply_markup: renderBoard(tttGames[m.chat].board),
				});
				break;

			case "join":
				if (!gameSession) {
					return m.reply(
						`No game has been created. Use \`${m.prefix}ttt create\` to start one.`
					);
				}
				if (gameSession.status !== "waiting") {
					return m.reply("The game has already started or is full.");
				}
				if (gameSession.host === m.sender) {
					return m.reply("You cannot join your own game.");
				}

				gameSession.players[m.sender] = "O";
				gameSession.playerNames[m.sender] = m.name;
				gameSession.status = "playing";
				gameSession.turn = gameSession.host; // Host (X) plays first

				const hostName = gameSession.playerNames[gameSession.host];

				await m.reply(
					`🎮 *Tic-Tac-Toe Started!* 🎮\n\n` +
						`❌ X: *@${hostName}*\n` +
						`⭕ O: *@${m.name}*\n\n` +
						`It's *@${hostName}*'s (X) turn.`
				);

				await m.reply(`*Grid Layout:*`, {
					reply_markup: renderBoard(gameSession.board),
				});
				break;

			case "end":
			case "delete":
				if (!gameSession) {
					return m.reply("There is no active game to end.");
				}
				if (gameSession.host !== m.sender && !m.isAdmin) {
					return m.reply(
						"Only the host or a group admin can end the game."
					);
				}

				delete tttGames[m.chat];
				return m.reply("✅ The Tic-Tac-Toe game has been ended.");

			default:
				return m.reply(
					`❌ *Tic-Tac-Toe Commands* ⭕\n\n` +
						`\`${m.prefix}ttt create\` - Create a new multiplayer lobby.\n` +
						`\`${m.prefix}ttt join\` - Join a waiting multiplayer lobby.\n` +
						`\`${m.prefix}ttt solo\` - Start a game vs Bot (Smart AI).\n` +
						`\`${m.prefix}ttt end\` - End the current game.\n\n` +
						`*How to play:* Once started, play interactively using inline buttons!`
				);
		}
	},

	callback: async (m) => {
		if (!m.callbackData || !m.callbackData.startsWith("ttt_")) return;

		if (m.callbackData === "ttt_ended") {
			return m.answer("This game has already finished.", true);
		}

		const gameSession = tttGames[m.chat];
		if (!gameSession) {
			return m.answer("This game session has already ended.", true);
		}

		// Handle Forfeit
		if (m.callbackData === "ttt_forfeit") {
			if (!gameSession.players[m.sender]) {
				return m.answer("You are not a player in this game.", true);
			}

			const hostId = gameSession.host;
			const opponentId = Object.keys(gameSession.players).find(
				(id) => id !== hostId
			);
			const forfeiterName = gameSession.playerNames[m.sender];
			const winnerId = m.sender === hostId ? opponentId : hostId;
			const winnerName = gameSession.playerNames[winnerId] || "Opponent";

			await m.reply(
				`🏳️ *${forfeiterName} has forfeited the game!*\n\n🏆 *${winnerName} wins the match!*`
			);
			delete tttGames[m.chat];
			return m.delete();
		}

		// Handle Move
		if (m.callbackData.startsWith("ttt_move:")) {
			if (gameSession.status !== "playing") {
				return m.answer(
					"The game has not started yet. Wait for an opponent to join.",
					true
				);
			}

			const playerSymbol = gameSession.players[m.sender];
			if (!playerSymbol) {
				return m.answer("You are not a player in this game.", true);
			}

			if (gameSession.turn !== m.sender) {
				return m.answer("It's not your turn!", true);
			}

			const cellIndex = parseInt(m.callbackData.split(":")[1]);
			if (gameSession.board[cellIndex] !== "") {
				return m.answer("This cell is already occupied!", true);
			}

			// Apply Player Move
			gameSession.board[cellIndex] = playerSymbol;

			// Check Win after player move
			let isWin = checkWin(gameSession.board, playerSymbol);
			if (isWin) {
				const winnerName = gameSession.playerNames[m.sender];
				const finalKeyboard = renderFinalBoard(gameSession.board);

				await m.edit(
					`❌ *Tic-Tac-Toe Match Finished!* ⭕\n\n` +
						`🏆 *${winnerName} (${playerSymbol}) won the game!*`,
					{ reply_markup: finalKeyboard }
				);
				delete tttGames[m.chat];
				return;
			}

			// Check Tie after player move
			let isTie = gameSession.board.every((cell) => cell !== "");
			if (isTie) {
				const finalKeyboard = renderFinalBoard(gameSession.board);
				await m.edit(
					`❌ *Tic-Tac-Toe Match Finished!* ⭕\n\n` +
						`🤝 *It's a Draw!* The game is a tie.`,
					{ reply_markup: finalKeyboard }
				);
				delete tttGames[m.chat];
				return;
			}

			if (gameSession.isSolo) {
				const botSymbol = "O";
				const botMove = getBestMove(
					gameSession.board,
					botSymbol,
					playerSymbol
				);

				if (botMove !== -1) {
					gameSession.board[botMove] = botSymbol;
				}

				// Check Win after bot move
				isWin = checkWin(gameSession.board, botSymbol);
				if (isWin) {
					const botName = gameSession.playerNames["bot"];
					const finalKeyboard = renderFinalBoard(gameSession.board);

					await m.edit(
						`❌ *Tic-Tac-Toe Match Finished!* ⭕\n\n` +
							`🏆 *${botName} (${botSymbol}) won the game!*`,
						{ reply_markup: finalKeyboard }
					);
					delete tttGames[m.chat];
					return;
				}

				// Check Tie after bot move
				isTie = gameSession.board.every((cell) => cell !== "");
				if (isTie) {
					const finalKeyboard = renderFinalBoard(gameSession.board);
					await m.edit(
						`❌ *Tic-Tac-Toe Match Finished!* ⭕\n\n` +
							`🤝 *It's a Draw!* The game is a tie.`,
						{ reply_markup: finalKeyboard }
					);
					delete tttGames[m.chat];
					return;
				}

				// Render updated board for player's turn
				const keyboard = renderBoard(gameSession.board);
				await m.edit(
					`🎮 *Solo Tic-Tac-Toe* 🎮\n\n` +
						`❌ Player: *@${gameSession.playerNames[gameSession.host]}*\n` +
						`⭕ Bot: *@${gameSession.playerNames["bot"]}*\n\n` +
						`Turn: *${gameSession.playerNames[gameSession.host]}* (X)`,
					{ reply_markup: keyboard }
				);
			} else {
				// Multiplayer Turn Switching
				const hostId = gameSession.host;
				const opponentId = Object.keys(gameSession.players).find(
					(id) => id !== hostId
				);
				gameSession.turn =
					gameSession.turn === hostId ? opponentId : hostId;

				// Render updated board for next player
				const nextPlayerName =
					gameSession.playerNames[gameSession.turn];
				const nextSymbol = gameSession.players[gameSession.turn];
				const nextKeyboard = renderBoard(gameSession.board);

				await m.edit(
					`🎮 *Tic-Tac-Toe* 🎮\n\n` +
						`❌ X: *@${gameSession.playerNames[hostId]}*\n` +
						`⭕ O: *@${gameSession.playerNames[opponentId]}*\n\n` +
						`Turn: *${nextPlayerName}* (${nextSymbol})`,
					{ reply_markup: nextKeyboard }
				);
			}
		}
	},

	group: true,
	game: true,
};
