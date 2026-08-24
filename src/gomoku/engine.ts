export const SIZE = 15

export type Cell = 0 | 1 | 2
export type Player = 1 | 2
export type Point = { r: number; c: number }

export type GameState = {
  board: Cell[][]
  turn: Player
  moves: Point[]
  winner: Player | null
  winningLine: Point[] | null
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const

export function createGame(): GameState {
  return {
    board: Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(0)),
    turn: 1,
    moves: [],
    winner: null,
    winningLine: null,
  }
}

export function place(state: GameState, r: number, c: number): GameState {
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return state
  if (state.winner) return state
  if (state.board[r][c] !== 0) return state

  const board = state.board.map((row) => row.slice()) as Cell[][]
  board[r][c] = state.turn

  let winningLine: Point[] | null = null
  for (const [dr, dc] of DIRECTIONS) {
    const line = collectLine(board, r, c, dr, dc, state.turn)
    if (line.length >= 5) {
      winningLine = line
      break
    }
  }

  return {
    board,
    turn: winningLine ? state.turn : state.turn === 1 ? 2 : 1,
    moves: [...state.moves, { r, c }],
    winner: winningLine ? state.turn : null,
    winningLine,
  }
}

export function undo(state: GameState): GameState {
  if (state.moves.length === 0) return state
  const remaining = state.moves.slice(0, -1)
  let next = createGame()
  for (const move of remaining) {
    next = place(next, move.r, move.c)
  }
  return next
}

function collectLine(
  board: Cell[][],
  r: number,
  c: number,
  dr: number,
  dc: number,
  player: Player,
): Point[] {
  const points: Point[] = [{ r, c }]
  for (const step of [1, -1]) {
    let nr = r + dr * step
    let nc = c + dc * step
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player) {
      points.push({ r: nr, c: nc })
      nr += dr * step
      nc += dc * step
    }
  }
  return points
}
