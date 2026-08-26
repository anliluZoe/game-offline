import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CELLS,
  DIRS,
  HOME,
  createGame,
  destinations,
  key,
  move,
  undo,
  type GameState,
  type Pos,
} from '../checkers/engine.ts'
import { loadGame, saveGame } from '../checkers/persist.ts'

const X_SCALE = 0.5
const Y_SCALE = Math.sqrt(3) / 2
const PAD = 0.7
const VIEW_W = 24 * X_SCALE + PAD * 2
const VIEW_H = 16 * Y_SCALE + PAD * 2
const CELL_KEYS = new Set(CELLS.map(key))
const EDGES: Array<[Pos, Pos]> = []
for (const cell of CELLS) {
  for (const [dx, dy] of DIRS) {
    const next = { x: cell.x + dx, y: cell.y + dy }
    if (!CELL_KEYS.has(key(next))) continue
    if (key(cell) < key(next)) EDGES.push([cell, next])
  }
}
const HOME_KEYS = {
  1: new Set(HOME[1].map(key)),
  2: new Set(HOME[2].map(key)),
}

export default function CheckersPage() {
  const [state, setState] = useState<GameState>(loadGame)
  const [selected, setSelected] = useState<Pos | null>(null)

  function apply(mutator: (current: GameState) => GameState) {
    setState((current) => {
      const next = mutator(current)
      if (next !== current) saveGame(next)
      return next
    })
  }

  const dests = selected ? destinations(state, selected) : []
  const destKeys = new Set(dests.map(key))
  const last = state.moves[state.moves.length - 1]
  const status = state.winner
    ? state.winner === 1
      ? '红棋胜'
      : '绿棋胜'
    : state.turn === 1
      ? '红棋下'
      : '绿棋下'

  return (
    <main className="checkers">
      <header className="gomoku-bar">
        <Link className="back" to="/">
          ← 大厅
        </Link>
        <p className="status" aria-live="polite">
          {status}
        </p>
      </header>

      <div className="gomoku-layout">
        <div className="board-frame">
          <div className="board-stack">
            <svg
              className="board"
              viewBox={`${-PAD} ${-PAD} ${VIEW_W} ${VIEW_H}`}
              role="img"
              aria-label="中式跳棋棋盘"
            >
              <defs>
                <radialGradient id="marbleRedGrad" cx="36%" cy="32%" r="70%">
                  <stop offset="0%" stopColor="#d96a5c" />
                  <stop offset="45%" stopColor="#b13c32" />
                  <stop offset="100%" stopColor="#7a211c" />
                </radialGradient>
                <radialGradient id="marbleGreenGrad" cx="36%" cy="32%" r="70%">
                  <stop offset="0%" stopColor="#6dae7a" />
                  <stop offset="45%" stopColor="#2f7a4a" />
                  <stop offset="100%" stopColor="#1b4d30" />
                </radialGradient>
              </defs>
              {EDGES.map(([a, b]) => (
                <line
                  key={`${key(a)}-${key(b)}`}
                  className="checkers-line"
                  x1={a.x * X_SCALE}
                  y1={a.y * Y_SCALE}
                  x2={b.x * X_SCALE}
                  y2={b.y * Y_SCALE}
                />
              ))}
              {CELLS.map((cell) => {
                const cellKey = key(cell)
                const occupant = state.board[cellKey]
                const isHomeRed = HOME_KEYS[1].has(cellKey)
                const isHomeGreen = HOME_KEYS[2].has(cellKey)
                const isSelected = selected !== null && selected.x === cell.x && selected.y === cell.y
                const isDest = destKeys.has(cellKey)
                const isLastTo = last && last.to.x === cell.x && last.to.y === cell.y
                return (
                  <g key={cellKey}>
                    <circle
                      className={
                        isHomeRed ? 'hole home-red' : isHomeGreen ? 'hole home-green' : 'hole'
                      }
                      cx={cell.x * X_SCALE}
                      cy={cell.y * Y_SCALE}
                      r={0.16}
                    />
                    {occupant !== 0 ? (
                      <circle
                        className={occupant === 1 ? 'marble red' : 'marble green'}
                        fill={occupant === 1 ? 'url(#marbleRedGrad)' : 'url(#marbleGreenGrad)'}
                        cx={cell.x * X_SCALE}
                        cy={cell.y * Y_SCALE}
                        r={0.28}
                      />
                    ) : null}
                    {isSelected ? (
                      <circle
                        className="selected-ring"
                        cx={cell.x * X_SCALE}
                        cy={cell.y * Y_SCALE}
                        r={0.34}
                      />
                    ) : null}
                    {isDest && occupant === 0 ? (
                      <circle
                        className="dest-mark"
                        cx={cell.x * X_SCALE}
                        cy={cell.y * Y_SCALE}
                        r={0.11}
                      />
                    ) : null}
                    {isLastTo ? (
                      <circle
                        className="last-mark"
                        cx={cell.x * X_SCALE}
                        cy={cell.y * Y_SCALE}
                        r={0.07}
                      />
                    ) : null}
                  </g>
                )
              })}
            </svg>
            <div className="hit-layer">
              {CELLS.map((cell) => (
                <button
                  key={`hit-${key(cell)}`}
                  type="button"
                  className="hit-cell"
                  aria-label={`棋点 ${cell.x},${cell.y}`}
                  tabIndex={-1}
                  style={{
                    left: `${((cell.x * X_SCALE + PAD) / VIEW_W) * 100}%`,
                    top: `${((cell.y * Y_SCALE + PAD) / VIEW_H) * 100}%`,
                  }}
                  onClick={() => {
                    if (selected && destKeys.has(key(cell))) {
                      apply((current) => move(current, selected, cell))
                      setSelected(null)
                      return
                    }
                    if (selected && selected.x === cell.x && selected.y === cell.y) {
                      setSelected(null)
                      return
                    }
                    if (state.board[key(cell)] === state.turn && !state.winner) {
                      setSelected(cell)
                      return
                    }
                    setSelected(null)
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="gomoku-panel">
          <p className="hint">
            红棋在上、绿棋在下。点己方棋子再点高亮点位：可走一步，也可隔子跳、长跳和连跳。全部进入对方营地即胜。
          </p>
          <div className="actions">
            <button
              type="button"
              disabled={state.moves.length === 0}
              onClick={() => {
                setSelected(null)
                apply(undo)
              }}
            >
              悔棋
            </button>
            <button
              type="button"
              onClick={() => {
                setSelected(null)
                apply(() => createGame())
              }}
            >
              重新开始
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
