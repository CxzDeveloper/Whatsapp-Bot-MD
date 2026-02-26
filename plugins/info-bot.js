let handler = async (m, { conn }) => {
    let text = `Arona siap membantu`

    await conn.sendMessage(m.chat, {
        text,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: conn.user?.name || 'Bot Online',
                body: '~Arona-MD',
                thumbnailUrl: global.thum || '',
                sourceUrl: global.lgc || '',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.customPrefix = /^(bot)$/i
handler.command = new RegExp
handler.register = true
handler.tags = ['info']
handler.help = ['bot (no prefix)']

export default handler