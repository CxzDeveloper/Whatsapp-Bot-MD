import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
`Mana username TikTok nya?

Contoh:
${usedPrefix + command} khaby.lame`)
    }

    const username = args[0].replace('@','')
    await m.reply('Mengambil data TikTok...\nTunggu sebentar...')

    try {
        const apiUrl = `https://api.ootaizumi.web.id/stalk/tiktok?username=${encodeURIComponent(username)}`
        const { data } = await axios.get(apiUrl)

        if (!data.result || !data.result.user) {
            return m.reply('User TikTok tidak ditemukan.')
        }

        const u = data.result.user
        const s = data.result.stats

        let capt = `🎵 *TIKTOK STALK*\n\n`
        capt += `👤 Username: @${u.uniqueId}\n`
        capt += `📝 Nickname: ${u.nickname}\n`
        capt += `🆔 User ID: ${u.id}\n`
        capt += `🌍 Bahasa: ${u.language}\n`
        capt += `✔ Verified: ${u.verified ? 'Ya' : 'Tidak'}\n`
        capt += `🔒 Private: ${u.privateAccount ? 'Ya' : 'Tidak'}\n\n`

        capt += `📊 *STATISTIK*\n`
        capt += `👥 Followers: ${s.followerCount}\n`
        capt += `➡ Following: ${s.followingCount}\n`
        capt += `❤️ Likes: ${s.heartCount}\n`
        capt += `🎬 Video: ${s.videoCount}\n`
        capt += `👍 Digg: ${s.diggCount}\n`
        capt += `🤝 Friend: ${s.friendCount}\n\n`

        capt += `📅 Akun dibuat: ${new Date(u.createTime * 1000).toLocaleDateString('id-ID')}\n`
        capt += `🔗 Profil: https://www.tiktok.com/@${u.uniqueId}`

        await conn.sendFile(
            m.chat,
            u.avatarLarger || u.avatarMedium || u.avatarThumb,
            'tiktok.jpg',
            capt.trim(),
            m
        )

    } catch (e) {
        console.log(e)
        m.reply('Gagal mengambil data TikTok. Coba lagi nanti.')
    }
}

handler.help = ['tiktokstalk','ttstalk','stalktiktok']
handler.tags = ['stalker']
handler.command = /^(tiktokstalk|ttstalk|stalktiktok)$/i
handler.limit = false

export default handler