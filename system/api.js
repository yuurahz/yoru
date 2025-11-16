/** api urls */
const APIs = {
	yosh: "https://api.yoshx.me",
	gratis: "https://api.apigratis.cc",
};

/** api key */
const APIKeys = {
	"https://api.yoshx.me": process.env.YOSHIDA_KEY,
};

module.exports = api = (name, path = "/", query = {}, apikeyqueryname) =>
	(name in APIs ? APIs[name] : name) +
	path +
	(query || apikeyqueryname
		? "?" +
			new URLSearchParams(
				Object.entries({
					...query,
					...(apikeyqueryname
						? {
								[apikeyqueryname]:
									APIKeys[name in APIs ? APIs[name] : name],
							}
						: {}),
				})
			)
		: "");
