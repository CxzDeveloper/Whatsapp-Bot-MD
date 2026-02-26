/* 
⚠ Warning! ⚠
Jangan di ganti cr ini bos
© danz-xyz
api free : hookrest.my.id
owner : 62895323195263 [ Danz ]
*/

import chalk from "chalk";
import { watchFile, unwatchFile } from "fs";
import { fileURLToPath } from "url";
import moment from "moment-timezone";

// ==== id ch ====
global.idch = ["120363422342453820@newsletter"];
// ===== CONFIG =====
global.owner = ["6288294276026"];

global.info = {
    nomorbot: "639552784510",
    namabot: "αяσηα ωнαтѕαρρ вσт",
    nomorowner: "6288294276026",
    namaowner: "Kris - SkSd"
}

// ===== THUMBNAIL =====
global.thum = "https://cdn.botzaku.eu.org/18jianFcU4pQ_w5FTslibgoT68hl82FSv";

// ==== audio ===
global.audio = "https://files.catbox.moe/y11bvq.opus";

// ===== OPTIONS =====
global.autoread = true; // OPSIONAL
global.stage = {
    wait: "*[ sʏsᴛᴇᴍ ] sᴇᴅᴀɴɢ ᴅɪᴘʀᴏsᴇs...*",
    error: "*[ ᴡᴀʀɴɪɴɢ ] ᴘʀᴏsᴇs ɢᴀɢᴀʟ!*"
}

// ===== LINK ====
global.lgh = "https://github.com/CxzDeveloper"; // Github
global.lwa = "https://wa.me/6288294276026"; // Whatsapp
global.lig = ""; // Instagram
global.lgc = ""; // Group Chat Whatsapp
global.lch = ""; // Channels Whatsapp 
let file = fileURLToPath(import.meta.url);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(`${chalk.white.bold(" [SISTEM]")} ${chalk.green.bold(`FILE DIUPDATE "settings.js"`)}`);
    import(`${file}?update=${Date.now()}`);
});
