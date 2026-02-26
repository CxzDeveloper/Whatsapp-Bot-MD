let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]

    if (user.register) {
        return m.reply(
            `Kamu sudah terdaftar!\n\nNama: ${user.name}\nUmur: ${user.age} tahun\nLevel: ${user.level}\nExp: ${user.exp}`
        )
    }

    if (!text) {
        return m.reply(
            `Gunakan format:\n${usedPrefix + command} nama.umur\n\nContoh: ${usedPrefix + command} Hookrest.19`
        )
    }

    let [nama, umur] = text.split(".")
    if (!nama) return m.reply(`Nama tidak boleh kosong`)
    if (!umur) return m.reply(`Umur tidak boleh kosong`)

    umur = parseInt(umur)
    if (isNaN(umur)) return m.reply(`Umur harus angka`)
    if (umur < 10) return m.reply(`Umur minimal 10 tahun`)
    if (umur > 70) return m.reply(`Umur maksimal 70 tahun`)
    if (nama.length > 25) return m.reply(`Nama maksimal 25 huruf`)

    nama = nama.trim()

    // Init data penting (INI YANG SEBELUMNYA HILANG)
    user.exp = user.exp || 0
    user.level = user.level || 0

    user.name = nama
    user.age = umur
    user.register = true
    user.regTime = Date.now()

    // Bonus exp
    user.exp += 50

    let caption = `
PENDAFTARAN BERHASIL

Nama: ${nama}
Umur: ${umur} tahun
Status: Terdaftar

Bonus: +50 Exp
Sekarang kamu bisa menggunakan semua fitur bot
Ketik .profile atau .me untuk cek status
    `.trim()

    let pp
    try {
        pp = await conn.profilePictureUrl(m.sender, "image")
    } catch {
        pp = "https://telegra.ph/file/4d1e7c7d5d29f5b7e7c99.jpg"
    }

    await conn.sendMessage(
        m.chat,
        {
            image: { url: pp },
            caption,
            mentions: [m.sender]
        },
        { quoted: m }
    )
}

handler.help = ["daftar nama.umur"]
handler.tags = ["main"]
handler.command = /^(daftar|register)$/i
handler.register = false

export default handler