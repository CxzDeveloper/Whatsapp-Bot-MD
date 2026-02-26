import axios from "axios"
import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = q.mimetype || q.msg?.mimetype || ""

    if (!mime || !mime.includes("/")) {
        return m.reply(
`Kirim atau reply media lalu ketik:
${usedPrefix + command}`
        )
    }

    try {
        let buffer = await q.download()
        let type = await fileTypeFromBuffer(buffer)
        let ext = type?.ext || "bin"
        let filename = `upload_${Date.now()}.${ext}`

        let form = new FormData()
        form.append("file", buffer, filename)

        let res = await axios.post(
            "https://uploader-sooty.vercel.app/api/upload",
            form,
            { headers: form.getHeaders() }
        )

        let data = res.data

        if (!data || !data.success || !data.url) {
            return m.reply("Upload berhasil tetapi URL tidak ditemukan.")
        }

        let msg =
`Media berhasil diunggah
URL: ${data.url}
ID: ${data.id || "-"}`

        m.reply(msg)

    } catch (e) {
        m.reply("Gagal mengunggah media.")
    }
}

handler.help = ["upload"]
handler.tags = ["tools"]
handler.command = /^upload$/i

export default handler