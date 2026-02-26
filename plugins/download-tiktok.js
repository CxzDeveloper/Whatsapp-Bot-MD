import axios from "axios"
import * as cheerio from "cheerio"

async function tikwmMethod(url) {
  const body = new URLSearchParams({
    url,
    count: "12",
    cursor: "0",
    web: "1",
    hd: "1"
  })

  const { data } = await axios.post(
    "https://tikwm.com/api/",
    body.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 15000
    }
  )

  if (!data || data.code !== 0 || !data.data) throw "tikwm failed"

  const v = data.data

  return {
    name: "tikwm",
    type: "video",
    video: `https://tikwm.com${v.hdplay || v.play}`,
    audio: `https://tikwm.com${v.music}`,
    caption:
      `TikTok Downloader\n` +
      `Judul  : ${v.title || "-"}\n` +
      `Author : ${v.author.nickname} (@${v.author.unique_id})`
  }
}

async function restwaveMethod(url) {
  const { data } = await axios.get(
    `https://www.restwave.my.id/download/tiktok?url=${encodeURIComponent(url)}`,
    { timeout: 15000 }
  )

  if (!data.status) throw "restwave failed"

  const r = data.result.data

  return {
    name: "api-restwave",
    type: "video",
    video: r.hdplay || r.wmplay || r.play,
    audio: r.music,
    caption:
      `TikTok Downloader\n` +
      `Judul  : ${r.title}\n` +
      `Author : ${r.author.nickname} (@${r.author.unique_id})`
  }
}

async function savetikSlideMethod(url) {
  const body = new URLSearchParams({
    q: url,
    lang: "en",
    cftoken: ""
  })

  const { data } = await axios.post(
    "https://savetik.co/api/ajaxSearch",
    body.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 15000
    }
  )

  if (data.status !== "ok") throw "savetik failed"

  const $ = cheerio.load(data.data)
  const images = []

  $(".download-box li").each((_, el) => {
    const link = $(el).find(".download-items__btn a").attr("href")
    if (link) images.push(link)
  })

  if (!images.length) throw "not slide"

  return {
    name: "savetik-slide",
    type: "image",
    images
  }
}

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply("Masukkan link TikTok")

  await conn.sendMessage(
    m.chat,
    { text: "memproses tiktok..." },
    { quoted: m }
  )

  let slideResult = null

  try {
    slideResult = await savetikSlideMethod(text)
  } catch {}

  const results = []

  if (slideResult) {
    results.push(slideResult)
  } else {
    for (const fn of [tikwmMethod, restwaveMethod]) {
      try {
        const res = await fn(text)
        results.push(res)
      } catch {}
    }
  }

  if (!results.length) {
    return m.reply("Gagal mengambil konten TikTok")
  }

  const picked =
    results.length === 1
      ? results[0]
      : results[Math.floor(Math.random() * results.length)]

  if (picked.type === "image") {
    for (const img of picked.images) {
      await conn.sendMessage(
        m.chat,
        { image: { url: img } },
        { quoted: m }
      )
    }
  }

  if (picked.type === "video") {
    await conn.sendMessage(
      m.chat,
      {
        video: { url: picked.video },
        caption: picked.caption
      },
      { quoted: m }
    )

    if (picked.audio) {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: picked.audio },
          mimetype: "audio/mpeg"
        },
        { quoted: m }
      )
    }
  }

  await m.reply(`download method: ${picked.name}`)
}

handler.help = ["tt <link>"]
handler.tags = ["downloader"]
handler.command = /^(tt|tiktok)$/i

export default handler