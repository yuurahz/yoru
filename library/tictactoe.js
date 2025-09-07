class TicTacToe {
	constructor(playerX = "x", playerO = "o") {
		this.playerX = playerX;
		this.playerO = playerO;
		this._currentTurn = false;
		this._x = 0;
		this._o = 0;
		this.turns = 0;
	}

	get board() {
		return this._x | this._o;
	}

	get currentTurn() {
		return this._currentTurn ? this.playerO : this.playerX;
	}

	get enemyTurn() {
		return this._currentTurn ? this.playerX : this.playerO;
	}

	static check(state) {
		for (let combo of [7, 56, 73, 84, 146, 273, 292, 448])
			if ((state & combo) === combo) return !0;
		return !1;
	}

	/**
	 * ```js
	 * TicTacToe.toBinary(1, 2) // 0b010000000
	 * ```
	 */
	static toBinary(x = 0, y = 0) {
		if (x < 0 || x > 2 || y < 0 || y > 2)
			throw new Error("invalid position");
		return 1 << (x + 3 * y);
	}

	/**
	 * @param player `0` is `X`, `1` is `O`
	 *
	 * - `-3` `Game Ended`
	 * - `-2` `Invalid`
	 * - `-1` `Invalid Position`
	 * - ` 0` `Position Occupied`
	 * - ` 1` `Sucess`
	 * @returns {-3|-2|-1|0|1}
	 */
	turn(player = 0, x = 0, y) {
		if (this.board === 511) return -3;
		let pos = 0;
		if (y == null) {
			if (x < 0 || x > 8) return -1;
			pos = 1 << x;
		} else {
			if (x < 0 || x > 2 || y < 0 || y > 2) return -1;
			pos = TicTacToe.toBinary(x, y);
		}
		if (this._currentTurn ^ player) return -2;
		if (this.board & pos) return 0;
		this[this._currentTurn ? "_o" : "_x"] |= pos;
		this._currentTurn = !this._currentTurn;
		this.turns++;
		return 1;
	}

	/**
	 * @returns {('X'|'O'|1|2|3|4|5|6|7|8|9)[]}
	 */
	static render(boardX = 0, boardO = 0) {
		let x = parseInt(boardX.toString(2), 4);
		let y = parseInt(boardO.toString(2), 4) * 2;
		return [...(x + y).toString(4).padStart(9, "0")]
			.reverse()
			.map((value, index) =>
				value == 1 ? "X" : value == 2 ? "O" : ++index
			);
	}

	/**
	 * @returns {('X'|'O'|1|2|3|4|5|6|7|8|9)[]}
	 */
	render() {
		return TicTacToe.render(this._x, this._o);
	}

	get winner() {
		let x = TicTacToe.check(this._x);
		let o = TicTacToe.check(this._o);
		return x ? this.playerX : o ? this.playerO : false;
	}
}

class TicTacToeBot {
	constructor() {
		this.winPatterns = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
	}

	getBestMove(game) {
		const board = [];
		for (let i = 0; i < 9; i++) {
			const playerXMask = 1 << i;
			const playerOMask = 1 << (i + 9);

			if (game.board & playerXMask) {
				board[i] = "X";
			} else if (game.board & playerOMask) {
				board[i] = "O";
			} else {
				board[i] = null;
			}
		}

		let move = this.findWinningMove(board, "O");
		if (move !== -1) return move;

		move = this.findWinningMove(board, "X");
		if (move !== -1) return move;

		if (board[4] === null) return 4;

		const corners = [0, 2, 6, 8];
		const availableCorners = corners.filter((pos) => board[pos] === null);
		if (availableCorners.length > 0) {
			return availableCorners[
				Math.floor(Math.random() * availableCorners.length)
			];
		}

		for (let i = 0; i < 9; i++) {
			if (board[i] === null) return i;
		}

		return -1;
	}

	findWinningMove(board, symbol) {
		for (const pattern of this.winPatterns) {
			const [a, b, c] = pattern;
			const values = [board[a], board[b], board[c]];

			if (
				values.filter((v) => v === symbol).length === 2 &&
				values.filter((v) => v === null).length === 1
			) {
				return pattern[values.indexOf(null)];
			}
		}
		return -1;
	}
}

module.exports = { TicTacToe, TicTacToeBot };
