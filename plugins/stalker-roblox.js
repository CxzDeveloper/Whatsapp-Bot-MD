import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
`Mana username Roblox nya?

Contoh:
${usedPrefix + command} builderman`)
    }

    const username = args[0]
    await m.reply('Mengambil data Roblox...\nTunggu sebentar...')

    try {
        const apiUrl = `https://api.ootaizumi.web.id/stalk/roblox?username=${encodeURIComponent(username)}`
        const { data } = await axios.get(apiUrl)

        if (!data.result || !data.result.result) {
            return m.reply('User Roblox tidak ditemukan.')
        }

        const u = data.result.result
        const avatar = data.result.profileDetails
        const lastOnline = data.result.lastOnline

        let capt = `🎮 *ROBLOX STALK*\n\n`
        capt += `👤 Username: ${u.name}\n`
        capt += `🪪 Display Name: ${u.displayName}\n`
        capt += `🆔 User ID: ${u.id}\n`
        capt += `✔ Verified Badge: ${u.hasVerifiedBadge ? 'Ya' : 'Tidak'}\n`
        capt += `🚫 Banned: ${u.isBanned ? 'Ya' : 'Tidak'}\n\n`
        capt += `📝 Bio: ${u.description || '-'}\n`
        capt += `🟢 Last Online: ${lastOnline}\n`
        capt += `📅 Dibuat: ${new Date(u.created).toLocaleDateString('id-ID')}\n\n`
        capt += `🔗 Profile: https://www.roblox.com/users/${u.id}/profile`

        await conn.sendFile(
            m.chat,
            avatar,
            'roblox.jpg',
            capt.trim(),
            m
        )

    } catch (e) {
        console.log(e)
        m.reply('Gagal mengambil data Roblox. Coba lagi nanti.')
    }
}

handler.help = ['robloxstalk', 'stalkroblox']
handler.tags = ['stalker']
handler.command = /^(robloxstalk|stalkroblox)$/i
handler.limit = false

export default handler