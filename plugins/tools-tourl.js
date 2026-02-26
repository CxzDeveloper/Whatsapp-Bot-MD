import axios from "axios"
import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"

async function uploadTmp(buffer) {
    const { ext } = await fileTypeFromBuffer(buffer)
    const filename = `upload_${Date.now()}.${ext || "bin"}`
    const data = new FormData()
    data.append("file", buffer, { filename })

    const r = await axios.post("https://tmpfiles.org/api/v1/upload", data, {
        headers: {
            ...data.getHeaders(),
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://tmpfiles.org/"
        }
    })

    const match = /tmpfiles\.org\/([^"]+)/.exec(r.data.data.url)
    return "https://tmpfiles.org/dl/" + match[1]
}

async function uploadBotzaku(buffer) {
    const form = new FormData()
    form.append("file", buffer, { filename: "upload" })

    const r = await axios.post("https://api.botzaku.eu.org/api/upload", form, {
        headers: form.getHeaders()
    })

    const data = r.data

    let url =
        data?.url ||
        data?.result?.url ||
        data?.data?.url ||
        data?.file?.url ||
        data?.output?.url ||
        data?.link ||
        data?.result ||
        null

    if (typeof url === "object") {
        let keys = Object.values(url)
        url = keys.find(v => typeof v === "string")
    }

    return url ? url : null
}

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } })

        let q = m.quoted ? m.quoted : m
        let mime = q.mimetype || q.msg?.mimetype || ""

        if (!mime || !mime.includes("/")) {
            return m.reply(
`Kirim atau reply media (gambar, video, audio, dokumen, stiker)
Lalu ketik ${usedPrefix + command}`
            )
        }

        let buffer = await q.download()

        let tmpUrl = await uploadTmp(buffer)
        let botzakuUrl = await uploadBotzaku(buffer)

        let msg =
`Media Uploaded

*Host:* tmpfiles.org
*Type:* ${mime}
> URL: ${tmpUrl}

*Host:* api.botzaku.eu.org
> URL: ${botzakuUrl ? botzakuUrl : "URL tidak ditemukan"}

Selesai.`

        await conn.sendMessage(m.chat, { react: { text: "🥱", key: m.key } })
        return m.reply(msg)

    } catch (e) {
        console.log(e)
        await conn.sendMessage(m.chat, { react: { text: "🙏", key: m.key } })
        m.reply("Gagal mengunggah media.")
    }
}

handler.help = ["tourl"]
handler.tags = ["tools"]
handler.command = /^tourl$/i

export default handler