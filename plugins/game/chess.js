const { Chess } = require("chess.js");
const chessGames = {};

const winPatterns = []; // Placeholder, win checking is handled by chess.js game.isGameOver()

function getPieceValue(type) {
	if (type === "p") return 10;
	if (type === "n") return 30;
	if (type === "b") return 30;
	if (type === "r") return 50;
	if (type === "q") return 90;
	if (type === "k") return 1000;
	return 0;
}

function evaluateChessBoard(board) {
	let totalEvaluation = 0;
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const square = board[r][c];
			if (square) {
				const value = getPieceValue(square.type);
				totalEvaluation += square.color === "w" ? value : -value;
			}
		}
	}
	return totalEvaluation;
}

function minimaxChess(game, depth, alpha, beta, isMaximizingPlayer) {
	if (depth === 0 || game.isGameOver()) {
		return evaluateChessBoard(game.board());
	}

	const moves = game.moves({ verbose: true });

	if (isMaximizingPlayer) {
		let bestVal = -Infinity;
		for (let move of moves) {
			game.move(move);
			bestVal = Math.max(
				bestVal,
				minimaxChess(game, depth - 1, alpha, beta, false)
			);
			game.undo();
			alpha = Math.max(alpha, bestVal);
			if (beta <= alpha) break;
		}
		return bestVal;
	} else {
		let bestVal = Infinity;
		for (let move of moves) {
			game.move(move);
			bestVal = Math.min(
				bestVal,
				minimaxChess(game, depth - 1, alpha, beta, true)
			);
			game.undo();
			beta = Math.min(beta, bestVal);
			if (beta <= alpha) break;
		}
		return bestVal;
	}
}

function makeBotMove(game) {
	const moves = game.moves({ verbose: true });
	if (moves.length === 0) return null;

	let bestMove = null;
	let bestValue = Infinity; // Bot is Black (minimizing)

	// Shuffle moves to add variety
	moves.sort(() => 0.5 - Math.random());

	for (let move of moves) {
		game.move(move);
		const boardVal = minimaxChess(game, 1, -Infinity, Infinity, true);
		game.undo();

		if (boardVal < bestValue) {
			bestValue = boardVal;
			bestMove = move;
		}
	}
	return bestMove;
}

function getCapturedPieces(remaining) {
	const startCount = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
	const capturedWhite = [];
	const capturedBlack = [];
	const pieceNames = ["p", "n", "b", "r", "q", "k"];

	// White pieces captured (by Black)
	pieceNames.forEach((type) => {
		const diff = startCount[type] - (remaining.white[type] || 0);
		for (let i = 0; i < diff; i++) {
			capturedWhite.push(
				"♙♘♗♖♕♔"[["p", "n", "b", "r", "q", "k"].indexOf(type)]
			);
		}
	});

	// Black pieces captured (by White)
	pieceNames.forEach((type) => {
		const diff = startCount[type] - (remaining.black[type] || 0);
		for (let i = 0; i < diff; i++) {
			capturedBlack.push(
				"♟♞♝♜♛♚"[["p", "n", "b", "r", "q", "k"].indexOf(type)]
			);
		}
	});

	return {
		byWhite: capturedBlack.join(" "), // Black pieces captured by White
		byBlack: capturedWhite.join(" "), // White pieces captured by Black
	};
}

async function sendBoard(m, gameSession) {
	try {
		const game = gameSession.chess;
		const board = game.board();
		const fen = game.fen().split(" ")[0];
		const turnColor = game.turn() === "w" ? "white" : "black";

		const boardUrl = `https://chessboardimage.com/${fen}.png?turn=${turnColor}&check=${game.inCheck()}`;

		// Count remaining pieces
		const remaining = {
			white: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0, total: 0 },
			black: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0, total: 0 },
		};

		for (let r = 0; r < 8; r++) {
			for (let c = 0; c < 8; c++) {
				const square = board[r][c];
				if (square) {
					const side = square.color === "w" ? "white" : "black";
					remaining[side][square.type]++;
					remaining[side].total++;
				}
			}
		}

		// Calculate captured pieces
		const captured = getCapturedPieces(remaining);

		// Format players name
		const whitePlayerId = Object.keys(gameSession.players).find(
			(id) => gameSession.players[id] === "white"
		);
		const blackPlayerId = Object.keys(gameSession.players).find(
			(id) => gameSession.players[id] === "black"
		);
		const whitePlayerName = gameSession.playerNames[whitePlayerId];
		const blackPlayerName = gameSession.playerNames[blackPlayerId] || "bot";

		let caption =
			`♟️ *Chess Match Update* ♟️\n\n` +
			`⚪ *White*: *@${whitePlayerName}* (${remaining.white.total}/16)\n` +
			`⚫ *Black*: *@${blackPlayerName}* (${remaining.black.total}/16)\n\n` +
			`› *Active Turn*: *${turnColor.toUpperCase()}*\n` +
			`› *Move Count*: #${Math.floor(game.moveNumber())}\n`;

		if (game.inCheck()) {
			caption += `\n⚠️ *CHECK!*\n`;
		}

		caption +=
			`\n*Captured Pieces*:\n` +
			`› By White: ${captured.byWhite || "None"}\n` +
			`› By Black: ${captured.byBlack || "None"}`;

		const boardMsg = await m.sendMedia(m.chat, boardUrl, {
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

		if (gameSession.lastBoardMessageId) {
			await m.delete(gameSession.lastBoardMessageId);
		}
		gameSession.lastBoardMessageId = boardMsg.message_id;
	} catch (e) {
		console.error("Failed to send chess board:", e);
		m.reply("Error: Could not display the board.");
	}
}

