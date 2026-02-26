let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = global.db.data.users[m.sender]

    let needSword = user.sword < 1
    let needArmor = user.armor < 1
    let needHealt = user.healt < 90

    if (needSword || needArmor || needHealt) {
        let msg = item(user.sword, user.armor, user.healt, usedPrefix)
        return conn.sendMessage(m.chat, {
            text: msg,
            contextInfo: {
                externalAdReply: {
                    title: 'Dungeon',
                    thumbnailUrl: 'https://telegra.ph/file/750e79e2764d529aea52e.jpg',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        })
    }

    global.dungeon = global.dungeon || {}

    if (Object.values(global.dungeon).find(r =>
        r.id.startsWith('dungeon-') &&
        Object.values(r.game).includes(m.sender)
    )) {
        return m.reply('Kamu masih berada di dalam dungeon')
    }

    let cooldown = new Date() - (user.lastdungeon || 0)
    if (cooldown < 100) {
        return m.reply(`Silakan tunggu ${clockString(100 - cooldown)}`)
    }

    let room = Object.values(global.dungeon).find(r =>
        r.state === 'WAITING' && (text ? r.name === text : true)
    )

    if (!room) {
        room = {
            id: 'dungeon-' + Date.now(),
            state: 'WAITING',
            name: text || '',
            player1: m.chat,
            player2: '',
            player3: '',
            player4: '',
            game: {
                player1: m.sender,
                player2: '',
                player3: '',
                player4: ''
            },
            price: {
                money: rand(500000),
                exp: rand(70000),
                sampah: rand(200),
                potion: rand(1),
                diamond: pickRandom([0, 0, 0, 1]),
                iron: rand(1),
                kayu: rand(2),
                batu: rand(1),
                string: rand(1),
                common: pickRandom([0, 0, 1]),
                uncommon: pickRandom([0, 0, 1]),
                mythic: pickRandom([0, 0, 0, 1]),
                legendary: pickRandom([0, 0, 0, 1]),
                pet: pickRandom([0, 0, 0, 1]),
                makananPet: pickRandom([0, 0, 1])
            },
            less: {
                healt: rand(100),
                sword: rand(50)
            }
        }

        global.dungeon[room.id] = room

        return conn.sendMessage(m.chat, {
            text: `Menunggu partner\n${text ? `${usedPrefix}${command} ${text}` : ''}\natau ketik sendiri`,
            contextInfo: {
                externalAdReply: {
                    title: 'Dungeon',
                    thumbnailUrl: 'https://telegra.ph/file/750e79e2764d529aea52e.jpg',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        })
    }

    let slots = ['player2', 'player3', 'player4']
    for (let s of slots) {
        if (!room.game[s]) {
            room.game[s] = m.sender
            room[s] = m.chat
            break
        }
    }

    if (room.game.player1 && room.game.player2 && room.game.player3 && room.game.player4) {
        room.state = 'PLAYING'
        startDungeon(conn, room, usedPrefix)
    }
}

handler.before = async function (m) {
    global.dungeon = global.dungeon || {}

    let room = Object.values(global.dungeon).find(r =>
        r.state === 'WAITING' &&
        Object.values(r.game).includes(m.sender)
    )

    if (!room) return

    if (/^(sendiri|solo)$/i.test(m.text)) {
        if (room.game.player2 || room.game.player3 || room.game.player4) {
            return m.reply('Tidak bisa solo karena sudah ada partner')
        }

        room.state = 'PLAYING'
        startDungeon(this, room)
    }

    if (/^(gass|mulai)$/i.test(m.text)) {
        room.state = 'PLAYING'
        startDungeon(this, room)
    }
}

handler.help = ['dungeon [nama room]']
handler.tags = ['rpg']
handler.command = /^dungeon$/i

export default handler

function startDungeon(conn, room, usedPrefix = '') {
    let players = Object.values(room.game).filter(Boolean)
    let users = global.db.data.users
    let { healt, sword } = room.less
    let reward = room.price

    let text = `
Room ID: ${room.id}
${players.map(M).join(', ')}
Dungeon dimulai
`.trim()

    for (let c of [room.player1, room.player2, room.player3, room.player4].filter(Boolean)) {
        conn.sendMessage(c, { text })
    }

    setTimeout(() => {
        for (let p of players) {
            let u = users[p]
            if (!u) continue

            u.healt = Math.max(0, u.healt - healt)
            u.sworddurability -= sword
            u.money += reward.money
            u.exp += reward.exp
            u.lastdungeon = Date.now()

            if (u.sworddurability < 1) {
                u.sword = Math.max(0, u.sword - 1)
                u.sworddurability = u.sword * 50
            }
        }

        delete global.dungeon[room.id]
    }, pickRandom([3000, 5000, 7000, 9000]))
}

function rand(max) {
    return Math.floor(Math.random() * (max + 1))
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function M(jid) {
    return '@' + jid.split('@')[0]
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function item(sword, armor, healt, usedPrefix) {
    let msg = []
    if (sword < 1) msg.push(`Ketik ${usedPrefix}craft sword`)
    if (armor < 1) msg.push(`Ketik ${usedPrefix}buy armor`)
    if (healt < 90) msg.push(`Ketik ${usedPrefix}heal`)
    return msg.join('\n')
}