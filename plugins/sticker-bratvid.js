import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const BASE_URL = 'https://skyzxu-brat.hf.space/brat-animated'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Masukkan teksnya')

  const encoded = encodeURIComponent(text.trim())
  const url = `${BASE_URL}?text=${encoded}`

  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const tmpVideo = `./tmp/brat_${Date.now()}.mp4`
    const tmpSticker = `./tmp/brat_${Date.now()}.webp`

    fs.writeFileSync(tmpVideo, res.data)

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -y -i "${tmpVideo}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -an -vsync 0 "${tmpSticker}"`,
        err => (err ? reject(err) : resolve())
      )
    })

    await conn.sendMessage(
      m.chat,
      {
        sticker: fs.readFileSync(tmpSticker)
      },
      { quoted: m }
    )

    fs.unlinkSync(tmpVideo)
    fs.unlinkSync(tmpSticker)

  } catch (e) {
    m.reply('Gagal membuat sticker')
  }
}

handler.help = ['bratvid <teks>']
handler.tags = ['sticker']
handler.command = /^bratvid$/i

export default handler