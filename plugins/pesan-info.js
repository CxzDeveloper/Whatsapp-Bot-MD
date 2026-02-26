import fs from "fs"
import path from "path"

const dbPath = path.resolve("database/infomem.json")

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    fs.writeFileSync(dbPath, JSON.stringify({ request: [], error: [] }, null, 2))
  }
  return JSON.parse(fs.readFileSync(dbPath))
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

let handler = async (m, { command, text }) => {
  if (!text) {
    return m.reply("> Tulis pesan yang ingin dikirim")
  }

  const db = loadDB()
  const isi = text.trim()

  if (/^lapor$/i.test(command)) {
    db.error.push(isi)
    saveDB(db)
    return m.reply("*[ Note ]* Laporan error diterima")
  }

  db.request.push(isi)
  saveDB(db)
  m.reply("*[ Note ]* Request berhasil dikirim")
}

handler.help = ["req <teks>", "saran <teks>", "lapor <teks>"]
handler.tags = ["pesan"]
handler.command = /^req|saran|lapor$/i
handler.register = true

export default handler