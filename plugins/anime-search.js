import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
`Mana nama animenya?

Contoh:
${usedPrefix + command} naruto`)
    }

    const namaanime = args.join(' ')
    await m.reply('Mengambil info anime...\nTunggu sebentar...')

    try {
        const apiUrl = `https://api-yuda.cxzdev.biz.id/api/myanimelist/anime?search=${encodeURIComponent(namaanime)}`
        const { data } = await axios.get(apiUrl)

        if (!data.result || !data.result.length) {
            return m.reply('Tidak ada anime yang ditemukan.')
        }

        const results = data.result.slice(0, 5)

        let capt = `📺 *ANIME SEARCH*\n\n`
        capt += `🔎 Pencarian: ${namaanime}\n`
        capt += `📊 Menampilkan: ${results.length} hasil teratas\n\n`
        capt += `━━━━━━━━━━━━━━━━━━\n\n`

        results.forEach((anime, i) => {
            capt += `*${i + 1}. ${anime.title || '-'}*\n`
            capt += `📁 Tipe: ${anime.type || '-'}\n`
            capt += `🎞 Episode: ${anime.episode || '-'}\n`
            capt += `⭐ Rating: ${anime.score || '-'}\n`
            capt += `🔗 Link: ${anime.url || '-'}\n`
            capt += `\n━━━━━━━━━━━━━━━━━━\n\n`
        })

        await conn.sendFile(
            m.chat,
            results[0].thumbnail,
            'anime.jpg',
            capt.trim(),
            m
        )

    } catch (e) {
        console.log(e)
        m.reply('Gagal mengambil data anime. Coba lagi nanti.')
    }
}

handler.help = ['anime-search', 'anime', 'animsearch']
handler.tags = ['anime']
handler.command = /^(anime-search|anime|animsearch)$/i
handler.limit = false

export default handler