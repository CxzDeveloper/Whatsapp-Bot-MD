import axios from "axios"
import fs from "fs"

const UA =
  "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36"

const sanitize = (t) => t.replace(/[\\/:*?"<>|]/g, "")

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply("Masukkan judul lagu atau link Spotify")

  let proses
  try {
    proses = await conn.sendMessage(
      m.chat,
      { text: "proses..." },
      { quoted: m }
    )

    const search = await axios.get(
      "https://spotdown.org/api/song-details",
      {
        params: { url: text },
        headers: {
          accept: "application/json",
          origin: "https://spotdown.org",
          referer: "https://spotdown.org/",
          "user-agent": UA
        }
      }
    )

    const song = search.data?.songs?.[0]
    if (!song) {
      await conn.sendMessage(m.chat, { delete: proses.key })
      return m.reply("Lagu tidak ditemukan")
    }

    const audio = await axios.post(
      "https://spotdown.org/api/download",
      { url: song.url },
      {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          origin: "https://spotdown.org",
          referer: "https://spotdown.org/",
          "user-agent": UA
        },
        responseType: "arraybuffer"
      }
    )

    const buffer = Buffer.from(audio.data)
    const filename = `${sanitize(song.title)} - ${sanitize(song.artist)}.mp3`

    fs.writeFileSync(filename, buffer)

    const caption =
      `Judul   : ${song.title}\n` +
      `Artis   : ${song.artist}\n` +
      `Durasi  : ${song.duration}s\n` +
      `Ukuran  : ${(buffer.length / 1024 / 1024).toFixed(2)} MB`

    await conn.sendMessage(
      m.chat,
      { text: caption },
      { quoted: m }
    )

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: filename },
        mimetype: "audio/mpeg",
        fileName: filename
      },
      { quoted: m }
    )

    fs.unlinkSync(filename)
    await conn.sendMessage(m.chat, { delete: proses.key })

  } catch (e) {
    console.error(e)
    if (proses) await conn.sendMessage(m.chat, { delete: proses.key })
    m.reply("Gagal mengambil lagu")
  }
}

handler.help = ["spotify <judul|link>"]
handler.tags = ["download"]
handler.command = /^spotify$/i

export default handler