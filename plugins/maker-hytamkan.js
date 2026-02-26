import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime.startsWith('image/')) {
        return m.reply('Reply / kirim gambar waifu yang mau dihitamkan.')
    }

    await m.reply('Memproses gambar...\nTunggu sebentar...')

    try {
        // download image buffer dari WhatsApp
        const buffer = await q.download()

        // bikin form-data multipart
        const form = new FormData()
        form.append('image', buffer, {
            filename: 'waifu.jpg',
            contentType: mime
        })

        const { data } = await axios.post(
            'https://api.ootaizumi.web.id/ai-image/hytamkan',
            form,
            { headers: form.getHeaders() }
        )

        if (!data.result) return m.reply('Gagal memproses gambar.')

        await conn.sendFile(
            m.chat,
            data.result,
            'waifu.png',
            '✨ Waifu berhasil dihitamkan',
            m
        )

    } catch (e) {
        console.log(e)
        m.reply('Terjadi error saat memproses gambar.')
    }
}

handler.help = ['hitamkan <reply foto waifu>']
handler.tags = ['maker']
handler.command = /^(hitamkan|waifuhitam|hytamkan)$/i
handler.limit = false

export default handler