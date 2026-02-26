import fs from "fs"
import path from "path"

function scanFilesPerFile(folderPath, keyword) {
    let results = []
    const files = fs.readdirSync(folderPath)

    for (const file of files) {
        const fullPath = path.join(folderPath, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            results = results.concat(scanFilesPerFile(fullPath, keyword))
        } else {
            try {
                const content = fs.readFileSync(fullPath, "utf8")
                const matches = content.match(new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi"))
                if (matches && matches.length > 0) {
                    // simpan path relatif dari folder plugins
                    const relativePath = path.relative("./plugins", fullPath)
                    results.push({ file: relativePath, count: matches.length })
                }
            } catch (e) {
                continue
            }
        }
    }

    // sort berdasarkan nama file
    results.sort((a, b) => a.file.localeCompare(b.file))
    return results
}

let handler = async (m, { args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(
`Gunakan:
${usedPrefix + command} <keyword>

Contoh:
${usedPrefix + command} ootaizumi
${usedPrefix + command} https://api.ootaizumi.web.id/`
    )

    const keyword = args.join(" ").toLowerCase()
    const pluginsFolder = "./plugins/"

    try {
        const results = scanFilesPerFile(pluginsFolder, keyword)

        if (results.length === 0) {
            return m.reply(`Keyword "${keyword}" tidak ditemukan di file plugin manapun.`)
        }

        let msg = `Hasil pencarian keyword "${keyword}":\n\n`
        results.forEach(r => {
            msg += `• ${r.file}: ${r.count}\n`
        })

        return m.reply(msg)

    } catch (err) {
        console.log(err)
        return m.reply(`Terjadi kesalahan saat scan file plugin. Error: ${err.message}`)
    }
}

handler.help = ["cek"]
handler.tags = ["tools"]
handler.command = /^cek$/i

export default handler