import fs from 'fs'
import path from 'path'

const dbDir = path.resolve('./database')
const dbFile = path.join(dbDir, 'user.json')

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

const daftarPekerjaan = [
  'Programmer',
  'Kurir',
  'Petani',
  'Nelayan',
  'Kuli Bangunan',
  'Driver Ojek',
  'Penjaga Toko',
  'Mekanik',
  'Admin Online',
  'Desainer'
]

const alasanDipecat = [
  'terlalu sering terlambat',
  'tidak menyelesaikan tugas',
  'melanggar aturan kerja',
  'kerja tidak sesuai target',
  'menghilang tanpa izin'
]

function loadDB() {
  return JSON.parse(fs.readFileSync(dbFile))
}

function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2))
}

let handler = async (m) => {
  const db = loadDB()
  const id = m.sender

  if (!db[id]) {
    db[id] = {
      money: 0,
      job: null,
      fired: false,
      lastKerja: 0
    }
  }

  const user = db[id]
  const now = Date.now()
  const cooldown = 60 * 1000

  if (!user.job) {
    const kerjaBaru = daftarPekerjaan[Math.floor(Math.random() * daftarPekerjaan.length)]
    user.job = kerjaBaru
    user.fired = false
    saveDB(db)

    return m.reply(
      `PEKERJAAN BARU\n\n` +
      `Kamu diterima bekerja sebagai ${kerjaBaru}\n` +
      `Gunakan perintah kerja untuk mulai bekerja`
    )
  }

  if (user.fired) {
    return m.reply(
      `KAMU DIPECAT\n\n` +
      `Kamu sudah tidak memiliki pekerjaan\n` +
      `Gunakan perintah kerja untuk mencari pekerjaan baru`
    )
  }

  if (now - user.lastKerja < cooldown) {
    const sisa = Math.ceil((cooldown - (now - user.lastKerja)) / 1000)
    return m.reply(`Kamu masih lelah, tunggu ${sisa} detik`)
  }

  const kemungkinanDipecat = Math.random() < 0.15

  if (kemungkinanDipecat) {
    const alasan = alasanDipecat[Math.floor(Math.random() * alasanDipecat.length)]
    const pekerjaanLama = user.job

    user.job = null
    user.fired = true
    user.lastKerja = now
    saveDB(db)

    return m.reply(
      `DIPECAT\n\n` +
      `Kamu dipecat dari pekerjaan ${pekerjaanLama}\n` +
      `Alasan: ${alasan}\n\n` +
      `Silakan cari pekerjaan baru`
    )
  }

  const hasilDasar = Math.floor(Math.random() * 500) + 200
  const hasil = hasilDasar * 2

  user.money += hasil
  user.lastKerja = now
  saveDB(db)

  return m.reply(
    `HASIL KERJA\n\n` +
    `Pekerjaan: ${user.job}\n` +
    `Penghasilan: ${hasil} money\n\n` +
    `Total uang: ${user.money}`
  )
}

handler.help = ['kerja']
handler.tags = ['rpg']
handler.command = /^kerja$/i
handler.register = true

export default handler