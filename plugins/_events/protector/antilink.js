module.exports = {
	async before(m, { Func, conn, others, groupSet }) {
		try {
			if (m.isGroup && groupSet.antilink && !m.isAdmin && !m.fromMe) {
				if (
					m.body &&
					new RegExp(
						"\\b" + others["links"].join("\\b|\\b") + "\\b"
					).test(m.body.toLowerCase())
				) {
					groupSet.member[m.sender].warning += 1;
					let warning = groupSet.member[m.sender].warning;
					if (warning > 2)
						return m
							.reply(
								Func.texted(
									"bold",
									`Warning : [ 3 / 3 ], good bye 👋`
								)
							)
							.then(() => {
								conn.groupParticipantsUpdate(
									m.chat,
									[m.sender],
									"remove"
								).then(async () => {
									groupSet.member[m.sender].warning = 0;
									m.reply({
										delete: {
											remoteJid: m.chat,
											fromMe: m.isBotAdmin ? false : true,
											id: m.key.id,
											participant: m.sender,
										},
									});
								});
							});
					return m
						.reply(
							`— *W A R N I N G* \n\n*Antilink mode activated.* You got warning : [ ${warning} / 3 ]\n\If you get 3 warnings you will be kicked automatically from the group.`
						)
						.then(() =>
							m.reply({
								delete: {
									remoteJid: m.chat,
									fromMe: m.isBotAdmin ? false : true,
									id: m.key.id,
									participant: m.sender,
								},
							})
						);
				}
			}
		} catch (e) {
			console.log(e);
		}
		return true;
	},
};
