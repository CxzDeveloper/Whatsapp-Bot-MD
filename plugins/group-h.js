let handler = async (m, { conn, text, command }) => {
  if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di grup')
  if (!/^(hidetag|h)$/i.test(command)) return

  let metadata = await conn.groupMetadata(m.chat)
  let mentions = metadata.participants.map(v => v.id)

  let senderTag = '@' + m.sender.split('@')[0]

  let content = ''
  if (m.quoted && !text) {
    if (m.quoted.text) content = m.quoted.text
    else content = ''
  } else {
    content = text || ''
  }

  let message = `${senderTag} : ${content}`

  await conn.sendMessage(m.chat, {
    text: message,
    mentions: [m.sender, ...mentions]
  }, { quoted: m })
}

handler.help = ['hidetag <text>', 'h <text>']
handler.tags = ['group']
handler.command = /^(hidetag|h)$/i
handler.group = true
handler.admin = true

export default handler