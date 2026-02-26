import axios from "axios";

let handler = async (m, { conn, usedPrefix, command }) => {
    // URL server API tempat daftar media berada
    const apiUrl = 'https://uploader-sooty.vercel.app/api/list'; 

    m.reply("Mengambil seluruh daftar media dari server...");

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.media) {
            return m.reply("Gagal mendapatkan data media yang valid dari server.");
        }

        let allMedia = data.media;
        let totalMedia = allMedia.length;

        let replyMsg = `DAFTAR SELURUH MEDIA TERSIMPAN\n`;
        replyMsg += `----------------------------\n`;
        replyMsg += `Total Media: ${totalMedia}\n\n`;

        if (totalMedia === 0) {
            replyMsg += "Server tidak memiliki media yang tersimpan.";
        } else {
            // TIDAK ADA BATASAN JUMLAH: Mengiterasi seluruh array allMedia
            allMedia.forEach((item, index) => {
                let uploadDate = item.uploadedAt ? new Date(item.uploadedAt).toLocaleString('id-ID') : 'Tidak diketahui';

                replyMsg += `[ ${index + 1} ]\n`;
                replyMsg += `  • ID: ${item.id}\n`;
                replyMsg += `  • Nama File: ${item.filename}\n`;
                replyMsg += `  • Diunggah: ${uploadDate}\n`;
                replyMsg += `  • URL: ${item.url}\n`;
                replyMsg += `----------------------------\n`;
            });
            
            replyMsg += `Pastikan pesan ini tidak terlalu panjang jika jumlah media sangat banyak.`;
        }

        m.reply(replyMsg);

    } catch (error) {
        let errorMessage = 'Gagal terhubung ke API atau server tidak merespon.';
        if (error.response) {
            errorMessage = `Gagal mengambil daftar media. Status: ${error.response.status}. Pesan: ${error.response.data.message || 'Error server.'}`;
        } else if (error.request) {
            errorMessage = `Tidak ada respons dari server ${apiUrl}. Pastikan URL benar.`;
        }

        m.reply(`Operasi Gagal:\n${errorMessage}`);
    }
}

handler.help = ["list"];
handler.tags = ["api"];
handler.command = /^list$/i;
handler.owner = true;

export default handler;