import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import crypto from 'crypto'
import path from 'path'
import os from 'os'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) throw `Reply image with command *${usedPrefix + command}*`

    m.reply('*Processing...*')

    try {
        let img = await q.download()
        let tempPath = path.join(os.tmpdir(), `${Date.now()}.png`)
        fs.writeFileSync(tempPath, img)

        const productSerial = crypto.randomUUID()
        
        const form = new FormData()
        form.append('original_image_file', fs.createReadStream(tempPath), {
            filename: 'image.png',
            contentType: 'image/png'
        })

        const create = await axios.post('https://api.unblurimage.ai/api/imgupscaler/v2/ai-image-colorize/create-job', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
                'Product-Serial': productSerial,
                'origin': 'https://unblurimage.ai',
                'referer': 'https://unblurimage.ai/'
            }
        })

        const jobId = create.data.result.job_id
        let outputUrl = null

        while (!outputUrl) {
            await new Promise(resolve => setTimeout(resolve, 3000))
            const check = await axios.get(`https://api.unblurimage.ai/api/imgupscaler/v2/ai-image-colorize/get-job/${jobId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
                    'Product-Serial': productSerial,
                    'origin': 'https://unblurimage.ai',
                    'referer': 'https://unblurimage.ai/'
                }
            })

            if (check.data.code === 100000 && check.data.result?.output_url) {
                outputUrl = check.data.result.output_url
            }
        }

        await conn.sendMessage(m.chat, { 
            image: { url: outputUrl }, 
            caption: '✅ *Colorize Success*' 
        }, { quoted: m })

        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)

    } catch (e) {
        console.error(e)
        m.reply('Error occurred during processing.')
    }
}

handler.help = ['colorize']
handler.tags = ['ai']
handler.command = /^(colorize|color)$/i

export default handler