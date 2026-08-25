import { createGame, SIZE, type GameState } from './engine.ts'

const KEY = 'gomoku-v1'

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
      winningLine: data.winningLine,
    }
  } catch {
    return createGame()
  }
}

function isSavedGame(data: unknown): data is GameState & { version: 1 } {
  if (typeof data !== 'object' || data === null) return false
  const record = data as Record<string, unknown>
  if (record.version !== 1) return false
  if (!Array.isArray(record.board) || record.board.length !== SIZE) return false
  if (
    !record.board.every(
      (row) =>
        Array.isArray(row) &&
        row.length === SIZE &&
        row.every((cell) => cell === 0 || cell === 1 || cell === 2),
    )
  ) {
    return false
  }
  if (record.turn !== 1 && record.turn !== 2) return false
  if (!Array.isArray(record.moves) || !record.moves.every(isPoint)) return false
  if (record.winner !== null && record.winner !== 1 && record.winner !== 2) return false
  if (
    record.winningLine !== null &&
    !(Array.isArray(record.winningLine) && record.winningLine.every(isPoint))
  ) {
    return false
  }
  return true
}

function isPoint(value: unknown) {
  if (typeof value !== 'object' || value === null) return false
  const point = value as Record<string, unknown>
  return isIndex(point.r) && isIndex(point.c)
}

function isIndex(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < SIZE
}
