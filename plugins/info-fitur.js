import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn }) => {
  try {
    const pluginsDir = path.join(__dirname, './')
    const files = await fs.readdir(pluginsDir)

    let totalPlugin = 0
    let totalCommand = 0

    for (let file of files) {
      if (!file.endsWith('.js')) continue

      const fullPath = path.join(pluginsDir, file)
      const content = await fs.readFile(fullPath, 'utf8')

      if (!/handler\.command\s*=/.test(content)) continue

      totalPlugin++

      let regexMatch = content.match(/handler\.command\s*=\s*(\/\^?.+?\/[gimsuy]*)/)
      if (regexMatch) {
        let body = regexMatch[1]
          .replace(/^\/\^?/, '')
          .replace(/\/[gimsuy]*$/, '')

        if (body.includes('|')) {
          let cmds = body.split('|').filter(v => v.trim())
          totalCommand += cmds.length
        } else {
          totalCommand += 1
        }
      }

      let arrayMatch = content.match(/handler\.command\s*=\s*\[([\s\S]*?)\]/)
      if (arrayMatch) {
        let cmds = arrayMatch[1]
          .split(',')
          .map(v => v.replace(/['"`]/g, '').trim())
          .filter(v => v)
        totalCommand += cmds.length
      }

      let stringMatch = content.match(/handler\.command\s*=\s*['"`](.+?)['"`]/)
      if (stringMatch) {
        totalCommand += 1
      }
    }

    let text =
      `*STATISTIK BOT*\n\n` +
      `Total plugin aktif: ${totalPlugin}\n` +
      `Total command: ${totalCommand}`

    await conn.sendMessage(m.chat, { text }, { quoted: m })

  } catch {
    await conn.sendMessage(m.chat, {
      text: 'Gagal menghitung command'
    }, { quoted: m })
  }
}

handler.help = ['totalfitur', 'totalcmd']
handler.tags = ['info']
handler.command = /^(totalfitur|fitur|features|totalcmd|totalcommand)$/i

export default handler