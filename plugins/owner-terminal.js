import { exec } from 'child_process'

let handler = async (m, { conn, text }) => {

  if (!text) return m.reply(
`Contoh:
.term npm install axios
.term pm2 restart all
.term git pull`
  )

  // kirim status awal
  await conn.reply(m.chat, '🖥️ Menjalankan command...', m)

  exec(text, { timeout: 1000 * 60 * 5 }, async (err, stdout, stderr) => {

    if (err) {
      return conn.reply(
        m.chat,
        `❌ ERROR\n\n\`\`\`\n${err.message.slice(0,3500)}\n\`\`\``,
        m
      )
    }

    let output = stdout || stderr || 'Command selesai tanpa output.'

    // batasi panjang pesan WA
    if (output.length > 3500) {
      output = output.slice(0, 3500) + '\n...output dipotong'
    }

    await conn.reply(
      m.chat,
      `✅ DONE\n\n\`\`\`\n${output}\n\`\`\``,
      m
    )
  })
}

handler.help = ['term']
handler.tags = ['owner','tools']
handler.command = /^term$/i
handler.owner = true

export default handler