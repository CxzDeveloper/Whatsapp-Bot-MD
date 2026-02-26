import { Client } from 'ssh2'

const THEMES = {
  reviactyl: { name: "Reviactyl", url: "https://github.com/reviactyl/panel/releases/latest/download/panel.tar.gz" },
  nebula: { name: "Nebula", url: "https://github.com/NebulaTheme/panel/releases/latest/download/panel.tar.gz" },
  aurora: { name: "Aurora", url: "https://github.com/AuroraTheme/panel/releases/latest/download/panel.tar.gz" },
  slate: { name: "Slate", url: "https://github.com/SlateTheme/panel/releases/latest/download/panel.tar.gz" },
  nightcore: { name: "Nightcore", url: "https://github.com/NightcoreTheme/panel/releases/latest/download/panel.tar.gz" },
  stellar: { name: "Stellar", url: "https://github.com/StellarTheme/panel/releases/latest/download/panel.tar.gz" }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (text && text.toLowerCase() === "list") {
    let msg = `🎨 *DAFTAR THEME PANEL GRATIS*\n\n`
    Object.keys(THEMES).forEach(k => {
      msg += `• ${k} — ${THEMES[k].name}\n`
    })
    msg += `\nContoh:\n${usedPrefix + command} 1.1.1.1|password|nebula`
    return m.reply(msg)
  }

  if (!text) {
    return m.reply(`❌ Format salah!

${usedPrefix + command} ipvps|password|tema
${usedPrefix + command} list`)
  }

  const t = text.split('|').map(v => v.trim())
  if (t.length < 2) return m.reply(`❌ Format salah!`)

  const ipvps = t[0]
  const passwd = t[1]
  const themeKey = (t[2] || 'reviactyl').toLowerCase()

  if (!THEMES[themeKey]) {
    return m.reply(`❌ Tema tidak tersedia!\n${usedPrefix + command} list`)
  }

  const theme = THEMES[themeKey]

  const sendStatus = async (status, log) => {
    await conn.reply(
      m.chat,
`🎨 *INSTALL THEME PANEL*

🌐 IP VPS: ${ipvps}
🎭 Theme: ${theme.name}
📊 Status: ${status}
──────────────────
📝 Log: ${log}`, m)
  }

  await sendStatus("⏳ Connecting...", "Menghubungkan ke SSH...")

  const ssh = new Client()

  ssh.on('ready', async () => {
    await sendStatus("🟢 SSH Connected", "Backup panel dulu...")

    const backupCmd = `cp -r /var/www/pterodactyl /var/www/pterodactyl_backup`

    ssh.exec(backupCmd, (err) => {
      if (err) {
        sendStatus("🔴 Backup Gagal", err.message)
        return ssh.end()
      }

      sendStatus("📦 Backup OK", "Install theme dimulai...")

      const installCmd = `cd /var/www/pterodactyl && \
curl -Lo panel.tar.gz ${theme.url} && \
tar -xzvf panel.tar.gz && \
chmod -R 755 storage/* bootstrap/cache/ && \
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader && \
php artisan migrate --seed --force && \
chown -R www-data:www-data /var/www/pterodactyl/* && \
php artisan config:cache && \
php artisan cache:clear && \
php artisan view:clear && \
systemctl restart pteroq.service && \
systemctl restart wings.service`

      ssh.exec(installCmd, async (err2, stream) => {
        if (err2) {
          await sendStatus("🔴 Exec Error", err2.message)
          return ssh.end()
        }

        stream.on('data', d => console.log('SSH:', d.toString()))
        stream.stderr.on('data', d => console.log('SSH ERR:', d.toString()))

        stream.on('close', async code => {

          if (code === 0) {
            await conn.reply(m.chat,
`✅ *INSTALL BERHASIL*

🎭 Theme: ${theme.name}
🖥️ Host: ${ipvps}
──────────────────
✨ Theme terpasang
🔄 Panel & Wings direstart`, m)
          } else {

            await sendStatus("⚠️ Install gagal", "Restore backup...")

            const restoreCmd = `rm -rf /var/www/pterodactyl && mv /var/www/pterodactyl_backup /var/www/pterodactyl && systemctl restart pteroq && systemctl restart wings`

            ssh.exec(restoreCmd, async () => {
              await conn.reply(m.chat,
`🔄 *RESTORE SELESAI*

Panel dikembalikan ke kondisi sebelum install theme.
Server aman kembali.`, m)
              ssh.end()
            })
            return
          }

          ssh.end()
        })
      })
    })
  })

  ssh.on('error', async err => {
    await sendStatus("🔴 SSH Error", err.message)
  })

  ssh.connect({
    host: ipvps,
    port: 22,
    username: "root",
    password: passwd,
    readyTimeout: 30000
  })
}

handler.help = ['installtheme ipvps|password|tema']
handler.tags = ['panel']
handler.command = /^(installtheme|installthema)$/i
handler.owner = true

export default handler