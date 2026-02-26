let handler = async (m, { conn, usedPrefix, command, reply }) => {
    
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!/audio|video/.test(mime)) {
        return reply(`Balas Voice Note, Video, atau Audio yang ingin diubah ke MP3 dengan perintah: ${usedPrefix + command}`);
    }
    
    try {
        const mediaBuffer = await q.download();
        
        if (mediaBuffer.length > 52428800) {
            return reply('❌ Ukuran file terlalu besar (Maksimal 50 MB).');
        }

        await conn.sendMessage(m.chat, {
            audio: mediaBuffer,
            mimetype: 'audio/mpeg', 
            fileName: `konversi_${Date.now()}.mp3`,
            ptt: false
        }, { quoted: m });
        
    } catch (e) {
        reply(`Gagal mengkonversi media ke MP3. Error: ${e.message}`);
    }
};

handler.help = ['tomp3', 'mp3'];
handler.tags = ['tools'];
handler.command = ['tomp3', 'toaud', 'mp3'];

export default handler;