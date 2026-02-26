import fs from "fs"
import path from "path"

const libDir = path.join(process.cwd(), "lib")
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir)

let handler = async (m, { command, text }) => {
  if (command === "listsc") {
    const files = fs.readdirSync(libDir).filter(v => v.endsWith(".js"))

    if (!files.length) {
      return m.reply("Tidak ada scraper di folder lib")
    }

    let msg = "> Daftar Scraper\n\n"
    files.forEach((v, i) => {
      msg += `• ${i + 1}. ${v}\n`
    })

    return m.reply(msg.trim())
  }

  if (command === "getsc") {
    if (!text) return m.reply("Nama file nya?\nContoh: .getsc kompas.js")

    const filePath = path.join(libDir, text)
    if (!fs.existsSync(filePath)) {
      return m.reply("File tidak ditemukan")
    }

    const data = fs.readFileSync(filePath, "utf8")
    return m.reply(data)
  }

  if (command === "delsc") {
    if (!text) return m.reply("Nama file nya?\nContoh: .delsc kompas.js")

    const filePath = path.join(libDir, text)
    if (!fs.existsSync(filePath)) {
      return m.reply("File tidak ditemukan")
    }

    fs.unlinkSync(filePath)
    return m.reply(`Scraper ${text} berhasil dihapus`)
  }
}

handler.help = ["listsc", "getsc <file>", "delsc <file>"]
handler.tags = ["owner"]
handler.command = /^(listsc|getsc|delsc)$/i
handler.owner = true

export default handler