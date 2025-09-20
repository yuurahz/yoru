const styles = {
	modifier: {
		reset: [0, 0],
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],

		/** Bright color */
		blackBright: [90, 39],
		gray: [90, 39],
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39],
	},
	bgColor: {
		black: [40, 49],
		red: [41, 49],
		green: [42, 49],
		yellow: [43, 49],
		blue: [44, 49],
		magenta: [45, 49],
		cyan: [46, 49],
		white: [47, 49],

		/** Bright color */
		blackBright: [100, 49],
		gray: [100, 49],
		redBright: [101, 49],
		greenBright: [102, 49],
		yellowBright: [103, 49],
		blueBright: [104, 49],
		magentaBright: [105, 49],
		cyanBright: [106, 49],
		whiteBright: [107, 49],
	},
};

function getAnsiStartCode(style) {
	const [start] = style;
	return `\x1b[${start}m`;
}

function getAnsiEndCode(style) {
	const [, end] = style;
	return `\x1b[${end}m`;
}

const Color = {
	reset: getAnsiStartCode(styles.modifier.reset),

	bold: (text) =>
		`${getAnsiStartCode(styles.modifier.bold)}${text}${getAnsiEndCode(styles.modifier.bold)}`,
	dim: (text) =>
		`${getAnsiStartCode(styles.modifier.dim)}${text}${getAnsiEndCode(styles.modifier.dim)}`,
	italic: (text) =>
		`${getAnsiStartCode(styles.modifier.italic)}${text}${getAnsiEndCode(styles.modifier.italic)}`,
	underline: (text) =>
		`${getAnsiStartCode(styles.modifier.underline)}${text}${getAnsiEndCode(styles.modifier.underline)}`,
	overline: (text) =>
		`${getAnsiStartCode(styles.modifier.overline)}${text}${getAnsiEndCode(styles.modifier.overline)}`,
	inverse: (text) =>
		`${getAnsiStartCode(styles.modifier.inverse)}${text}${getAnsiEndCode(styles.modifier.inverse)}`,
	hidden: (text) =>
		`${getAnsiStartCode(styles.modifier.hidden)}${text}${getAnsiEndCode(styles.modifier.hidden)}`,
	strikethrough: (text) =>
		`${getAnsiStartCode(styles.modifier.strikethrough)}${text}${getAnsiEndCode(styles.modifier.strikethrough)}`,

	bgBlack: getAnsiStartCode(styles.bgColor.black),
	bgRed: getAnsiStartCode(styles.bgColor.red),
	bgGreen: getAnsiStartCode(styles.bgColor.green),
	bgYellow: getAnsiStartCode(styles.bgColor.yellow),
	bgBlue: getAnsiStartCode(styles.bgColor.blue),
	bgMagenta: getAnsiStartCode(styles.bgColor.magenta),
	bgCyan: getAnsiStartCode(styles.bgColor.cyan),
	bgWhite: getAnsiStartCode(styles.bgColor.white),
	bgBlackBright: getAnsiStartCode(styles.bgColor.blackBright),
	bgGray: getAnsiStartCode(styles.bgColor.gray),
	bgRedBright: getAnsiStartCode(styles.bgColor.redBright),
	bgGreenBright: getAnsiStartCode(styles.bgColor.greenBright),
	bgYellowBright: getAnsiStartCode(styles.bgColor.yellowBright),
	bgBlueBright: getAnsiStartCode(styles.bgColor.blueBright),
	bgMagentaBright: getAnsiStartCode(styles.bgColor.magentaBright),
	bgCyanBright: getAnsiStartCode(styles.bgColor.cyanBright),
	bgWhiteBright: getAnsiStartCode(styles.bgColor.whiteBright),

	black: getAnsiStartCode(styles.color.black),
	red: getAnsiStartCode(styles.color.red),
	green: getAnsiStartCode(styles.color.green),
	yellow: getAnsiStartCode(styles.color.yellow),
	blue: getAnsiStartCode(styles.color.blue),
	magenta: getAnsiStartCode(styles.color.magenta),
	cyan: getAnsiStartCode(styles.color.cyan),
	white: getAnsiStartCode(styles.color.white),
	blackBright: getAnsiStartCode(styles.color.blackBright),
	gray: getAnsiStartCode(styles.color.gray),
	redBright: getAnsiStartCode(styles.color.redBright),
	greenBright: getAnsiStartCode(styles.color.greenBright),
	yellowBright: getAnsiStartCode(styles.color.yellowBright),
	blueBright: getAnsiStartCode(styles.color.blueBright),
	magentaBright: getAnsiStartCode(styles.color.magentaBright),
	cyanBright: getAnsiStartCode(styles.color.cyanBright),
	whiteBright: getAnsiStartCode(styles.color.whiteBright),

	hex: (hex) => (text) => {
		let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
		if (cleanHex.length === 3) {
			cleanHex = cleanHex
				.split("")
				.map((c) => c + c)
				.join("");
		}
		if (cleanHex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(cleanHex)) {
			console.warn(
				`[Color.js WARN] Invalid hex color format: '${hex}'. Returning uncolored text.`
			);
			return text;
		}

		const rgb = cleanHex.match(/.{2}/g).map((x) => parseInt(x, 16));

		return `\x1B[38;2;${rgb.join(";")}m${text}\x1B[0m`;
	},
};

module.exports = Color;
