const handler = (m, { conn, args }) => {
  const users = global.db.data.users
  if (!users) throw 'Database user tidak ditemukan'

  // RESET SEMUA USER
  if (args[0]?.toLowerCase() === 'all') {
    let total = 0

    for (const jid in users) {
      const user = users[jid]
      if (!user) continue

      user.level = 0
      user.exp = 0
      user.lastLevelUp = 0

      total++
    }

    return conn.reply(
      m.chat,
      `RESET LEVEL & EXP ALL BERHASIL

Total user direset : ${total}`,
      m
    )
  }

  // TARGET USER
  let target
  if (m.mentionedJid?.length) {
    target = m.mentionedJid[0]
  } else if (m.quoted?.sender) {
    target = m.quoted.sender
  } else if (args[0]) {
    const num = args[0].replace(/[^0-9]/g, '')
    if (!num) throw 'Nomor tidak valid'
    target = num + '@s.whatsapp.net'
  } else {
    target = m.sender
  }

  const user = users[target]
  if (!user) throw 'User tidak ditemukan'

  const beforeLevel = user.level ?? 0
  const beforeExp = user.exp ?? 0

  user.level = 0
  user.exp = 0
  user.lastLevelUp = 0

  conn.reply(
    m.chat,
    `RESET LEVEL & EXP BERHASIL

User  : @${target.split('@')[0]}
Level : ${beforeLevel} → 0
Exp   : ${beforeExp} → 0`,
    m,
    { mentions: [target] }
  )
}

handler.help = ['resetlevel', 'resetlevel all']
handler.tags = ['owner']
handler.command = /^resetlevel$/i
handler.owner = true

export default handler