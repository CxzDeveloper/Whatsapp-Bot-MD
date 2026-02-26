import { translate } from '@vitalets/google-translate-api'

const DEFAULT_LANG = 'id'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text && !m.quoted?.text) {
    return m.reply(
      `Contoh penggunaan:\n` +
      `${usedPrefix}${command} hello world|en\n` +
      `${usedPrefix}${command} apa kabar`
    )
  }

  let input = text || m.quoted.text
  let lang = DEFAULT_LANG
  let content = input

  if (input.includes('|')) {
    let split = input.split('|')
    content = split[0].trim()
    lang = split[1]?.trim() || DEFAULT_LANG
  }

  if (!content) {
    return m.reply('Teks tidak boleh kosong')
  }

  let result
  try {
    result = await translate(content, {
      to: lang,
      autoCorrect: true
    })
  } catch {
    return m.reply('Terjemahan gagal')
  }

  m.reply(result.text)
}

handler.help = ['tr <text>|<lang>']
handler.tags = ['tools']
handler.command = /^(tr|tl|translate)$/i

export default handler