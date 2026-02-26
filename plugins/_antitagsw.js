let handler = async (m, { conn, args, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply("Fitur ini hanya dapat digunakan dalam grup.")
    if (!(isAdmin || isOwner)) return m.reply("Maaf, fitur ini hanya dapat digunakan oleh admin grup.")

    global.db.data.chats = global.db.data.chats || {}
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

    if (!args[0]) {
        return m.reply("Silakan gunakan:\n.antitagsw on / off")
    }

    if (args[0] === "on") {
        if (global.db.data.chats[m.chat].antitagsw) {
            return m.reply("Fitur Anti Tag Status WhatsApp sudah aktif di grup ini.")
        }

        global.db.data.chats[m.chat].antitagsw = true
        return m.reply("*Anti Tag Status WhatsApp* berhasil diaktifkan dalam grup ini.")
    }

    if (args[0] === "off") {
        if (!global.db.data.chats[m.chat].antitagsw) {
            return m.reply("Fitur Anti Tag Status WhatsApp sudah nonaktif di grup ini.")
        }

        global.db.data.chats[m.chat].antitagsw = false
        return m.reply("*Anti Tag Status WhatsApp* berhasil dinonaktifkan dalam grup ini.")
    }

    return m.reply("Mohon pilih opsi yang valid:\n.antitagsw on / off")
}

handler.before = async (m, { conn, isBotAdmin, isAdmin }) => {
    if (!m.isGroup) return

    global.db.data.chats = global.db.data.chats || {}
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

    if (!global.db.data.chats[m.chat].antitagsw) return

    const isTagStatus =
        m.mtype === 'groupStatusMentionMessage' ||
        (m.quoted && m.quoted.mtype === 'groupStatusMentionMessage') ||
        (m.message && m.message.groupStatusMentionMessage) ||
        (m.message && m.message.protocolMessage && m.message.protocolMessage.type === 25)

    if (!isTagStatus) return

    await conn.sendMessage(m.chat, { delete: m.key })

    let tagUser = `@${m.sender.split("@")[0]}`

    if (isAdmin) {
        let warning = `
Grup ini terdeteksi ditandai dalam Status WhatsApp

${tagUser}, mohon untuk tidak menandai grup dalam status WhatsApp.

Tindakan tersebut tidak diperbolehkan dalam grup ini.
        `.trim()

        return conn.sendMessage(m.chat, {
            text: warning,
            mentions: [m.sender]
        })
    }

    if (isBotAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")

        return conn.sendMessage(m.chat, {
            text: `${tagUser} telah dikeluarkan dari grup karena menandai grup dalam Status WhatsApp.`,
            mentions: [m.sender]
        })
    }

    let warning = `
Grup ini terdeteksi ditandai dalam Status WhatsApp

${tagUser}, mohon untuk tidak menandai grup dalam status WhatsApp.

Tindakan tersebut tidak diperbolehkan dalam grup ini.
    `.trim()

    return conn.sendMessage(m.chat, {
        text: warning,
        mentions: [m.sender]
    })
}

handler.command = ['antitagsw']
handler.help = ['antitagsw on', 'antitagsw off']
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler