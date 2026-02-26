import axios from "axios"
import * as cheerio from "cheerio"

let handler = async (m, { text, conn }) => {
  if (!text) {
    return m.reply("Harap masukkan kata kunci pencarian.\nContoh: .wallpaper anime")
  }

  const query = encodeURIComponent(text)
  const url = `https://www.wallpaperflare.com/search?wallpaper=${query}`

  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    })

    const $ = cheerio.load(res.data)
    const results = []

    $('li[itemprop="associatedMedia"]').each((_, el) => {
      const image = $(el).find('img.lazy').attr('data-src')
      const title = $(el).find('figcaption[itemprop="caption description"]').text().trim()
      const resolution = $(el).find('.res').text().trim()

      if (image) {
        results.push({ image, title, resolution })
      }
    })

    if (!results.length) {
      return m.reply("Tidak ditemukan wallpaper dengan kata kunci tersebut.")
    }

    const pick = results[Math.floor(Math.random() * results.length)]

    await conn.sendMessage(
      m.chat,
      {
        image: { url: pick.image },
        caption: `Judul: ${pick.title || "-"}\nResolusi: ${pick.resolution || "-"}`
      },
      { quoted: m }
    )

  } catch (err) {
    console.error(err)
    m.reply("Terjadi kesalahan saat mengambil data wallpaper.")
  }
}

handler.help = ["wallpaper <kata kunci>"]
handler.tags = ["search"]
handler.command = /^wallpaper$/i

export default handler