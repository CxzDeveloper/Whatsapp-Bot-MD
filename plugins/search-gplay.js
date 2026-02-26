import gplay from "google-play-scraper"

async function searchApps(query, num = 10) {
  const results = await gplay.search({
    term: query,
    num,
    lang: "id",
    country: "id"
  })

  if (!results || !results.length) {
    return { success: false, message: "Tidak ada hasil ditemukan" }
  }

  const apps = results.map(app => ({
    title: app.title,
    appId: app.appId,
    developer: app.developer,
    rating: app.scoreText || "-",
    reviews: app.reviews || 0,
    installs: app.installs || app.minInstalls + "+",
    price: app.priceText || "Gratis",
    url: app.url,
    icon: app.icon || null
  }))

  return {
    success: true,
    total: apps.length,
    apps
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      "> Gunakan perintah:\n" +
      "> .gplay <nama aplikasi>\n\n" +
      "Contoh:\n" +
      ".gplay free fire"
    )
  }

  m.reply("> Sedang mencari aplikasi di Play Store")

  try {
    const res = await searchApps(text, 10)
    if (!res.success) return m.reply("> Tidak ada hasil ditemukan")

    const topThumb = res.apps[0]?.icon || null

    let caption = `Hasil pencarian Play Store\n\n`
    res.apps.forEach((app, i) => {
      caption +=
        `> ${i + 1}. ${app.title}\n` +
        `Developer: ${app.developer}\n` +
        `Rating: ${app.rating} (${app.reviews} ulasan)\n` +
        `Installs: ${app.installs}\n` +
        `Harga: ${app.price}\n` +
        `Link: ${app.url}\n\n`
    })

    if (topThumb) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: topThumb },
          caption: caption.trim()
        },
        { quoted: m }
      )
    } else {
      m.reply(caption.trim())
    }
  } catch (e) {
    console.error(e)
    m.reply("> Terjadi kesalahan saat mengambil data")
  }
}

handler.help = ["gplay <query>"]
handler.tags = ["search"]
handler.command = /^gplay|googleplay$/i
handler.register = true

export default handler