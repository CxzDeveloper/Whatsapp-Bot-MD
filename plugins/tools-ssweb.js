import axios from "axios"
import { fileTypeFromBuffer } from "file-type"

const DEVICE = {
  desktop: {
    w: 1920,
    h: 1080,
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  },
  mobile: {
    w: 390,
    h: 844,
    ua: "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
  }
}

async function ssweb(url, mode = "desktop", format = "jpg") {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("URL tidak valid")
  }

  if (!["desktop", "mobile"].includes(mode)) {
    throw new Error("Mode hanya desktop atau mobile")
  }

  if (!["jpg", "png"].includes(format)) {
    throw new Error("Format hanya jpg atau png")
  }

  const vp = DEVICE[mode]

  const params = {
    tkn: "125",
    u: url,
    w: vp.w,
    h: vp.h,
    d: 5000,
    fs: 1,
    f: format
  }

  const res = await axios.get("https://api.pikwy.com/", {
    params,
    responseType: "arraybuffer",
    headers: {
      "user-agent": vp.ua
    }
  })

  const type = res.headers["content-type"]

  if (type?.startsWith("image/")) {
    return Buffer.from(res.data)
  }

  let json
  try {
    json = JSON.parse(res.data.toString())
  } catch {
    throw new Error("Response tidak valid")
  }

  if (!json?.durl) {
    throw new Error(json?.mesg || "Gagal mengambil screenshot")
  }

  const img = await axios.get(json.durl, {
    responseType: "arraybuffer",
    headers: {
      "user-agent": vp.ua
    }
  })

  return Buffer.from(img.data)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`Gunakan:\n${usedPrefix + command} <url> [mobile] [jpg|png]`)
  }

  const url = args[0]
  const mode = args[1]?.toLowerCase() === "mobile" ? "mobile" : "desktop"
  const format = args[2]?.toLowerCase() || "jpg"

  try {
    m.reply("Mengambil screenshot...")

    const buffer = await ssweb(url, mode, format)
    const file = await fileTypeFromBuffer(buffer)

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        mimetype: file?.mime || "image/jpeg",
        caption: `URL: ${url}\nMode: ${mode}\nFormat: ${file?.ext || format}`
      },
      { quoted: m }
    )
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ["ssweb <url> [mobile] [format]"]
handler.tags = ["tools"]
handler.command = /^(ssweb|ss)$/i
handler.limit = true

export default handler