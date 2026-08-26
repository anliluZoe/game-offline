import { describe, expect, it } from 'vitest'
import {
  CELLS,
  HOME,
  createGame,
  destinations,
  key,
  move,
  undo,
  type GameState,
  type Player,
  type Pos,
} from './engine.ts'

function at(state: GameState, x: number, y: number) {
  return state.board[key({ x, y })]
}

function custom(pieces: Array<[number, number, Player]>, turn: Player = 1): GameState {
  const state = createGame()
  for (const cell of CELLS) state.board[key(cell)] = 0
  for (const [x, y, player] of pieces) state.board[key({ x, y })] = player
  state.turn = turn
  state.moves = []
  state.winner = null
  return state
}

function hasPos(list: Pos[], x: number, y: number) {
  return list.some((pos) => pos.x === x && pos.y === y)
}

describe('createGame', () => {
  it('builds a 121-hole star with 10 red on top, 10 green on bottom, red to move', () => {
    const state = createGame()
    expect(CELLS).toHaveLength(121)
    expect(HOME[1]).toHaveLength(10)
    expect(HOME[2]).toHaveLength(10)
    expect(HOME[1].every((cell) => at(state, cell.x, cell.y) === 1)).toBe(true)
    expect(HOME[2].every((cell) => at(state, cell.x, cell.y) === 2)).toBe(true)
    expect(Object.values(state.board).filter((cell) => cell === 1)).toHaveLength(10)
    expect(Object.values(state.board).filter((cell) => cell === 2)).toHaveLength(10)
    expect(state.turn).toBe(1)
    expect(state.moves).toEqual([])
    expect(state.winner).toBeNull()
  })
})

describe('move', () => {
  it('walks one step into an adjacent empty hole and switches turn', () => {
    const next = move(createGame(), { x: 9, y: 3 }, { x: 8, y: 4 })
    expect(at(next, 9, 3)).toBe(0)
    expect(at(next, 8, 4)).toBe(1)
    expect(next.turn).toBe(2)
    expect(next.moves).toEqual([{ from: { x: 9, y: 3 }, to: { x: 8, y: 4 } }])
  })

  it('ignores occupied, non-adjacent, opponent pieces, and moves after a win', () => {
    const start = createGame()
    expect(move(start, { x: 9, y: 3 }, { x: 9, y: 3 })).toBe(start)
    expect(move(start, { x: 12, y: 0 }, { x: 12, y: 8 })).toBe(start)
    expect(move(start, { x: 12, y: 16 }, { x: 12, y: 12 })).toBe(start)

    const occupied = move(start, { x: 9, y: 3 }, { x: 11, y: 3 })
    expect(occupied).toBe(start)

    const won = custom(
      [
        ...HOME[2].map((cell) => [cell.x, cell.y, 1] as [number, number, Player]),
        ...HOME[1].map((cell) => [cell.x, cell.y, 2] as [number, number, Player]),
      ],
      1,
    )
    won.winner = 1
    expect(destinations(won, HOME[2][0])).toEqual([])
    expect(move(won, HOME[2][0], { x: 12, y: 8 })).toBe(won)
  })

  it('short-jumps an adjacent piece and long-jumps a farther piece', () => {
    const shortBoard = custom([
      [8, 4, 1],
      [10, 4, 2],
    ])
    const short = move(shortBoard, { x: 8, y: 4 }, { x: 12, y: 4 })
    expect(at(short, 8, 4)).toBe(0)
    expect(at(short, 10, 4)).toBe(2)
    expect(at(short, 12, 4)).toBe(1)

    const longBoard = custom([
      [8, 4, 1],
      [12, 4, 2],
    ])
    expect(hasPos(destinations(longBoard, { x: 8, y: 4 }), 16, 4)).toBe(true)
    const long = move(longBoard, { x: 8, y: 4 }, { x: 16, y: 4 })
    expect(at(long, 8, 4)).toBe(0)
    expect(at(long, 12, 4)).toBe(2)
    expect(at(long, 16, 4)).toBe(1)
  })

  it('allows chain jumps to a far hole in one turn', () => {
    const board = custom([
      [8, 4, 1],
      [10, 4, 2],
      [14, 4, 2],
    ])
    expect(hasPos(destinations(board, { x: 8, y: 4 }), 16, 4)).toBe(true)
    const hopped = move(board, { x: 8, y: 4 }, { x: 16, y: 4 })
    expect(at(hopped, 16, 4)).toBe(1)
    expect(at(hopped, 10, 4)).toBe(2)
    expect(at(hopped, 14, 4)).toBe(2)
  })

  it('wins when all ten pieces occupy the opposite camp', () => {
    const last = { x: 9, y: 13 }
    const rest = HOME[2].filter((cell) => cell.x !== last.x || cell.y !== last.y)
    const ready = custom([
      ...rest.map((cell) => [cell.x, cell.y, 1] as [number, number, Player]),
      [8, 12, 1],
      ...HOME[1].map((cell) => [cell.x, cell.y, 2] as [number, number, Player]),
    ])
    expect(hasPos(destinations(ready, { x: 8, y: 12 }), last.x, last.y)).toBe(true)
    const won = move(ready, { x: 8, y: 12 }, last)
    expect(won.winner).toBe(1)
    expect(won.turn).toBe(1)
    expect(move(won, last, { x: 8, y: 12 })).toBe(won)
  })
})

describe('undo', () => {
  it('restores the previous board and turn', () => {
    const after = move(createGame(), { x: 9, y: 3 }, { x: 8, y: 4 })
    const undone = undo(after)
    expect(at(undone, 9, 3)).toBe(1)
    expect(at(undone, 8, 4)).toBe(0)
    expect(undone.turn).toBe(1)
    expect(undone.moves).toEqual([])
  })

  it('does nothing on an opening position', () => {
    const start = createGame()
    expect(undo(start)).toBe(start)
  })
})
