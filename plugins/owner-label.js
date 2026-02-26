let handler = async (m, { conn, usedPrefix, command, text }) => {
    
    if (!text) {
        return m.reply(`Contoh: ${usedPrefix + command} Orang Penting`);
    }
    
    const loadingMsg = await conn.sendMessage(
        m.chat,
        { text: "Memproses..." },
        { quoted: m }
    );
    
    try {
        await conn.relayMessage(
            m.chat,
            {
                protocolMessage: {
                    // MENGHILANGKAN key: m.key
                    type: 30, 
                    memberLabel: {
                        label: text,
                        labelTimestamp: Date.now()
                    }
                }
            },
            {}
        );
        
        await conn.sendMessage(
            m.chat,
            {
                edit: loadingMsg.key,
                text: `Label *${text}* berhasil diterapkan! (Cek di list anggota grup)`
            }
        );
        
    } catch (e) {
        await conn.sendMessage(
            m.chat,
            {
                edit: loadingMsg.key,
                text: `Gagal menerapkan label: ${e.message}. Fitur ini mungkin sudah tidak didukung.`
            }
        );
    }
};

handler.help = ["label", "setnametag"];
handler.tags = ["owner"];
handler.command = ["label", "setlabel", "setnametag"];
handler.owner = true;

export default handler;