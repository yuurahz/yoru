module.exports = {
	async before(m, { Func, conn, others, groupSet }) {
		try {
			if (m.isGroup && groupSet.antitoxic && !m.isAdmin && !m.fromMe) {
				if (
					m.body &&
					new RegExp(
						"\\b" + others["badwords"].join("\\b|\\b") + "\\b"
					).test(m.body.toLowerCase())
				) {
					groupSet.member[m.sender].warning += 1;
					let warning = groupSet.member[m.sender].warning;
					if (warning > 4)
						return m
							.reply(
								Func.texted(
									"bold",
									`Warning : [ 5 / 5 ], good bye 👋`
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
							`— *W A R N I N G* \n\n*Toxic detected*. You got warning : [ ${warning} / 5 ]\n\If you get 5 warnings you will be kicked automatically from the group.`
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
