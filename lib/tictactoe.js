export default class TicTacToe {
  constructor(playerX, playerO) {
    this.playerX = playerX
    this.playerO = playerO
    this._currentTurn = true
    this._x = 0
    this._o = 0
    this._turns = 0
  }

  get board() {
    return this._x | this._o
  }

  get currentTurn() {
    return this._currentTurn ? this.playerX : this.playerO
  }

  get winner() {
    let win = [
      7, 56, 448,
      73, 146, 292,
      273, 84
    ]
    for (let combo of win) {
      if ((this._x & combo) === combo) return this.playerX
      if ((this._o & combo) === combo) return this.playerO
    }
    return null
  }

  render() {
    let board = Array(9).fill(null)
    for (let i = 0; i < 9; i++) {
      let bit = 1 << i
      if (this._x & bit) board[i] = 'X'
      else if (this._o & bit) board[i] = 'O'
      else board[i] = (i + 1).toString()
    }
    return board
  }

  turn(isO, index) {
    let bit = 1 << index
    if (this.board & bit) return false
    if (this.winner) return false

    if (isO) this._o |= bit
    else this._x |= bit

    this._currentTurn = !this._currentTurn
    this._turns++
    return true
  }
}