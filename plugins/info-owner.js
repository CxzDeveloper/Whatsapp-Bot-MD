const name = global.info?.namaowner || 'Owner Bot'
const number = global.info?.nomorowner || ''

let handler = async (m, { conn }) => {
    const vcard = `
BEGIN:VCARD
VERSION:3.0
N:${name};;;;
FN:${name}
ORG:Creator Bot
TEL;type=CELL;waid=${number}:${number}
ADR:;;Indonesia;;;;
END:VCARD`.trim()

    const sentMsg = await conn.sendMessage(m.chat, {
        contacts: {
            displayName: name,
            contacts: [{ vcard }]
        }
    }, { quoted: m })

    await conn.sendMessage(
        m.chat,
        { text: 'Itu adalah nomor owner bot' },
        { quoted: sentMsg }
    )
}

handler.command = ['owner', 'creator']
handler.help = ['owner', 'creator']
handler.tags = ['info']
handler.limit = false

export default handler