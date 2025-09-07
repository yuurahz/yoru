module.exports = {
	async before(m, { func, groupSet }) {
		if (!m.isGroup || !groupSet.antiporn) return false;
		const mime = m?.msg?.mime_type || "";
		if (!mime) return false;
		if (!/image\/(png|jpe?g)/.test(mime)) return false;
		const media = await m.download();
		const link = await upload.tmpfiles(media);
		async function cekGambar(img) {
			try {
				const resp = await Func.fetchJson(
					`https://api.sightengine.com/1.0/check.json?url=${img}&models=nudity&api_user=671718818&api_secret=zs9QqkjFYZWq5N3nozXT`
				);
				const estetikPesan =
					"`Peringatan Keamanan:`\nDitemukan pesan dengan konten *Nsfw*. langkah pencegahan akan diambil terhadap pengguna.";
				return {
					nsfw: resp?.nudity?.safe < 0.4,
					msg: estetikPesan,
				};
			} catch (e) {
				console.log("Kesalahan dalam pemeriksaan gambar:", e);
			}
		}
		if (link) {
			const detect = await cekGambar(link);
			if (detect?.nsfw) {
				await m.reply(detect.msg).then(() => {
					m.reply({
						delete: {
							remoteJid: m.chat,
							fromMe: false,
							id: m.key.id,
							participant: m.key.participant,
						},
					});
				});
			}
		} else console.log("Media aman.");
		return true;
	},
};
