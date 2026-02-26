let handler = async (m, { conn, text, isOwner, isROwner }) => {
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di grup')
    if (!text) return m.reply(
        'Masukkan teks welcome!\n\n' +
        'Contoh:\n' +
        '.setwelcome Selamat datang @user di grup @subject\n\n' +
        'Tag tersedia:\n' +
        '@user = Mention user\n' +
        '@subject = Nama grup\n' +
        '@desc = Deskripsi grup'
    )

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    chat.sWelcome = text

    m.reply(
        `✅ *Welcome message berhasil disimpan!*\n\n` +
        `Preview:\n${text}`
    )
}

handler.help = ['setwelcome <teks>']
handler.tags = ['group']
handler.command = /^setwelcome$/i
handler.group = true
handler.admin = true

export default handler