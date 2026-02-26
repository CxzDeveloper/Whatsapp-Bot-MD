const userAgent =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"

class GeminiClient {
  constructor() {
    this.s = null
    this.r = 1
  }

  async init() {
    const res = await fetch("https://gemini.google.com/", {
      headers: { "user-agent": userAgent }
    })

    const h = await res.text()

    this.s = {
      a: h.match(/"SNlM0e":"(.*?)"/)?.[1] || "",
      b: h.match(/"cfb2h":"(.*?)"/)?.[1] || "",
      c: h.match(/"FdrFJe":"(.*?)"/)?.[1] || ""
    }

    this.r = 1
    return this.s
  }

  async ask(text) {
    if (!this.s) await this.init()

    const payload = [null, JSON.stringify([[text, 0, null, null, null, null, 0]])]

    const query = new URLSearchParams({
      bl: this.s.b,
      "f.sid": this.s.c,
      hl: "id",
      _reqid: this.r++,
      rt: "c"
    })

    const res = await fetch(
      `https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?${query}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "user-agent": userAgent,
          "x-same-domain": "1"
        },
        body: `f.req=${encodeURIComponent(JSON.stringify(payload))}&at=${this.s.a}`
      }
    )

    return this.parse(await res.text())
  }

  parse(text) {
    for (const line of text.split("\n")) {
      if (!line.startsWith('[["wrb.fr"')) continue
      try {
        const json = JSON.parse(JSON.parse(line)[0][2])
        const out = json?.[4]?.[0]?.[1]
        if (out) {
          return {
            text: Array.isArray(out) ? out[0] : out
          }
        }
      } catch {}
    }
    return null
  }

  reset() {
    this.s = null
    this.r = 1
  }
}

const gemini = new GeminiClient()

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `Gunakan:\n${usedPrefix + command} <pertanyaan>`
    )
  }

  if (text.toLowerCase() === "reset") {
    gemini.reset()
    return m.reply("Gemini berhasil direset.")
  }

  try {
    const res = await gemini.ask(text)
    if (!res?.text) return m.reply("Tidak ada respon.")

    m.reply(res.text)
  } catch (e) {
    console.log(e)
    m.reply("Terjadi kesalahan saat menghubungi AI.")
  }
}

handler.help = ["gemini <pertanyaan>", "ai <pertanyaan>"]
handler.tags = ["ai"]
handler.command = /^(gemini|ai)$/i
handler.limit = false
handler.register = true

export default handler