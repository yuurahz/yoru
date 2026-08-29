async function searchPinterest(query) {
	if (!query?.trim()) throw new Error("Search query is required.");

	const res1 = await fetch(
		`https://duckduckgo.com/?q=${encodeURIComponent(query.trim() + " site:pinterest.com")}&iax=images&ia=images`,
		{
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		}
	);
	const html = await res1.text();
	const vqdMatch =
		html.match(/vqd=([^&"'\s]+)/) || html.match(/vqd=["']([^"']+)["']/);
	if (!vqdMatch) return [];

	const vqd = vqdMatch[1];
	const res2 = await fetch(
		`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query.trim() + " site:pinterest.com")}&vqd=${vqd}&f=,,,`,
		{
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		}
	);
	const data = await res2.json();
	return (data.results || [])
		.map((item) => ({
			title: item.title,
			image: item.image,
			url: item.url,
		}))
		.filter((item) => item.image);
}

module.exports = {
	search: searchPinterest,
};
