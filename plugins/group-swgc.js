import * as baileys from "baileys";
import crypto from "node:crypto";
import path from "path";

async function groupStatus(conn, jid, content) {
    const { backgroundColor } = content;
    delete content.backgroundColor;
    
    const inside = await baileys.generateWAMessageContent(content, { 
        upload: conn.waUploadToServer, 
        backgroundColor 
    });
    
    const messageSecret = crypto.randomBytes(32);
    
    const m = baileys.generateWAMessageFromContent(
        jid,
        {
            messageContextInfo: { messageSecret },
            groupStatusMessageV2: {
                message: { 
                    ...inside, 
                    messageContextInfo: { messageSecret } 
                }
            }
        },
        {}
    );
    
    await conn.relayMessage(jid, m.message, { messageId: m.key.id });
    return m;
}

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || "";
        
        const textToParse = m.text || m.body || "";
        const caption = textToParse.replace( 
            new RegExp(`^\\${usedPrefix}${command}\\s*`, "i"), "" 
        ).trim();

        if (!mime && !caption) {
            return m.reply(
                `Balas media (gambar/video/audio) atau sertakan teks pengumuman.\n\nContoh:\n${usedPrefix + command} (balas gambar)`
            );
        }

        let payload = {};

        if (/image/.test(mime)) {
            payload = { image: await q.download(), caption };
        } else if (/video/.test(mime)) {
            payload = { video: await q.download(), caption };
        } else if (/audio/.test(mime)) {
            payload = { audio: await q.download(), mimetype: mime || "audio/mp4" };
        } else if (caption) {
            payload = { text: caption };
        } else {
            return m.reply(
                `Balas media atau tambahkan teks. Format tidak didukung.`
            );
        }

        await groupStatus(conn, m.chat, payload);
        
        // Pesan Berhasil Ditambahkan
        await m.reply("Pesan Status Grup telah berhasil dikirim.");
        
    } catch (e) {
        await m.reply("Terjadi kesalahan saat mencoba mengirim status grup.");
    }
};

handler.help = ["swgc", "upswgc"];
handler.tags = ["group"];
handler.command = /^(upswgc|swgc|swgrup)$/i;
handler.group = true;

export default handler;