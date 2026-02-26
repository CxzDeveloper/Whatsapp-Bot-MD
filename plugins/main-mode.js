const handler = async (m, { conn }) => {
  const uptimeMs = process.uptime() * 1000
  const uptime = clockString(uptimeMs)

  const totalUsers = Object.keys(global.db.data.users || {}).length
  const bannedUsers = Object.values(global.db.data.users || {}).filter(
    u => u?.banned
  ).length

  const totalStats = Object.keys(global.db.data.stats || {}).length
  const mode = global.opts?.self ? 'Self' : 'Publik'

  const text = `
Mode: ${mode}
Aktif: ${uptime}
Pengguna: ${totalUsers}
Pengguna Terbanned: ${bannedUsers}
Fitur Sering Digunakan: ${totalStats}

Jika bot tidak ada balasan maka bot sedang maintenance.
`.trim()

  await conn.relayMessage(
    m.chat,
    {
      extendedTextMessage: {
        text,
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title: uptime,
            mediaType: 1,
            previewType: 0,
            renderLargerThumbnail: true,
            thumbnailUrl:
              'https://telegra.ph/file/dc5a67d724b016574129b.jpg',
            sourceUrl: ''
          }
        }
      }
    },
    {}
  )
}

handler.help = ['mode']
handler.tags = ['main']
handler.customPrefix = /^(mode)$/i
handler.command = new RegExp()
handler.limit = false

export default handler

function clockString(ms) {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor(ms / 3600000) % 24
  const minutes = Math.floor(ms / 60000) % 60
  const seconds = Math.floor(ms / 1000) % 60

  return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`
}