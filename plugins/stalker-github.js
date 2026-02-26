import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
`Mana username GitHub nya?

Contoh:
${usedPrefix + command} torvalds`)
    }

    const username = args[0]
    await m.reply('Mengambil data GitHub...\nTunggu sebentar...')

    try {
        const apiUrl = `https://api-yuda.cxzdev.biz.id/api/stalk/github/profile?username=${encodeURIComponent(username)}`
        const { data } = await axios.get(apiUrl)

        if (!data.result || !data.result.user) {
            return m.reply('User GitHub tidak ditemukan.')
        }

        const u = data.result.user

        let capt = `🐙 *GITHUB STALK*\n\n`
        capt += `👤 Username: ${u.login}\n`
        capt += `📝 Nama: ${u.name || '-'}\n`
        capt += `🧾 Bio: ${u.bio || '-'}\n`
        capt += `🏢 Company: ${u.company || '-'}\n`
        capt += `🌐 Website: ${u.blog || '-'}\n`
        capt += `📍 Lokasi: ${u.location || '-'}\n`
        capt += `🐦 Twitter: ${u.twitter_username || '-'}\n\n`
        capt += `📦 Repo Publik: ${u.public_repos}\n`
        capt += `👥 Followers: ${u.followers}\n`
        capt += `➡ Following: ${u.following}\n\n`
        capt += `🔗 Profile: ${u.html_url}\n`
        capt += `📅 Dibuat: ${new Date(u.created_at).toLocaleDateString('id-ID')}\n`
        capt += `♻ Update: ${new Date(u.updated_at).toLocaleDateString('id-ID')}`

        await conn.sendFile(
            m.chat,
            u.avatar_url,
            'github.jpg',
            capt.trim(),
            m
        )

    } catch (e) {
        console.log(e)
        m.reply('Gagal mengambil data GitHub. Coba lagi nanti.')
    }
}

handler.help = ['githubstalk', 'ghstalk', 'stalkgithub']
handler.tags = ['stalker']
handler.command = /^(githubstalk|ghstalk|stalkgithub)$/i
handler.limit = false

export default handler