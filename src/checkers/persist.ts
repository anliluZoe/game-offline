import { CELLS, createGame, key, type GameState, type Move, type Pos } from './engine.ts'

const KEY = 'checkers-v1'

type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function saveGame(state: GameState, storage: StorageLike = localStorage) {
  try {
    storage.setItem(KEY, JSON.stringify({ version: 1, ...state }))
  } catch {
    /* privacy mode / quota: keep playing without persist */
  }
}

export function loadGame(storage: StorageLike = localStorage): GameState {
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return createGame()
    const data: unknown = JSON.parse(raw)
    if (!isSavedGame(data)) return createGame()
    return {
      board: data.board,
      turn: data.turn,
      moves: data.moves,
      winner: data.winner,
    }
  } catch {
    return createGame()
  }
}

function isSavedGame(data: unknown): data is GameState & { version: 1 } {
  if (typeof data !== 'object' || data === null) return false
  const record = data as Record<string, unknown>
  if (record.version !== 1) return false
  if (typeof record.board !== 'object' || record.board === null) return false
  const board = record.board as Record<string, unknown>
  if (Object.keys(board).length !== CELLS.length) return false
  for (const cell of CELLS) {
    const value = board[key(cell)]
    if (value !== 0 && value !== 1 && value !== 2) return false
  }
  if (record.turn !== 1 && record.turn !== 2) return false
  if (!Array.isArray(record.moves) || !record.moves.every(isMove)) return false
  if (record.winner !== null && record.winner !== 1 && record.winner !== 2) return false
  return true
}

function isMove(value: unknown): value is Move {
  if (typeof value !== 'object' || value === null) return false
  const move = value as Record<string, unknown>
  return isPos(move.from) && isPos(move.to)
}

function isPos(value: unknown): value is Pos {
  if (typeof value !== 'object' || value === null) return false
  const pos = value as Record<string, unknown>
  return typeof pos.x === 'number' && typeof pos.y === 'number' && Number.isInteger(pos.x) && Number.isInteger(pos.y)
}
