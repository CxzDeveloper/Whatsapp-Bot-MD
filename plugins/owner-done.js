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

let handler = async (m, { text }) => {
  if (!text) return m.reply("> Contoh: .done Fitur hd image")

  const db = loadDB()
  const q = text.trim().toLowerCase()

  const rBefore = db.request.length
  const eBefore = db.error.length

  db.request = db.request.filter(v => v.toLowerCase() !== q)
  db.error = db.error.filter(v => v.toLowerCase() !== q)

  saveDB(db)

  if (db.request.length === rBefore && db.error.length === eBefore) {
    return m.reply("> Data tidak ditemukan")
  }

  m.reply("*[ Done ]* Berhasil diselesaikan")
}

handler.help = ["done <teks>"]
handler.tags = ["owner"]
handler.command = /^done$/i
handler.owner = true

export default handler