let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di grup')

    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.sWelcome) {
        return m.reply('Welcome sudah menggunakan pengaturan default.')
    }

    delete chat.sWelcome

    m.reply(
        'Welcome berhasil direset.\n' +
        'Sekarang bot akan menggunakan welcome bawaan.'
    )
}

handler.help = ['reswelcome']
handler.tags = ['group']
handler.command = /^reswelcome$/i
handler.group = true
handler.admin = true

export default handler