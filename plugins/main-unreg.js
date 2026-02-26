let handler = async (m, { text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]

    if (!user.register) {
        return m.reply("Kamu belum terdaftar")
    }

    if (!text || text.toLowerCase() !== "ya") {
        return m.reply(
            `*Yakin ingin unregister?*\nKetik:\n${usedPrefix + command} ya\n\n_Semua data kamu akan dihapus permanent_`
        )
    }

    // Reset data user
    user.name = ""
    user.age = 0
    user.level = 0
    user.exp = 0
    user.register = false
    user.regTime = 0

    m.reply(
        `*UNREGISTER BERHASIL*\nSemua data kamu telah dihapus`
    )
}

handler.help = ["unregister"]
handler.tags = ["main"]
handler.command = /^(unregister|unreg)$/i
handler.register = true

export default handler