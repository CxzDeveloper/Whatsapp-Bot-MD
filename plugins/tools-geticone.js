import axios from "axios";

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let url;

    if (text) {
        url = text.startsWith('http') ? text : 'http://' + text;
    } else {
        return m.reply(
            `Format salah. Masukkan URL website yang ingin diambil ikonnya.\n\nContoh:\n${usedPrefix + command} google.com`
        );
    }

    let hostname;
    try {
        hostname = new URL(url).hostname;
    } catch (e) {
        return m.reply('URL yang Anda masukkan tidak valid.');
    }

    let faviconApiUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    
    m.reply(`⏳ Mencoba mengambil ikon dari ${hostname}...`);

    try {
        const response = await axios.get(faviconApiUrl, {
            responseType: 'arraybuffer'
        });

        if (response.headers['content-type'].startsWith('image/')) {
            await conn.sendFile(m.chat, response.data, 'favicon.png', 
                `Ikon berhasil diambil dari URL:\n${url}\n\nURL Ikon:\n${faviconApiUrl}`, m);
        } else {
            m.reply(`Gagal mengambil ikon. Server merespons dengan tipe non-gambar. URL yang dicoba: ${faviconApiUrl}`);
        }

    } catch (error) {
        let errorMessage = 'Gagal mengakses layanan ikon atau URL tidak valid.';
        if (error.message.includes('Invalid URL')) {
             errorMessage = 'URL yang Anda masukkan tidak valid.';
        }
        
        m.reply(`Operasi Gagal:\n${errorMessage}`);
    }
}

handler.help = ["icon"];
handler.tags = ["tools"];
handler.command = /^icon(e|web|website)?$/i;

export default handler;