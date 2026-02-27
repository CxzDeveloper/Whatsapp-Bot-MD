import fs from "fs"
import path from "path"

const pluginDir = path.join(process.cwd(), "plugins")

let handler = async (m, { text, usedPrefix, command, conn }) => {

  if (!text)
    return m.reply(`Masukkan nama plugin\nContoh:\n${usedPrefix + command} brat.js`)

  if (!text.endsWith(".js"))
    return m.reply("Harus file .js")

  const filePath = path.join(pluginDir, text)

  if (!fs.existsSync(filePath))
    return m.reply("Plugin tidak ditemukan")

  const code = fs.readFileSync(filePath, "utf8")

  // kalau pendek kirim teks
  if (code.length < 4000) {
    return m.reply("```js\n" + code + "\n```")
  }

  // kalau panjang kirim dokumen
  await conn.sendMessage(
    m.chat,
    {
      document: Buffer.from(code),
      fileName: text,
      mimetype: "text/javascript"
    },
    { quoted: m }
  )
}

handler.help = ["getplugin <file.js>"]
handler.tags = ["owner"]
handler.command = /^getplugin$/i
handler.owner = true

export default handler