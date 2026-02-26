import axios from "axios"
import * as cheerio from "cheerio"
import { toPTT } from "../function/converter.js"

let handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply("Gunakan:\n.surah <nomor>\nContoh: .surah 1")
    }

    let nomor = parseInt(text)
    if (isNaN(nomor) || nomor < 1 || nomor > 114) {
        return m.reply("Nomor surah harus antara 1 sampai 114")
    }

    try {
        const url = "https://www.mp3quran.net/eng/afs"
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        })

        const $ = cheerio.load(data)

        let surahLink = null
        let surahName = ""

        $("a").each((_, el) => {
            let href = $(el).attr("href")
            let text = $(el).text().trim()

            if (href && href.endsWith(`/${String(nomor).padStart(3, "0")}.mp3`)) {
                surahLink = href.startsWith("http")
                    ? href
                    : "https://www.mp3quran.net" + href
                surahName = text
            }
        })

        if (!surahLink) {
            return m.reply("Surah tidak ditemukan")
        }

        const audio = await axios.get(surahLink, {
            responseType: "arraybuffer"
        })

        const { data: opus } = await toPTT(audio.data)

        await conn.sendMessage(m.chat, {
            audio: opus,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply("Gagal mengambil audio surah")
    }
}

handler.help = ["surah <nomor>"]
handler.tags = ["islami"]
handler.command = /^surah$/i

export default handler