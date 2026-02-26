import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Example: ${usedPrefix + command} https://hanzxd-api.vercel.app/`)

    try {
        let { data } = await axios.get(`https://hookrestapi.vercel.app/tools/hostinfo?host=${encodeURIComponent(text)}`)
        let info = data.result || data

        let caption = `*HOST INFO*\n\n`
        caption += `*Target:* ${text}\n`
        caption += `*IP:* ${info.ip || '-'}\n`
        caption += `*City:* ${info.city || '-'}\n`
        caption += `*Region:* ${info.region || '-'}\n`
        caption += `*Country:* ${info.country || '-'}\n`
        caption += `*ISP:* ${info.isp || '-'}\n`
        caption += `*Org:* ${info.org || '-'}\n`
        caption += `*Timezone:* ${info.timezone || '-'}\n`
        caption += `*Location:* ${info.loc || '-'}`

        m.reply(caption)
    } catch (e) {
        m.reply('Error: Host not found or API issue.')
    }
}

handler.help = ['hostinfo <url>']
handler.tags = ['tools']
handler.command = /^(hostinfo|checkhost)$/i

export default handler