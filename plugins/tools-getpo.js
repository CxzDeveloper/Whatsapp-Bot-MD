let handler = async (m, { conn, args }) => {
    let target

    if (m.quoted) {
        target = m.quoted.sender
    } else if (args[0]) {
        let num = args[0].replace(/[^0-9]/g, '')
        target = num + '@s.whatsapp.net'
    } else {
        target = m.sender
    }

    try {
        let pp = await conn.profilePictureUrl(target, 'image')

        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: `Profile Picture\n${target.split('@')[0]}`
        }, { quoted: m })
    } catch {
        m.reply('Tidak dapat mengambil foto profil')
    }
}

handler.help = ['getpp']
handler.tags = ['tools']
handler.command = /^getpp$/i
handler.limit = false

export default handler