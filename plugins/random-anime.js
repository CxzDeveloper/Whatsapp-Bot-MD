import axios from "axios"

let handler = async (m, { conn, args }) => {
  try {
    const total = parseInt(args[0]) || 1
    if (total > 10) return m.reply("Maksimal 10 gambar")

    const url = "https://codebeautify.org/randomData"

    const params = new URLSearchParams()
    params.append("type", "anime-character")

    const { data } = await axios.post(url, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://codebeautify.org",
        "Referer": "https://codebeautify.org/random-anime-character-generator"
      }
    })

    const results = data.slice(0, total)

    for (let i = 0; i < results.length; i++) {
      const char = results[i]
      const img = `https://codebeautify.org${char.image}`

      await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: `*${char.name}*`
      }, { quoted: m })
    }

  } catch (err) {
    m.reply("Gagal mengambil data anime.")
  }
}

handler.help = ["anime [jumlah]"]
handler.tags = ["random"]
handler.command = /^anime$/i

export default handler