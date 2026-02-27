import fs from "fs"
import path from "path"

const pluginDir = path.join(process.cwd(), "plugins")

let handler = async (m, { text, command, usedPrefix }) => {

  if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir)

  // ===== LIST =====
  if (/^listplugins$/i.test(command)) {
    const files = fs.readdirSync(pluginDir).filter(v => v.endsWith(".js"))
    if (!files.length) return m.reply("Tidak ada plugin.")
    return m.reply("📦 *LIST PLUGINS*\n\n" + files.map((v,i)=>`${i+1}. ${v}`).join("\n"))
  }

  // ===== ADD =====
  if (/^addplugins|addfitur$/i.test(command)) {

    if (!m.quoted) return m.reply("Reply kode plugin nya")
    if (!text) return m.reply(`Contoh:\n${usedPrefix+command} test.js`)
    if (!text.endsWith(".js")) return m.reply("File harus .js")

    const filePath = path.join(pluginDir, text)
    if (fs.existsSync(filePath))
      return m.reply("Plugin sudah ada, gunakan replaceplugin.")

    const code = m.quoted.text || m.quoted.caption
    if (!code) return m.reply("Kode tidak terbaca")

    fs.writeFileSync(filePath, code)

    return m.reply(`Plugin ditambahkan ✅
plugins/${text}

Auto reload aktif, plugin langsung bisa dipakai.`)
  }

  // ===== DELETE =====
  if (/^delplugins|delfitur$/i.test(command)) {

    if (!text) return m.reply("Masukkan nama plugin.js")
    if (!text.endsWith(".js")) return m.reply("Harus .js")

    const filePath = path.join(pluginDir, text)
    if (!fs.existsSync(filePath))
      return m.reply("Plugin tidak ditemukan")

    fs.unlinkSync(filePath)

    return m.reply(`Plugin dihapus 🗑️
plugins/${text}

Auto reload aktif.`)
  }

  // ===== REPLACE =====
  if (/^replaceplugin$/i.test(command)) {

    if (!m.quoted) return m.reply("Reply kode plugin baru")
    if (!text) return m.reply(`Contoh:\n${usedPrefix+command} test.js`)
    if (!text.endsWith(".js")) return m.reply("File harus .js")

    const filePath = path.join(pluginDir, text)
    if (!fs.existsSync(filePath))
      return m.reply("Plugin tidak ditemukan")

    const code = m.quoted.text || m.quoted.caption
    if (!code) return m.reply("Kode tidak terbaca")

    fs.writeFileSync(filePath, code)

    return m.reply(`Plugin diganti ♻️
plugins/${text}

Auto reload aktif, plugin langsung update.`)
  }
}

handler.help = [
  "addplugins <file.js>",
  "addfitur <file.js>",
  "delplugins <file.js>",
  "delfitur <file.js>",
  "replaceplugin <file.js>",
  "listplugins"
]

handler.tags = ["owner"]
handler.command = /^(addplugins|addfitur|delplugins|delfitur|replaceplugin|listplugins)$/i
handler.owner = true

export default handler