module.exports = {
	help: ["chess"],
	category: "game",
	command: /^(chess|catur|skak)$/i,
	desc: "Play chess in the group (Solo vs Bot or Multiplayer).",
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

			case "solo":
			case "bot":
				if (gameSession)
					return m.reply(
						"A game is already in progress in this chat."
					);

				const botName = client.botInfo?.first_name || "Yoru Bot";
				const botId = "bot";

				chessGames[m.chat] = {
					chess: new Chess(),
					players: {
						[m.sender]: "white",
						[botId]: "black",
					},
					playerNames: {
						[m.sender]: m.name,
						[botId]: botName,
					},
					host: m.sender,
					isSolo: true,
					status: "playing",
					createdAt: Date.now(),
				};

				await m.reply(
					`♟️ *Solo Chess Started!* ♟️\n\n` +
						`⚪️ White (Player): *@${m.name}*\n` +
						`⚫️ Black (Bot): *@${botName}*\n\n` +
						`It's your turn to move. Good luck!`
				);

				await sendBoard(m, chessGames[m.chat]);
				break;

			case "join":
				if (!gameSession)
					return m.reply(
						"No game has been created in this chat. Use `/chess create` to start one."
					);
				if (gameSession.status !== "waiting")
					return m.reply("The game has already started or is full.");
				if (gameSession.host === m.sender)
					return m.reply("You cannot join your own game.");

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
				return m.reply("✅ The chess game has been ended.");

			default:
				return m.reply(
					`♟️ *Chess Commands* ♟️\n\n` +
						`\`/chess create\` - Start a new multiplayer game.\n` +
						`\`/chess join\` - Join a waiting game.\n` +
						`\`/chess solo\` - Play against the Bot (AI).\n` +
						`\`/chess end\` - End the current game.\n\n` +
						`*How to move:* Simply type your move in algebraic notation (e.g., \`e4\`, \`Nf3\`, \`O-O\`, or \`e2e4\`).`
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
			let move;
			const moveParsed = m.body.trim();
			const coords = moveParsed.toLowerCase().match(/[a-h][1-8]/g);

			if (coords && coords.length === 2) {
				let promo = "q";
				const promoMatch = moveParsed.toLowerCase().match(/[qrbn]/);
				if (promoMatch) promo = promoMatch[0];

				move = game.move({
					from: coords[0],
					to: coords[1],
					promotion: promo,
				});
			} else {
				move = game.move(moveParsed, { sloppy: true });
			}

			if (!move) {
				throw new Error("Invalid move");
			}

			if (game.isGameOver()) {
				await sendBoard(m, gameSession);
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

			if (gameSession.isSolo) {
				const botMove = makeBotMove(game);
				if (botMove) {
					game.move(botMove);
				}

				await sendBoard(m, gameSession);

				if (game.isGameOver()) {
					let endText = `*GAME OVER!* 🏁\n\n`;
					if (game.isCheckmate()) {
						endText += `*Checkmate!* Black (*@${gameSession.playerNames["bot"]}*) wins the game!`;
					} else if (game.isDraw()) {
						endText += `*Draw!* The game is a tie.`;
					} else if (game.isStalemate()) {
						endText += `*Stalemate!* The game is a draw.`;
					}
					await m.reply(endText);
					delete chessGames[m.chat];
					return true;
				}
			} else {
				await sendBoard(m, gameSession);
			}
		} catch (e) {
			return m.reply(
				`Invalid move: "${m.body}". Try again.\n_(e.g., e4, Nf3, O-O, or e2e4)_`
			);
		}

		return true;
	},

	callback: async (m) => {
		if (!m.callbackData.startsWith("chess_")) return;

		const gameSession = chessGames[m.chat];
		if (!gameSession)
			return m.answer("This game session has already ended.", true);

		const whitePlayerId = Object.keys(gameSession.players).find(
			(id) => gameSession.players[id] === "white"
		);
		const blackPlayerId = Object.keys(gameSession.players).find(
			(id) => gameSession.players[id] === "black"
		);

		switch (m.callbackData) {
			case "chess_info":
				const game = gameSession.chess;
				const board = game.board();

				const remaining = {
					white: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0, total: 0 },
					black: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0, total: 0 },
				};

				for (let r = 0; r < 8; r++) {
					for (let c = 0; c < 8; c++) {
						const square = board[r][c];
						if (square) {
							const side =
								square.color === "w" ? "white" : "black";
							remaining[side][square.type]++;
							remaining[side].total++;
						}
					}
				}

				const captured = getCapturedPieces(remaining);

				const infoText =
					`📋 Detailed Chess Info 📋\n\n` +
					`⚪ White: @${gameSession.playerNames[whitePlayerId]} (${remaining.white.total}/16 left)\n` +
					`⚫ Black: @${gameSession.playerNames[blackPlayerId] || "bot"} (${remaining.black.total}/16 left)\n\n` +
					`Captured by White: ${captured.byWhite || "None"}\n` +
					`Captured by Black: ${captured.byBlack || "None"}`;

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
				return m.delete();
		}
	},
	group: true,
	game: true,
};
