import axios from 'axios'
import yts from 'yt-search'
import { toPTT } from '../function/converter.js'

let handler = async (m, { conn, args, command, usedPrefix }) => {
    if (!args[0]) return m.reply(
`ᴋᴇᴛɪᴋ ᴊᴜᴅᴜʟ ʟᴀɢᴜɴʏᴀ♡

ᴄᴏɴᴛᴏʜ:
${usedPrefix + command} dj aku bukan boneka`
    )

    let status = await conn.reply(m.chat, `sᴇᴅᴀɴɢ ᴍᴇɴᴄᴀʀɪ ʟᴀɢᴜ...`, m)

    try {
        let query = args.join(' ')
        let search = await yts(query)

        if (!search.videos.length) {
            await conn.sendMessage(m.chat, { text: `ʟᴀɢᴜ ɢᴀᴋ ᴋᴇᴛᴇᴍᴜ :(` }, { quoted: m })
            return conn.sendMessage(m.chat, { delete: status.key })
        }

        let vid = search.videos[0]

        const apiUrl = `https://host.optikl.ink/download/youtube?url=${encodeURIComponent(vid.url)}&format=mp3`
        const { data } = await axios.get(apiUrl)

        if (!data.result?.download) throw 'Audio not found'

        let res = data.result
        let mp3Buffer = (await axios.get(res.download, { responseType: 'arraybuffer' })).data

        const { data: opusData } = await toPTT(mp3Buffer)

        await conn.sendMessage(m.chat, {
            audio: opusData,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            waveform: [0,100,0,100,0,100,0,100],
            contextInfo: {
                externalAdReply: {
                    title: res.title.slice(0, 30),
                    body: vid.author.name || 'YouTube',
                    thumbnailUrl: vid.thumbnail,
                    sourceUrl: vid.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await conn.sendMessage(m.chat, { text: `sᴇʟᴇsᴀɪ♡`, edit: status.key })

        setTimeout(() => {
            conn.sendMessage(m.chat, { delete: status.key })
        }, 3000)

    } catch (e) {
        console.log(e)
        await conn.sendMessage(m.chat, { text: `ɢᴀɢᴀʟ ᴘʀᴏsᴇs :(`, edit: status.key })
    }
}

handler.help = ['play']
handler.tags = ['download']
handler.command = /^play$/i
handler.limit = true

export default handler