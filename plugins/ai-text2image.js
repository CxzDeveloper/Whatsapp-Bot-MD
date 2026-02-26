import axios from "axios"
import FormData from "form-data"

const aiLabs = {
  api: {
    base: "https://text2video.aritek.app",
    endpoints: {
      text2img: "/text2img"
    }
  },

  headers: {
    "user-agent": "NB Android/1.0.0",
    "accept-encoding": "gzip",
    "content-type": "application/json",
    authorization: ""
  },

  state: { token: null },

  setup: {
    cipher: "hbMcgZLlzvghRlLbPcTbCpfcQKM0PcU0zhPcTlOFMxBZ1oLmruzlVp9remPgi0QWP0QW",
    shiftValue: 3,

    dec(text, shift) {
      return [...text].map(c =>
        /[a-z]/.test(c)
          ? String.fromCharCode((c.charCodeAt(0) - 97 - shift + 26) % 26 + 97)
          : /[A-Z]/.test(c)
          ? String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65)
          : c
      ).join("")
    },

    async decrypt() {
      if (aiLabs.state.token) return aiLabs.state.token
      let input = aiLabs.setup.cipher
      let shift = aiLabs.setup.shiftValue
      let decrypted = aiLabs.setup.dec(input, shift)
      aiLabs.state.token = decrypted
      aiLabs.headers.authorization = decrypted
      return decrypted
    }
  },

  async text2img(prompt) {
    if (!prompt?.trim()) {
      return {
        success: false,
        result: { error: "Prompt tidak boleh kosong." }
      }
    }

    const token = await aiLabs.setup.decrypt()
    const form = new FormData()
    form.append("prompt", prompt)
    form.append("token", token)

    try {
      const url = aiLabs.api.base + aiLabs.api.endpoints.text2img
      const res = await axios.post(url, form, {
        headers: { ...aiLabs.headers, ...form.getHeaders() }
      })

      const { code, url: imageUrl } = res.data

      if (code !== 0 || !imageUrl) {
        return {
          success: false,
          result: { error: "Gagal memproses gambar." }
        }
      }

      return {
        success: true,
        result: {
          url: imageUrl.trim(),
          prompt
        }
      }

    } catch (err) {
      return {
        success: false,
        result: { error: err.message }
      }
    }
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(
`Masukkan prompt teks untuk membuat gambar.

Contoh:
.text2image kota futuristik penuh cahaya neon`
    )
  }

  try {
    let res = await aiLabs.text2img(text)

    if (!res.success) {
      return m.reply(res.result.error)
    }

    await conn.sendMessage(
      m.chat,
      { image: { url: res.result.url }, caption: "Berhasil membuat gambar." },
      { quoted: m }
    )

  } catch (e) {
    m.reply("Gagal memproses permintaan.")
  }
}

handler.help = ["text2image"]
handler.tags = ["ai"]
handler.command = /^text2image$/i

export default handler