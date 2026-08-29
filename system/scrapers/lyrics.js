async function searchLyrics(query) {
	if (!query?.trim()) throw new Error("Search query is required.");

	const res = await fetch(
		`https://lrclib.net/api/search?q=${encodeURIComponent(query.trim())}`,
		{
			headers: {
				"User-Agent": "Yoru-Telegram-Bot/3.5.0",
			},
		}
	);
	const items = await res.json();
	if (!items || !items.length) return null;

	const track = items[0];
	return {
		id: track.id,
		title: track.trackName,
		artist: track.artistName,
		album: track.albumName,
		duration: track.duration,
		plainLyrics: track.plainLyrics,
		syncedLyrics: track.syncedLyrics,
	};
}

module.exports = {
	search: searchLyrics,
};
