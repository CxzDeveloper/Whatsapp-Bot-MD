import axios from 'axios'
import * as cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan URL yang ingin di-inspect!\n\nContoh:\n${usedPrefix + command} https://google.com`)

    // Validasi protokol URL
    if (!/^https?:\/\//.test(text)) text = 'http://' + text

    m.reply('🕵️‍♂️ *Inspecting target...*')

    try {
        const start = Date.now()
        
        // Melakukan request dengan validasi status longgar (agar error 404/500 tetap terbaca)
        const response = await axios.get(text, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            },
            validateStatus: function (status) {
                return true // Tetap proses meskipun status bukan 200
            },
            timeout: 10000 // Timeout 10 detik
        })
        
        const latency = Date.now() - start
        const $ = cheerio.load(response.data)

        // Ekstraksi Metadata HTML
        const title = $('title').text().trim() || 'Tidak ada judul'
        const description = $('meta[name="description"]').attr('content') || '-'
        const keywords = $('meta[name="keywords"]').attr('content') || '-'
        const author = $('meta[name="author"]').attr('content') || '-'
        
        // Ekstraksi Header Server
        const server = response.headers['server'] || 'Hidden'
        const contentType = response.headers['content-type'] || 'Unknown'
        const contentLength = response.headers['content-length'] ? formatSize(response.headers['content-length']) : 'Unknown'

        // Cek Redirect
        const finalUrl = response.request.res.responseUrl || text
        const isRedirected = finalUrl !== text

        // Menyusun Laporan
        let txt = `🔍 *WEB INSPECTION RESULT*\n\n`
        txt += `🔗 *Target:* ${text}\n`
        if (isRedirected) txt += `🔀 *Redirected to:* ${finalUrl}\n`
        txt += `⚡ *Status:* ${response.status} ${response.statusText}\n`
        txt += `⏱️ *Latency:* ${latency}ms\n`
        txt += `📦 *Size:* ${contentLength}\n\n`
        
        txt += `📝 *METADATA*\n`
        txt += `• *Title:* ${title}\n`
        txt += `• *Desc:* ${description}\n`
        txt += `• *Author:* ${author}\n\n`
        
        txt += `💻 *TECHNICAL*\n`
        txt += `• *Server:* ${server}\n`
        txt += `• *Content-Type:* ${contentType}\n`

        // Mencoba mengambil Favicon
        let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
        
        if (favicon) {
            // Fix relative URL favicon
            if (!favicon.startsWith('http')) {
                let urlObj = new URL(finalUrl)
                favicon = new URL(favicon, urlObj.origin).href
            }
            
            // Kirim dengan gambar jika favicon ketemu
            await conn.sendMessage(m.chat, { 
                image: { url: favicon }, 
                caption: txt 
            }, { quoted: m })
        } else {
            // Kirim teks saja
            m.reply(txt)
        }

    } catch (e) {
        console.error(e)
        // Menangani error koneksi (DNS error, timeout, dll)
        m.reply(`❌ *Inspection Failed!*\n\nReason: ${e.message}\nHost mungkin down, tidak valid, atau memblokir bot.`)
    }
}

handler.help = ['inspect <url>']
handler.tags = ['tools', 'developer']
handler.command = /^(inspect|cekweb|webinfo)$/i

export default handler

function formatSize(bytes) {
    if (bytes == 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}