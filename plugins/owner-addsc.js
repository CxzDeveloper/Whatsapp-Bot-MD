import fs from "fs"
import path from "path"

let handler = async (m, { text }) => {
  if (!m.quoted) return m.reply("Reply kode scraper nya")
  if (!text) return m.reply("Nama file nya mana?\nContoh: .addsc kompas.js")
  if (!text.endsWith(".js")) return m.reply("File harus .js")

  const libDir = path.join(process.cwd(), "lib")
  if (!fs.existsSync(libDir)) fs.mkdirSync(libDir)

  const filePath = path.join(libDir, text)
  if (fs.existsSync(filePath)) return m.reply("File sudah ada")

  const code = m.quoted.text
  if (!code) return m.reply("Kode tidak terbaca")

  fs.writeFileSync(filePath, code)

  m.reply(`Scraper berhasil ditambahkan\nLokasi: lib/${text}`)
}

handler.help = ["addsc <namafile.js>"]
handler.tags = ["owner"]
handler.command = /^addsc$/i
handler.owner = true

export default handler