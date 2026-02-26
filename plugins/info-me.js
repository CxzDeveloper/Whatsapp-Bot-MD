import fs from 'fs'
import path from 'path'

const dbDir = path.resolve('./database')
const moneyFile = path.join(dbDir, 'user.json')

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
if (!fs.existsSync(moneyFile)) fs.writeFileSync(moneyFile, '{}')

function loadMoneyDB() {
  return JSON.parse(fs.readFileSync(moneyFile))
}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user || !user.register) return m.reply('Kamu belum daftar')

  let moneyDB = loadMoneyDB()
  let money = 0

  if (moneyDB[m.sender] && typeof moneyDB[m.sender].money === 'number') {
    money = moneyDB[m.sender].money
  }

  let pp
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    pp = 'https://telegra.ph/file/4d1e7c7d5d29f5b7e7c99.jpg'
  }

  let expNeeded = user.level === 0
    ? 100
    : user.level * 100 + Math.pow(user.level, 2) * 50

  let progress = expNeeded > 0
    ? (user.exp / expNeeded) * 100
    : 0

  let isPremiumActive = false
  if (user.premium && user.premiumTime) {
    let now = Date.now()
    let premiumTime = Number(user.premiumTime)
    isPremiumActive = premiumTime > now
  }

  let limitText = isPremiumActive ? 'Unlimited (Premium)' : user.limit

  let userName = 'Unknown'
  if (typeof user.name === 'string') userName = user.name
  else if (user.name) userName = String(user.name)

  let caption = `
PROFILE KAMU

Nama: ${userName}
Umur: ${user.age} tahun
Level: ${user.level}
Exp: ${user.exp} / ${expNeeded}
Progress: ${progress.toFixed(2)}%
Limit: ${limitText}
Premium: ${isPremiumActive ? 'AKTIF' : 'TIDAK AKTIF'}
Uang: ${money}

Semakin sering chat, semakin cepat naik level
  `.trim()

  await conn.sendMessage(
    m.chat,
    { image: { url: pp }, caption },
    { quoted: m }
  )
}

handler.help = ['me']
handler.tags = ['info', 'rpg']
handler.command = /^me$/i

export default handler