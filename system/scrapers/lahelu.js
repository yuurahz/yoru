async function getRandomMeme() {
	const page = Math.floor(Math.random() * 8);
	const res = await fetch(
		`https://lahelu.com/api/post/get-posts?feed=1&page=${page}`
	);
	const data = await res.json();
	const posts = data.postInfos || [];
	if (!posts.length) return null;
	const post = posts[Math.floor(Math.random() * posts.length)];

	const isVideo =
		post.media?.endsWith(".mp4") ||
		post.mediaType === 1 ||
		post.mediaType === 4;

	return {
		title: post.title || "No Title",
		author: post.userUsername || "Anonymous",
		media: post.media,
		type: isVideo ? "video" : "photo",
		stats: {
			upvotes: post.totalUpvotes || 0,
			downvotes: post.totalDownvotes || 0,
			comments: post.totalComments || 0,
		},
		hashtags: post.hashtags || [],
	};
}

module.exports = {
	getRandomMeme,
};
