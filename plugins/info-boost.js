import { performance } from 'perf_hooks'

let handler = async (m, { conn }) => {
  const typing = () => conn.sendPresenceUpdate('composing', m.chat)
  const delay = ms => new Promise(r => setTimeout(r, ms))

  await typing()
  const sent = await conn.sendMessage(m.chat, { text: 'Boosting . . .' }, { quoted: m })

  const steps = [
    rand(0, 20),
    rand(21, 40),
    rand(41, 60),
    rand(61, 80),
    rand(81, 100)
  ]

  for (const p of steps) {
    await typing()
    await delay(300)
    await conn.sendMessage(
      m.chat,
      { text: `${p}%` },
      { edit: sent.key }
    )
  }

  const start = performance.now()
  const end = performance.now()

  await typing()
  await delay(300)

  await conn.sendMessage(
    m.chat,
    {
      text:
`Berhasil mempercepat bot

Respons: ${(end - start).toFixed(2)} ms`
    },
    { edit: sent.key }
  )
}

handler.help = ['boost', 'refresh']
handler.tags = ['info']
handler.command = /^(boost|refresh)$/i

export default handler

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}