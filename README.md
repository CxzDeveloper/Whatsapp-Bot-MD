# 🤖 WhatsApp Bot MD

Bot WhatsApp Multi-Device berbasis Node.js dengan sistem plugin modular, dirancang untuk kebutuhan otomatisasi, utilitas, dan fitur lengkap mulai dari downloader hingga AI.

---

# ✨ Fitur Utama

👑 Owner

- Mode owner only command
- Broadcast message
- Eval & exec script
- Manage user / block / unblock
- Restart bot dari chat

📋 Main Menu

- Menu interaktif dengan tombol / list
- Kategori fitur terstruktur
- Statistik bot (uptime, speed, memory)

📥 Downloader

- YouTube MP3 / MP4
- TikTok tanpa watermark
- Instagram downloader
- Media scraper umum

🎨 Maker

- Sticker maker otomatis
- Sticker dari URL / video / gif
- Text to sticker
- Meme generator

🖥️ Panel Pterodactyl

- Create server panel otomatis
- Suspend / unsuspend server
- Delete server
- Cek resource server
- Support API key admin

🤖 AI

- Chat AI (Q&A, diskusi, belajar)
- AI image prompt helper
- AI code helper
- Auto reply cerdas

🧰 Tools

- OCR gambar ke teks
- Convert media (audio, video, sticker)
- URL shortener
- QR generator / reader

🔎 Search

- Google search
- YouTube search
- Image search
- Wiki search

☪️ Islamic

- Jadwal sholat
- Al-Qur'an ayat random
- Doa harian
- Kisah nabi
- Reminder ibadah

---

# ⚙️ Instalasi

git clone https://github.com/CxzDeveloper/Whatsapp-Bot-MD
cd yourbot
npm install
npm start

---

# 📦 Konfigurasi

Edit file config:

owner: ["628xxxx"],
botName: "WhatsAppBotMD",
sessionName: "session",
prefix: ".",

Masukkan API key yang dibutuhkan pada file ".env" atau config.

---

# 🧩 Struktur Plugin

plugins/
 ├── downloader/
 ├── ai/
 ├── islamic/
 ├── tools/
 ├── owner/
 └── menu/

Bot otomatis membaca semua file plugin tanpa perlu register manual.

---

# 🚀 Jalankan Bot

node index.js

Scan QR lalu bot siap digunakan.

---

# 🛡️ Note

- Gunakan bot dengan bijak
- Jangan spam API
- Owner bertanggung jawab atas penggunaan bot

---

# 👨‍💻 Credit

- Base by Developer
- Library Baileys MD
- Open source contributors

---

# 📄 License

Free to use & modify for learning purposes.
