import fs from 'fs'
import path from 'path'

const dbDir = path.resolve('./database')
const moneyFile = path.join(dbDir, 'user.json')

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
if (!fs.existsSync(moneyFile)) fs.writeFileSync(moneyFile, '{}')

function loadDB() {
  return JSON.parse(fs.readFileSync(moneyFile))
}

function saveDB(data) {
  fs.writeFileSync(moneyFile, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, args, usedPrefix }) => {
  conn.casinoPvp = conn.casinoPvp || {}

  if (!m.isGroup) return m.reply('Fitur ini hanya bisa digunakan di grup')

  let opponent = m.mentionedJid?.[0]
  let taruhan = parseInt(args[1])

  if (!opponent || !args[1]) {
    return m.reply(`${usedPrefix}casino @user <jumlah>`)
  }

  if (isNaN(taruhan) || taruhan <= 0) {
    return m.reply('Jumlah taruhan tidak valid')
  }

  if (opponent === m.sender) {
    return m.reply('Tidak bisa menantang diri sendiri')
  }

  let key = m.chat

  if (conn.casinoPvp[key]) {
    return m.reply('Masih ada session casino di grup ini')
  }

  let db = loadDB()

  if (!db[m.sender]) db[m.sender] = { money: 0 }
  if (!db[opponent]) db[opponent] = { money: 0 }

  if (db[m.sender].money < taruhan) {
    return m.reply('Uang kamu tidak mencukupi')
  }

  if (db[opponent].money < taruhan) {
    return m.reply('Uang lawan tidak mencukupi')
  }

  conn.casinoPvp[key] = {
    challenger: m.sender,
    opponent,
    taruhan,
    timeout: Date.now() + 60000
  }

  await conn.sendMessage(m.chat, {
    text: `GAME CASINO

@${m.sender.split('@')[0]} menantang @${opponent.split('@')[0]}
Taruhan: Rp ${taruhan}

Ketik:
Terima
atau
Tolak

Waktu 60 detik`,
    mentions: [m.sender, opponent]
  })

  setTimeout(() => {
    if (conn.casinoPvp[key]) {
      delete conn.casinoPvp[key]
      conn.sendMessage(m.chat, {
        text: 'Session casino dibatalkan karena tidak ada respon'
      })
    }
  }, 60000)
}

handler.before = async (m, { conn }) => {
  conn.casinoPvp = conn.casinoPvp || {}

  let key = m.chat
  let session = conn.casinoPvp[key]

  if (!session) return
  if (m.sender !== session.opponent) return
  if (!m.text) return

  let text = m.text.toLowerCase()

  if (text !== 'terima' && text !== 'tolak') return

  let db = loadDB()

  if (text === 'tolak') {
    delete conn.casinoPvp[key]
    return conn.sendMessage(m.chat, {
      text: `Tantangan casino ditolak oleh @${m.sender.split('@')[0]}`,
      mentions: [m.sender]
    })
  }

  let { challenger, opponent, taruhan } = session

  db[challenger].money -= taruhan
  db[opponent].money -= taruhan

  let pointA = Math.floor(Math.random() * 150)
  let pointB = Math.floor(Math.random() * 150)

  let winner
  let hadiah = taruhan * 2

  if (pointA > pointB) {
    winner = challenger
    db[challenger].money += hadiah
  } else if (pointB > pointA) {
    winner = opponent
    db[opponent].money += hadiah
  } else {
    db[challenger].money += taruhan
    db[opponent].money += taruhan
    saveDB(db)
    delete conn.casinoPvp[key]

    return conn.sendMessage(m.chat, {
      text: `GAME CASINO

• @${challenger.split('@')[0]} --> ${pointA}
• @${opponent.split('@')[0]} --> ${pointB}

Hasil: Seri
Uang dikembalikan`,
      mentions: [challenger, opponent]
    })
  }

  saveDB(db)
  delete conn.casinoPvp[key]

  return conn.sendMessage(m.chat, {
    text: `GAME CASINO

• @${challenger.split('@')[0]} --> ${pointA}
• @${opponent.split('@')[0]} --> ${pointB}

Pemenang: @${winner.split('@')[0]}
Mendapatkan: Rp ${hadiah}`,
    mentions: [challenger, opponent, winner]
  })
}

handler.help = ['casino @user <jumlah>']
handler.tags = ['rpg']
handler.command = /^casino$/i
handler.group = true
handler.register = true
handler.limit = false

export default handler