function msToDate(ms) {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor(ms / 3600000) % 24
  const minutes = Math.floor(ms / 60000) % 60
  return `${days} hari ${hours} jam ${minutes} menit`
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const chats = global.db.data.chats || {}
  const now = Date.now()

  if (command === 'listsewa') {
    const list = Object.entries(chats)
      .filter(([_, chat]) => chat.expired && chat.expired > now)
      .map(([id]) => id)

    if (!list.length) {
      return conn.reply(
        m.chat,
        'Tidak ada grup yang memiliki masa sewa aktif.',
        m
      )
    }

    let output = 'Daftar Grup Sewa Aktif\n\n'

    list.forEach((id, i) => {
      const remaining = chats[id].expired - now
      const name = conn.chats?.[id]?.subject || 'Tidak Dikenal'

      output +=
        `${i + 1}. Nama: ${name}\n` +
        `ID: ${id}\n` +
        `Sisa Waktu: ${msToDate(remaining)}\n\n`
    })

    return conn.reply(m.chat, output.trim(), m)
  }

  if (command === 'ceksewa' || command === 'csewa') {
    if (!text) {
      throw `Contoh:\n${usedPrefix + command} <nomor>\n\nGunakan ${usedPrefix}listsewa`
    }

    if (!/^\d+$/.test(text)) throw 'Nomor harus berupa angka'

    const list = Object.entries(chats)
      .filter(([_, chat]) => chat.expired && chat.expired > now)
      .map(([id]) => id)

    const index = Number(text) - 1
    if (!list[index]) throw 'Nomor tidak valid'

    const id = list[index]
    const remaining = chats[id].expired - now
    const name = conn.chats?.[id]?.subject || 'Tidak Dikenal'

    return conn.reply(
      m.chat,
      `Informasi Sewa Grup\n\nNama: ${name}\nID: ${id}\nSisa Waktu: ${msToDate(remaining)}`,
      m
    )
  }
}

handler.help = ['listsewa', 'ceksewa <nomor>']
handler.tags = ['owner']
handler.command = /^(listsewa|ceksewa|csewa)$/i
handler.owner = true

export default handler