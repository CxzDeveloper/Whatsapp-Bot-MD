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

let handler = async (m) => {
  const db = loadDB()
  const req = db.request || []
  const err = db.error || []

  if (!req.length && !err.length) {
    return m.reply("*Masih aman brothers 😙*")
  }

  let teks = ""

  if (req.length) {
    teks += "> Daftar request\n"
    req.forEach((v, i) => {
      teks += `• ${i + 1}. ${v}\n`
    })
    teks += "\n"
  }

  if (err.length) {
    teks += "> Daftar Error\n"
    err.forEach((v, i) => {
      teks += `• ${i + 1}. ${v}\n`
    })
  }

  m.reply(teks.trim())
}

handler.help = ["cekin"]
handler.tags = ["info"]
handler.command = /^cekin$/i
handler.owner = true

export default handler