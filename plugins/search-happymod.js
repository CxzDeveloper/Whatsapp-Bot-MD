import axios from "axios"
import * as cheerio from "cheerio"

async function searchHappyMod(query) {
  const url = "https://www.happymod.cloud/search.html"

  const params = new URLSearchParams()
  params.append("q", query)

  const { data } = await axios.post(url, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0"
    }
  })

  const $ = cheerio.load(data)
  const results = []

  $("li.list-item").each((_, el) => {
    const link = $(el).find("a.list-box").attr("href")
    const img = $(el).find("img").attr("data-src") || $(el).find("img").attr("src")

    results.push({
      name: $(el).find(".list-info-title").text().trim(),
      version: $(el).find(".list-info-text").eq(0).text().trim(),
      mod: $(el).find(".list-info-text").eq(1).text().trim(),
      icon: img?.startsWith("//") ? "https:" + img : img,
      url: link ? "https://www.happymod.cloud" + link : null
    })
  })

  return results
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Masukkan kata kunci pencarian.\nContoh: .happymod minecraft")

  const data = await searchHappyMod(text)
  if (!data.length) return m.reply("Tidak ditemukan hasil.")

  const app = data[0]

  const caption = 
`Nama   : ${app.name}
Versi  : ${app.version}
Mod    : ${app.mod}
Link   : ${app.url}`

  if (app.icon) {
    await conn.sendMessage(
      m.chat,
      { image: { url: app.icon }, caption },
      { quoted: m }
    )
  } else {
    await m.reply(caption)
  }
}

handler.help = ["happymod <query>"]
handler.tags = ["search"]
handler.command = /^happymod$/i

export default handler