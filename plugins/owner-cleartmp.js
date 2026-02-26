import { readdirSync, statSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
    const tmpDir = './tmp'
    const deleted = []

    if (!existsSync(tmpDir)) {
        return conn.reply(m.chat, 'Folder tmp tidak ditemukan.', m)
    }

    const files = readdirSync(tmpDir)

    if (!files.length) {
        return conn.reply(m.chat, 'Tidak ada file yang tersisa di tmp.', m)
    }

    for (const file of files) {
        const fullPath = join(tmpDir, file)
        const stats = statSync(fullPath)

        if (!stats.isFile()) continue

        unlinkSync(fullPath)
        deleted.push(file)
    }

    if (!deleted.length) {
        return conn.reply(m.chat, 'Tidak ada file yang tersisa di tmp.', m)
    }

    conn.reply(
        m.chat,
        `Berhasil membersihkan tmp.\n\nFile dihapus:\n${deleted.join('\n')}`,
        m
    )
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = /^(cleartmp)$/i
handler.rowner = true

export default handler