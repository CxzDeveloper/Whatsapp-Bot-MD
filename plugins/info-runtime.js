let handler = async (m, { conn }) => {
    let uptime = clockString(process.uptime() * 1000)

    let text = `Bot online selama ${uptime}`

    await conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.command = /^(runtime|uptime|rt)$/i
handler.tags = ['info']
handler.help = ['runtime', 'uptime']

export default handler

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}