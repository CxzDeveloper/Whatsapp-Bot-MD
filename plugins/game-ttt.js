import TicTacToe from '../lib/tictactoe.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  conn.game = conn.game || {}

  // cek apakah user masih di game
  let playing = Object.values(conn.game).find(room =>
    room.id?.startsWith('tictactoe') &&
    room.state === 'PLAYING' &&
    [room.game.playerX, room.game.playerO].includes(m.sender)
  )

  if (playing) {
    await m.reply('Kamu masih berada di dalam game.')
    return
  }

  // cari room yang menunggu
  let room = Object.values(conn.game).find(room =>
    room.state === 'WAITING' &&
    (text ? room.name === text : true)
  )

  // JOIN ROOM
  if (room) {
    room.o = m.chat
    room.game.playerO = m.sender
    room.state = 'PLAYING'

    let board = room.game.render().map(v => ({
      X: '❌',
      O: '⭕',
      1: '1️⃣',
      2: '2️⃣',
      3: '3️⃣',
      4: '4️⃣',
      5: '5️⃣',
      6: '6️⃣',
      7: '7️⃣',
      8: '8️⃣',
      9: '9️⃣'
    })[v])

    let teks = `
Room ID: ${room.id}

${board.slice(0, 3).join('')}
${board.slice(3, 6).join('')}
${board.slice(6).join('')}

Giliran: @${room.game.currentTurn.split('@')[0]}
Ketik *nyerah* untuk menyerah
`.trim()

    if (room.x !== room.o) {
      await conn.sendMessage(room.x, {
        text: teks,
        mentions: conn.parseMention(teks)
      })
    }

    await conn.sendMessage(room.o, {
      text: teks,
      mentions: conn.parseMention(teks)
    })

    return
  }

  // BUAT ROOM BARU
  let id = 'tictactoe-' + Date.now()
  conn.game[id] = {
    id,
    x: m.chat,
    o: '',
    state: 'WAITING',
    game: new TicTacToe(m.sender, 'o'),
    ...(text ? { name: text } : {})
  }

  let waitText = text
    ? `Menunggu partner...\n\nKetik:\n${usedPrefix}${command} ${text}`
    : 'Menunggu partner...'

  await m.reply(waitText)
}

handler.help = ['tictactoe [nama room]', 'ttt [nama room]']
handler.tags = ['game']
handler.command = /^(tictactoe|ttt)$/i

export default handler