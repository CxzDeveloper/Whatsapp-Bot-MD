import axios from "axios"

async function getTikTokOEmbed(url) {
    const endpoint = "https://www.tiktok.com/oembed"

    const { data } = await axios.get(endpoint, {
        params: { url },
        headers: {
            accept: "application/json",
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    })

    if (!data) throw new Error("Data oEmbed tidak ditemukan")

    return data
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
            `Gunakan:\n${usedPrefix + command} <url tiktok>\n\nContoh:\n${usedPrefix + command} https://www.tiktok.com/@tiktok/video/xxxx`
        )
    }

    const url = args[0]
    if (!/tiktok\.com/i.test(url)) {
        return m.reply("URL bukan TikTok")
    }

    try {
        m.reply("Mengambil info TikTok...")

        const data = await getTikTokOEmbed(url)

        const caption = `
TIKTOK OEMBED INFO

Judul       : ${data.title || "-"}
Author      : ${data.author_name || "-"}
Username    : ${data.author_unique_id || "-"}
Author URL  : ${data.author_url || "-"}
Provider    : ${data.provider_name || "-"}
Embed ID    : ${data.embed_product_id || "-"}
        `.trim()

        await conn.sendMessage(
            m.chat,
            {
                image: { url: data.thumbnail_url },
                caption
            },
            { quoted: m }
        )
    } catch (e) {
        m.reply("Gagal mengambil data TikTok")
    }
}

handler.help = ["ttinfo <url>"]
handler.tags = ["tools"]
handler.command = /^(ttinfo|ttoembed)$/i
handler.limit = true

export default handler