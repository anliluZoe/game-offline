import { describe, expect, it } from 'vitest'
import { createGame, place, undo } from './engine.ts'

function play(moves: Array<[number, number]>) {
  let state = createGame()
  for (const [r, c] of moves) {
    state = place(state, r, c)
  }
  return state
}

describe('createGame', () => {
  it('starts with an empty 15×15 board and black to move', () => {
    const state = createGame()
    expect(state.board).toHaveLength(15)
    expect(state.board.every((row) => row.length === 15 && row.every((cell) => cell === 0))).toBe(
      true,
    )
    expect(state.turn).toBe(1)
    expect(state.moves).toEqual([])
    expect(state.winner).toBeNull()
    expect(state.winningLine).toBeNull()
  })
})

describe('place', () => {
  it('places black then white on empty points and switches turn', () => {
    const afterBlack = place(createGame(), 7, 7)
    expect(afterBlack.board[7][7]).toBe(1)
    expect(afterBlack.turn).toBe(2)
    expect(afterBlack.moves).toEqual([{ r: 7, c: 7 }])

    const afterWhite = place(afterBlack, 7, 8)
    expect(afterWhite.board[7][8]).toBe(2)
    expect(afterWhite.turn).toBe(1)
  })

  it('ignores occupied, out-of-bounds, and moves after a win', () => {
    const empty = createGame()
    expect(place(empty, -1, 0)).toBe(empty)
    expect(place(empty, 15, 0)).toBe(empty)
    expect(place(empty, 0, 15)).toBe(empty)

    const occupied = place(empty, 3, 3)
    expect(place(occupied, 3, 3)).toBe(occupied)

    const won = play([
      [7, 0],
      [0, 0],
      [7, 1],
      [0, 1],
      [7, 2],
      [0, 2],
      [7, 3],
      [0, 3],
      [7, 4],
    ])
    expect(won.winner).toBe(1)
    expect(place(won, 8, 8)).toBe(won)
  })

  it('wins with five in a row horizontally, vertically, and both diagonals', () => {
    const horizontal = play([
      [7, 0],
      [0, 0],
      [7, 1],
      [0, 1],
      [7, 2],
      [0, 2],
      [7, 3],
      [0, 3],
      [7, 4],
    ])
    expect(horizontal.winner).toBe(1)
    expect(horizontal.winningLine).toHaveLength(5)
    expect(horizontal.winningLine).toEqual(
      expect.arrayContaining([
        { r: 7, c: 0 },
        { r: 7, c: 1 },
        { r: 7, c: 2 },
        { r: 7, c: 3 },
        { r: 7, c: 4 },
      ]),
    )

    const vertical = play([
      [0, 7],
      [0, 0],
      [1, 7],
      [0, 1],
      [2, 7],
      [0, 2],
      [3, 7],
      [0, 3],
      [4, 7],
    ])
    expect(vertical.winner).toBe(1)
    expect(vertical.winningLine).toEqual(
      expect.arrayContaining([
        { r: 0, c: 7 },
        { r: 1, c: 7 },
        { r: 2, c: 7 },
        { r: 3, c: 7 },
        { r: 4, c: 7 },
      ]),
    )

    const diagDown = play([
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 2],
      [2, 2],
      [0, 3],
      [3, 3],
      [0, 4],
      [4, 4],
    ])
    expect(diagDown.winner).toBe(1)

    const diagUp = play([
      [4, 0],
      [0, 0],
      [3, 1],
      [0, 1],
      [2, 2],
      [0, 2],
      [1, 3],
      [0, 3],
      [0, 4],
    ])
    expect(diagUp.winner).toBe(1)
  })

  it('does not win on four in a row, but wins on six or more', () => {
    const four = play([
      [7, 0],
      [0, 0],
      [7, 1],
      [0, 1],
      [7, 2],
      [0, 2],
      [7, 3],
    ])
    expect(four.winner).toBeNull()
    expect(four.winningLine).toBeNull()

    const six = play([
      [7, 0],
      [8, 0],
      [7, 1],
      [8, 1],
      [7, 3],
      [8, 3],
      [7, 4],
      [8, 4],
      [7, 5],
      [8, 6],
      [7, 2],
    ])
    expect(six.winner).toBe(1)
    expect(six.winningLine).toHaveLength(6)
  })
})

describe('undo', () => {
  it('removes the last stone and restores the turn', () => {
    const afterTwo = play([
      [7, 7],
      [7, 8],
    ])
    const undone = undo(afterTwo)
    expect(undone.board[7][8]).toBe(0)
    expect(undone.board[7][7]).toBe(1)
    expect(undone.turn).toBe(2)
    expect(undone.moves).toEqual([{ r: 7, c: 7 }])
  })

  it('does nothing on an empty board', () => {
    const empty = createGame()
    expect(undo(empty)).toBe(empty)
  })

  it('clears a win so play can continue', () => {
    const won = play([
      [7, 0],
      [0, 0],
      [7, 1],
      [0, 1],
      [7, 2],
      [0, 2],
      [7, 3],
      [0, 3],
      [7, 4],
    ])
    const undone = undo(won)
    expect(undone.winner).toBeNull()
    expect(undone.winningLine).toBeNull()
    expect(undone.turn).toBe(1)
    const continued = place(undone, 8, 8)
    expect(continued.board[8][8]).toBe(1)
    expect(continued.winner).toBeNull()
  })
})
