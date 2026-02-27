import fs from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
`Format salah!

Contoh:
${usedPrefix + command} sticker-brat export default async function handler(){}`)

  // pisahin nama file & kode
  let [name, ...codeArr] = text.split(' ')
  if (!name || codeArr.length === 0)
    return m.reply('Masukkan nama file dan kode.')

  let code = codeArr.join(' ').trim()

  // pastikan nama file aman
  name = name.toLowerCase().replace(/[^a-z0-9-_]/g,'')

  const folder = './plugins/'
  const filePath = path.join(folder, name + '.js')

  if (fs.existsSync(filePath))
    return m.reply('File sudah ada.')

  try {
    fs.writeFileSync(filePath, code)
    m.reply(`Berhasil membuat plugin:\n${name}.js\nRestart bot untuk memuat plugin.`)
  } catch (e) {
    console.error(e)
    m.reply('Gagal membuat file plugin.')
  }
}

handler.help = ['addfitur <nama> <kode>']
handler.tags = ['owner']
handler.command = /^(addfitur|addplugin)$/i

handler.owner = true

export default handler