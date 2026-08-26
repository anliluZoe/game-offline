export type Player = 1 | 2
export type Cell = 0 | Player
export type Pos = { x: number; y: number }
export type Move = { from: Pos; to: Pos }

export type GameState = {
  board: Record<string, Cell>
  turn: Player
  moves: Move[]
  winner: Player | null
}

export const DIRS = [
  [2, 0],
  [-2, 0],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
] as const

export const CELLS: Pos[] = []
for (let y = 0; y < 17; y++) {
  let count: number
  let start: number
  if (y <= 3) {
    count = y + 1
    start = 12 - y
  } else if (y >= 13) {
    count = 17 - y
    start = y - 4
  } else {
    const dist = Math.min(y - 4, 12 - y)
    count = 13 - dist
    start = dist
  }
  for (let i = 0; i < count; i++) {
    CELLS.push({ x: start + i * 2, y })
  }
}

export const HOME: Record<Player, Pos[]> = {
  1: CELLS.filter((cell) => cell.y <= 3),
  2: CELLS.filter((cell) => cell.y >= 13),
}

const GOAL: Record<Player, Pos[]> = {
  1: HOME[2],
  2: HOME[1],
}

const CELL_SET = new Set(CELLS.map(key))

export function key(pos: Pos) {
  return `${pos.x},${pos.y}`
}

export function createGame(): GameState {
  const board: Record<string, Cell> = {}
  for (const cell of CELLS) board[key(cell)] = 0
  for (const cell of HOME[1]) board[key(cell)] = 1
  for (const cell of HOME[2]) board[key(cell)] = 2
  return { board, turn: 1, moves: [], winner: null }
}

export function destinations(state: GameState, from: Pos): Pos[] {
  if (state.winner) return []
  if (state.board[key(from)] !== state.turn) return []

  const result: Pos[] = []
  for (const [dx, dy] of DIRS) {
    const next = { x: from.x + dx, y: from.y + dy }
    if (CELL_SET.has(key(next)) && state.board[key(next)] === 0) result.push(next)
  }

  const seen = new Set<string>([key(from)])
  const queue = [from]
  while (queue.length > 0) {
    const current = queue.pop()!
    for (const [dx, dy] of DIRS) {
      const landing = jumpLanding(state.board, current, dx, dy, from)
      if (!landing) continue
      const landingKey = key(landing)
      if (seen.has(landingKey)) continue
      seen.add(landingKey)
      result.push(landing)
      queue.push(landing)
    }
  }
  return result
}

export function move(state: GameState, from: Pos, to: Pos): GameState {
  const dests = destinations(state, from)
  if (!dests.some((pos) => pos.x === to.x && pos.y === to.y)) return state

  const board = { ...state.board }
  board[key(from)] = 0
  board[key(to)] = state.turn

  const won = GOAL[state.turn].every((cell) => board[key(cell)] === state.turn)
  return {
    board,
    turn: won ? state.turn : state.turn === 1 ? 2 : 1,
    moves: [...state.moves, { from, to }],
    winner: won ? state.turn : null,
  }
}

export function undo(state: GameState): GameState {
  if (state.moves.length === 0) return state
  const remaining = state.moves.slice(0, -1)
  let next = createGame()
  for (const step of remaining) {
    next = move(next, step.from, step.to)
  }
  return next
}

function jumpLanding(
  board: Record<string, Cell>,
  from: Pos,
  dx: number,
  dy: number,
  origin: Pos,
): Pos | null {
  const originKey = key(origin)
  let x = from.x + dx
  let y = from.y + dy
  let steps = 1
  while (CELL_SET.has(key({ x, y })) && occupancy(board, x, y, originKey) === 0) {
    x += dx
    y += dy
    steps += 1
  }
  if (!CELL_SET.has(key({ x, y })) || occupancy(board, x, y, originKey) === 0) return null

  for (let i = 1; i <= steps; i++) {
    x += dx
    y += dy
    if (!CELL_SET.has(key({ x, y }))) return null
    if (i < steps && occupancy(board, x, y, originKey) !== 0) return null
  }
  if (occupancy(board, x, y, originKey) !== 0) return null
  return { x, y }
}

function occupancy(board: Record<string, Cell>, x: number, y: number, originKey: string): Cell {
  const cellKey = `${x},${y}`
  if (cellKey === originKey) return 0
  return board[cellKey] ?? 0
}
