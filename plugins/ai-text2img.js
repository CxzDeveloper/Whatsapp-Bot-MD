import axios from "axios"

let handler = async (m, { conn, text, command }) => {
    if (!text) {
        return m.reply(
`Masukkan prompt untuk membuat gambar.

Contoh:
.text2img kucing terbang di kota futuristik`
        )
    }

    try {
        let url = `https://hookrest.my.id/tools/text2img?prompt=${encodeURIComponent(text)}`
        let buffer = await axios.get(url, { responseType: "arraybuffer" })

        await conn.sendMessage(
            m.chat,
            { image: buffer.data, caption: "Berhasil membuat gambar." },
            { quoted: m }
        )

    } catch (e) {
        m.reply("Gagal membuat gambar.")
    }
}

handler.help = ["text2img"]
handler.tags = ["ai"]
handler.command = /^text2img$/i

export default handler