import fs from "fs"
import path from "path"
import axios from "axios"
import FormData from "form-data"

const imageUpscaler = async (imagePath, options = {}) => {
    try {
        const baseURL = 'https://host.optikl.ink';
        const endpoint = '/tools/upscaling';

        if (!fs.existsSync(imagePath)) throw new Error('File tidak ditemukan');

        const fileExt = path.extname(imagePath).toLowerCase();
        const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
        if (!allowedExt.includes(fileExt)) throw new Error('Hanya mendukung file JPG, PNG, WEBP');

        const fileSize = fs.statSync(imagePath).size;
        if (fileSize > 10 * 1024 * 1024) throw new Error('Ukuran file maksimal 10MB');

        const fileStream = fs.createReadStream(imagePath);
        const form = new FormData();
        form.append('file', fileStream, {
            filename: path.basename(imagePath),
            contentType: `image/${fileExt.replace('.', '')}`
        });

        const headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json, text/plain, */*',
            'Origin': baseURL,
            'Referer': `${baseURL}/web/upscaling`,
            ...form.getHeaders()
        };

        const response = await axios.post(`${baseURL}${endpoint}`, form, {
            headers,
            timeout: 120000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (!response.data?.success || !response.data?.data?.url) {
            throw new Error('Upscaling gagal: ' + (response.data?.message || 'Unknown error'));
        }

        const resultUrl = response.data.data.url;
        const downloadResponse = await axios.get(resultUrl, {
            responseType: 'stream',
            headers: { 'Referer': baseURL }
        });

        const timestamp = Date.now();
        const outputFileName = `upscaled_${timestamp}${fileExt}`;
        const outputPath = path.join(process.cwd(), outputFileName);

        const writer = fs.createWriteStream(outputPath);
        downloadResponse.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                const result = {
                    success: true,
                    originalSize: fileSize,
                    upscaledUrl: resultUrl,
                    downloadedPath: outputPath,
                    fileName: outputFileName
                };
                if (options.returnBase64) {
                    const imageBuffer = fs.readFileSync(outputPath);
                    result.base64 = imageBuffer.toString('base64');
                }
                resolve(result);
            });
            writer.on('error', (err) => reject(new Error(`Download gagal: ${err.message}`)));
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
};

let handler = async (m, { conn }) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = q.mimetype || q.msg?.mimetype || "";

        if (!mime || !mime.startsWith("image/")) {
            return m.reply("> Kirim atau reply gambar lalu ketik ${usedPrefix + command}");
        }

        const buffer = await q.download();
        const tmpFile = `./temp_${Date.now()}.jpg`;
        fs.writeFileSync(tmpFile, buffer);

        await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

        const result = await imageUpscaler(tmpFile);
        fs.unlinkSync(tmpFile);

        if (!result.success) {
            await conn.sendMessage(m.chat, { react: { text: "🙏", key: m.key } });
            return m.reply(`Upscale gagal: ${result.error}`);
        }

        await conn.sendMessage(m.chat, { react: { text: "🥱", key: m.key } });

        let caption =
`Upscale berhasil!
Nama File: ${result.fileName}
Ukuran Asli: ${(result.originalSize / 1024).toFixed(2)} KB`;

        await conn.sendMessage(
            m.chat,
            { image: fs.readFileSync(result.downloadedPath), caption: caption },
            { quoted: m }
        );

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "🙏", key: m.key } });
        m.reply(`Terjadi kesalahan saat proses upscale: ${e.message}`);
    }
};

handler.help = ["hd"];
handler.tags = ["tools"];
handler.command = /^hd|remini|hdr$/i;

export default handler;