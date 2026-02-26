import moment from 'moment-timezone'

const TIMEZONE = 'Asia/Jakarta'

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return m.reply('Data user tidak ditemukan')

  let today = moment().tz(TIMEZONE).format('YYYY-MM-DD')

  if (user.lastReward === today) {
    return m.reply('Reward hari ini sudah kamu klaim, silakan coba lagi besok')
  }

  user.lastReward = today

  if (user.premium && user.premiumTime && user.premiumTime > Date.now()) {
    return m.reply(
      'Sungkem sepuh.\nTerima kasih telah menjadi user premium.'
    )
  }

  let reward = Math.floor(Math.random() * 46) + 5

  user.limit = (user.limit || 0) + reward

  return m.reply(
    `Reward harian berhasil diklaim\n\n` +
    `Limit bertambah: ${reward}\n` +
    `Total limit sekarang: ${user.limit}`
  )
}

handler.help = ['reward', 'klaim']
handler.tags = ['rpg']
handler.command = /^(reward|klaim)$/i
handler.register = true

export default handler