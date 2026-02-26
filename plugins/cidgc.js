// File: plugins/cekid.js

let handler = async (m, { conn, command, usedPrefix }) => {
    
    // Periksa apakah perintah dijalankan di dalam Grup
    if (!m.isGroup) {
        throw `Perintah *${usedPrefix + command}* hanya dapat digunakan di dalam grup.`;
    }

    // m.chat berisi JID (ID) dari grup tempat pesan itu dikirim
    const groupId = m.chat;
    
    // Dapatkan metadata grup (opsional, untuk nama grup)
    let groupMetadata;
    try {
        // Menggunakan safeGroupMetadata jika tersedia di sock/conn
        groupMetadata = await conn.safeGroupMetadata(groupId); 
    } catch (e) {
        // Jika gagal mendapatkan metadata, gunakan JID sebagai nama
        console.error("Gagal mendapatkan metadata grup:", e);
        groupMetadata = { subject: 'Grup Tidak Dikenal' };
    }

    const groupName = groupMetadata.subject;

    // Pesan Balasan
    let message = `*🆔 Informasi ID Grup*\n\n`;
    message += `*Nama Grup:* ${groupName}\n`;
    message += `*ID Grup (JID):* \`${groupId}\``;

    m.reply(message);
};

handler.help = ['cekid'];
handler.tags = ['info'];
handler.command = /^(cekid|groupid|gid)$/i;
handler.group = true; // Hanya bisa digunakan di grup
handler.limit = false; 

export default handler;