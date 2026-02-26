let handler = async (m, { conn, args, groupMetadata }) => {
  const BOT_JID = '628814350080@s.whatsapp.net'
  const normalize = jid => jid?.split(':')[0]

  const botJid = normalize(BOT_JID)
  const selfJid = normalize(conn.user.id)

  const lama = 7 * 24 * 60 * 60 * 1000
  const now = Date.now()

  let total = 0
  let sider = []

  for (let p of groupMetadata.participants) {
    const jid = normalize(p.id)

    if (!jid) continue
    if (jid === botJid) continue
    if (jid === selfJid) continue
    if (p.admin) continue

    const user = global.db.data.users[jid]

    if (!user) {
      total++
      sider.push(jid)
      continue
    }

    if (now - (user.lastseen || 0) > lama) {
      total++
      sider.push(jid)
    }
  }

  if (!args[0]) {
    return m.reply(
`Gunakan:
.sider list
.sider kick`
    )
  }

  if (args[0] === 'list') {
    if (!total) return m.reply('Tidak ada sider di grup ini')

    const groupName = await conn.getName(m.chat)

    return conn.reply(
      m.chat,
`${total} anggota di grup *${groupName}* terdeteksi sider:

${sider.map(v => `• @${v.replace(/@.+/, '')}`).join('\n')}`,
      m,
      { mentions: sider }
    )
  }

  if (args[0] === 'kick') {
    if (!total) return m.reply('Tidak ada sider untuk dikeluarkan')

    for (let jid of sider) {
      if (jid === botJid) continue
      if (jid === selfJid) continue
      await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
    }

    return m.reply(`Berhasil mengeluarkan ${total} sider`)
  }

  return m.reply('Opsi tidak valid')
}

handler.help = ['sider']
handler.tags = ['group']
handler.command = /^(sider|gcsider)$/i
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler