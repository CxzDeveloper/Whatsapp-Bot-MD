import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const BACKUP_DIR = './backup'
const OWNER = global.owner?.[0] || '6288294276026@s.whatsapp.net' // ganti kalau perlu

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR)

/* ================= FUNGSI BACKUP ================= */

function createBackup() {
  return new Promise((resolve, reject) => {
    const name = `backup-${Date.now()}.zip`
    const filepath = path.join(BACKUP_DIR, name)

    exec(`zip -r ${filepath} . \
-x "node_modules/*" \
-x "backup/*" \
-x ".git/*" \
-x "*.zip" \
-x "session/*" \
-x "tmp/*"`, (err) => {
      if (err) return reject(err)
      resolve(filepath)
    })
  })
}

/* ================= AUTO BACKUP TIMER ================= */

// tiap 2 jam → backup + notif owner
setInterval(async () => {
  try {
    const file = await createBackup()
    global.conn?.sendMessage(
      OWNER,
      { text: `🗂️ Backup otomatis berhasil dibuat.\nLokasi: ${file}` }
    )
  } catch (e) {
    global.conn?.sendMessage(
      OWNER,
      { text: `❌ Backup otomatis gagal\n${e.message}` }
    )
  }
}, 1000 * 60 * 60 * 2)


// tiap 1 hari → backup + kirim file
setInterval(async () => {
  try {
    const file = await createBackup()
    global.conn?.sendFile(
      OWNER,
      file,
      'backup.zip',
      '📦 Backup harian bot'
    )
  } catch (e) {
    global.conn?.sendMessage(
      OWNER,
      { text: `❌ Backup harian gagal\n${e.message}` }
    )
  }
}, 1000 * 60 * 60 * 24)


/* ================= COMMAND MANUAL ================= */

let handler = async (m, { conn }) => {
  m.reply('⏳ Membuat backup...')

  try {
    const file = await createBackup()

    await conn.sendFile(
      m.chat,
      file,
      'backup.zip',
      '✅ Backup selesai',
      m
    )

  } catch (e) {
    m.reply('❌ Backup gagal\n' + e.message)
  }
}

handler.help = ['backup']
handler.tags = ['owner']
handler.command = /^backup$/i
handler.owner = true

export default handler