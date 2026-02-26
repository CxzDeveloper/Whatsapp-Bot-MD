let handler = async (m, { conn, command, usedPrefix, text }) => {
    const groups = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us'))

    if (!text) {
        return showGroupList(m, conn, groups, usedPrefix, command)
    }

    let [id, expired] = text.split('|')
    if (!/^\d+$/.test(id)) {
        return showGroupList(m, conn, groups, usedPrefix, command)
    }

    const index = Number(id) - 1
    if (!groups[index]) {
        return conn.reply(m.chat, 'Grup dengan urutan tersebut tidak ditemukan.', m)
    }

    const group = groups[index]
    const who = group.id
    const namegc = await conn.getName(who)

    if (!global.db.data.chats[who]) global.db.data.chats[who] = {}

    const now = Date.now()
    const jumlahHari = Number(expired) * 86400000
    const date = new Date(now).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    switch (command) {
        case 'addsewa': {
            if (!expired || isNaN(expired)) throw 'Masukkan jumlah hari yang valid'

            if (global.db.data.chats[who].expired && now < global.db.data.chats[who].expired) {
                global.db.data.chats[who].expired += jumlahHari
            } else {
                global.db.data.chats[who].expired = now + jumlahHari
            }

            const caption = `
[ Groups Notifikasi ]

Menambahkan jangka waktu sewa group bot.
Nama group: ${namegc}
Id group: ${who}
Tanggal: ${date}
Jangka waktu: ${msToDate(global.db.data.chats[who].expired - now)}

Terima kasih telah menyewa bot kami
`.trim()

            await conn.sendMessage(who, { text: caption })
            return conn.reply(
                m.chat,
                `Berhasil menambah masa sewa ${expired} hari\nSisa waktu: ${msToDate(global.db.data.chats[who].expired - now)}`,
                m
            )
        }

        case 'setsewa': {
            if (!expired || isNaN(expired)) throw 'Masukkan jumlah hari yang valid'

            global.db.data.chats[who].expired = now + jumlahHari

            const caption = `
[ Groups Notifikasi ]

Perubahan jangka waktu sewa group bot.
Nama group: ${namegc}
Id group: ${who}
Tanggal: ${date}
Jangka waktu: ${msToDate(global.db.data.chats[who].expired - now)}

Waktu sewa telah diperbarui oleh owner bot
`.trim()

            await conn.sendMessage(who, { text: caption })
            return conn.reply(
                m.chat,
                `Berhasil mengatur ulang masa sewa ${expired} hari\nSisa waktu: ${msToDate(global.db.data.chats[who].expired - now)}`,
                m
            )
        }

        case 'delsewa': {
            if (!global.db.data.chats[who]) throw 'Grup tidak ditemukan di database'

            global.db.data.chats[who].expired = false
            await conn.groupLeave(who)

            return conn.reply(
                m.chat,
                'Berhasil menghapus masa sewa dan keluar dari grup',
                m
            )
        }
    }
}

handler.help = ['addsewa', 'setsewa', 'delsewa']
handler.tags = ['owner']
handler.command = /^(addsewa|setsewa|delsewa)$/i
handler.owner = true

export default handler

function showGroupList(m, conn, groups, usedPrefix, command) {
    const list = groups
        .map((v, i) => `${i + 1}. ${v.subject}`)
        .join('\n')

    const text = `
LIST GROUP JOINING

${list}

Contoh penggunaan:
${usedPrefix + command} <nomor>|<jumlah hari>
`.trim()

    return conn.reply(m.chat, text, m)
}

function msToDate(ms) {
    let days = Math.floor(ms / 86400000)
    let hours = Math.floor(ms % 86400000 / 3600000)
    let minutes = Math.floor(ms % 3600000 / 60000)
    return `${days} hari ${hours} jam ${minutes} menit`
}