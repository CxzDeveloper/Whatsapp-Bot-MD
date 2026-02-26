import {
  canLevelUp,
  xpRange
} from '../lib/levelling.js'

let handler = async (m) => {
  let user = global.db.data.users[m.sender]

  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    let { min, xp, max } = xpRange(user.level, global.multiplier)
    throw `
Level ${user.level} (${user.exp - min}/${xp})
Kurang ${max - user.exp} XP lagi
`.trim()
  }

  let before = user.level
  while (canLevelUp(user.level, user.exp, global.multiplier)) {
    user.level++
  }

  if (before !== user.level) {
    m.reply(`
Selamat, level kamu naik
${before} → ${user.level}
Gunakan .profile untuk cek
`.trim())
  }
}

handler.help = ['levelup']
handler.tags = ['xp']
handler.command = /^level(up)?$/i

export default handler