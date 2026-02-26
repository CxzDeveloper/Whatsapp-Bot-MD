import axios from "axios"

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply("Masukkan link Pinterest")

  let proses
  try {
    proses = await conn.sendMessage(
      m.chat,
      { text: "proses..." },
      { quoted: m }
    )

    const body = new URLSearchParams({
      action: "process_pinterest_url",
      url: text,
      nonce: "d5d1d2f971"
    })

    const { data } = await axios.post(
      "https://pintdownloader.com/wp-admin/admin-ajax.php",
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Accept": "*/*",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
        },
        timeout: 15000
      }
    )

    if (!data || !data.success || !data.data?.downloadUrl) {
      await conn.sendMessage(m.chat, { delete: proses.key })
      return m.reply("Gagal mengambil media Pinterest")
    }

    const media = data.data
    const caption =
      `Pinterest Downloader\n\n` +
      `Resolusi : ${media.resolution}\n` +
      `Tipe     : ${media.isVideo ? "Video" : "Gambar"}`

    if (media.isVideo) {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: media.downloadUrl },
          caption
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: media.downloadUrl },
          caption
        },
        { quoted: m }
      )
    }

    await conn.sendMessage(m.chat, { delete: proses.key })

  } catch (e) {
    console.error(e)
    if (proses) await conn.sendMessage(m.chat, { delete: proses.key })
    m.reply("Terjadi kesalahan saat mengambil media Pinterest")
  }
}

handler.help = ["pindl <link>"]
handler.tags = ["download"]
handler.command = /^pindl$/i

export default handler