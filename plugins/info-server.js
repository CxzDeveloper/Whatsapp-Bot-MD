import os from 'os'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://freeipapi.com/api/json')
    const data = await res.json()

    const usedMem = os.totalmem() - os.freemem()
    const uptime = toTime(os.uptime() * 1000)

    let text = `乂  *S E R V E R*\n\n`
    text += `┌  OS: ${os.type()} (${os.arch()} / ${os.release()})\n`
    text += `│  RAM: ${formatSize(usedMem)} / ${formatSize(os.totalmem())}\n`

    if (Array.isArray(data.timeZones)) {
      data.timeZones = data.timeZones[0]
    }

    for (const key in data) {
      if (key === 'currencies') {
        const currency = data.currencies?.[0] || 'N/A'
        text += `│  Currency: ${currency}\n`
      } else {
        text += `│  ${ucword(key)}: ${data[key]}\n`
      }
    }

    text += `│  Uptime: ${uptime}\n`
    text += `└  Processor: ${os.cpus()[0]?.model || 'Unknown'}\n`

    await conn.relayMessage(m.chat, {
      extendedTextMessage: {
        text,
        contextInfo: {
          externalAdReply: {
            title: uptime,
            mediaType: 1,
            previewType: 0,
            renderLargerThumbnail: true,
            thumbnailUrl: 'https://telegra.ph/file/cf4f28ed3b9ebdfb30adc.png',
            sourceUrl: ''
          }
        },
        mentions: [m.sender]
      }
    }, {})
  } catch (e) {
    console.error(e)
    m.reply('Gagal mengambil informasi server.')
  }
}

handler.help = ['server']
handler.tags = ['info']
handler.command = /^server$/i
handler.owner = true

export default handler

function formatSize(bytes) {
  if (!bytes) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

function ucword(str) {
  return String(str).replace(/\b\w/g, l => l.toUpperCase())
}

function toTime(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)

  return `${d} days, ${h % 24} hours, ${m % 60} minutes, ${s % 60} seconds`
}