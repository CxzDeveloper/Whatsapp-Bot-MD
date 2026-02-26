import { exec } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = q.mimetype || q.msg?.mimetype || ""

        if (!mime.includes("/")) {
            return m.reply(
`> Kirim atau reply audio
> lalu ketik *${usedPrefix + command}*`
            )
        }

        let buffer = await q.download()

        let input = join(tmpdir(), Date.now() + '.mp3')
        let output = join(tmpdir(), Date.now() + '.mp3')

        writeFileSync(input, buffer)

        // slow 0.8 + reverb
        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -y -i "${input}" -filter_complex "atempo=0.8,areverb" "${output}"`,
                (err) => err ? reject(err) : resolve()
            )
        })

        let result = readFileSync(output)

        await conn.sendMessage(m.chat, {
            audio: result,
            mimetype: 'audio/mp4'
        }, { quoted: m })

        unlinkSync(input)
        unlinkSync(output)

    } catch (e) {
        console.error(e)
        m.reply('❌ Gagal membuat efek slow reverb')
    }
}

handler.help = ['slowreverb']
handler.tags = ['tools']
handler.command = /^slowreverb$/i
handler.limit = true

export default handler