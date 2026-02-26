const winScore = 500
const playScore = 50
const debugMode = false

let handler = m => m

handler.before = function (m) {
  this.game = this.game || {}

  let room = Object.values(this.game).find(room =>
    room.id &&
    room.game &&
    room.state === 'PLAYING' &&
    room.id.startsWith('tictactoe') &&
    [room.game.playerX, room.game.playerO].includes(m.sender)
  )

  if (!room) return true
  if (!m.text) return true

  if (!/^([1-9]|(me)?nyerah|surr?ender)$/i.test(m.text)) return true

  let isSurrender = !/^[1-9]$/.test(m.text)

  if (m.sender !== room.game.currentTurn && !isSurrender) return true

  let ok = 0
  let isWin = false
  let isTie = false

  if (!isSurrender) {
    ok = room.game.turn(
      m.sender === room.game.playerO,
      parseInt(m.text) - 1
    )

    if (ok < 1) {
      m.reply({
        '-3': 'Game telah berakhir',
        '-2': 'Input tidak valid',
        '-1': 'Posisi tidak valid',
        0: 'Posisi tidak valid'
      }[ok])
      return true
    }
  }

  if (m.sender === room.game.winner) isWin = true
  else if (room.game.board === 511) isTie = true

  if (isSurrender) {
    room.game._currentTurn = m.sender === room.game.playerX
    isWin = true
  }

  let winner = isSurrender
    ? room.game.currentTurn
    : room.game.winner

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

  let text = `
${board.slice(0, 3).join('')}
${board.slice(3, 6).join('')}
${board.slice(6).join('')}

${
  isWin
    ? `@${winner.split('@')[0]} Menang (+${winScore} XP)`
    : isTie
    ? `Seri (+${playScore} XP)`
    : `Giliran ${['❌', '⭕'][Number(room.game._currentTurn)]} (@${room.game.currentTurn.split('@')[0]})`
}

❌: @${room.game.playerX.split('@')[0]}
⭕: @${room.game.playerO.split('@')[0]}
Ketik *nyerah* untuk menyerah
Room ID: ${room.id}
`.trim()

  let users = global.db.data.users

  if ((room.game._currentTurn ^ isSurrender ? room.x : room.o) !== m.chat) {
    room[room.game._currentTurn ^ isSurrender ? 'x' : 'o'] = m.chat
  }

  if (room.x !== room.o) {
    this.reply(room.x, text, m, {
      mentions: this.parseMention(text)
    })
  }

  this.reply(room.o, text, m, {
    mentions: this.parseMention(text)
  })

  if (isTie || isWin) {
    users[room.game.playerX].exp += playScore
    users[room.game.playerO].exp += playScore

    if (isWin) {
      users[winner].exp += winScore - playScore
    }

    delete this.game[room.id]
  }

  return true
}

export default handler