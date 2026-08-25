import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SIZE, createGame, place, undo, type GameState } from '../gomoku/engine.ts'
import { loadGame, saveGame } from '../gomoku/persist.ts'

const INDEXES = Array.from({ length: SIZE }, (_, i) => i)
const STAR_POINTS = [
  [3, 3],
  [3, 11],
  [7, 7],
  [11, 3],
  [11, 11],
] as const
const BOARD_PAD = 0.75
const VIEW = 14 + BOARD_PAD * 2

export default function GomokuPage() {
  const [state, setState] = useState<GameState>(loadGame)

  function apply(mutator: (current: GameState) => GameState) {
    setState((current) => {
      const next = mutator(current)
      if (next !== current) saveGame(next)
      return next
    })
  }

  const status = state.winner
    ? state.winner === 1
      ? '黑棋胜'
      : '白棋胜'
    : state.turn === 1
      ? '黑棋下'
      : '白棋下'

  const last = state.moves[state.moves.length - 1]
  const winEnds = state.winningLine
    ? [...state.winningLine].sort((a, b) => a.r - b.r || a.c - b.c)
    : null

  return (
    <main className="gomoku">
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
              viewBox={`${-BOARD_PAD} ${-BOARD_PAD} ${VIEW} ${VIEW}`}
              role="img"
              aria-label="五子棋棋盘，十五路"
            >
              {INDEXES.map((i) => (
                <g key={i}>
                  <line className="grid-line" x1={0} y1={i} x2={14} y2={i} />
                  <line className="grid-line" x1={i} y1={0} x2={i} y2={14} />
                </g>
              ))}
              {STAR_POINTS.map(([r, c]) => (
                <circle key={`${r}-${c}`} className="star" cx={c} cy={r} r={0.1} />
              ))}
              {winEnds && winEnds.length >= 2 ? (
                <line
                  className="win-line"
                  x1={winEnds[0].c}
                  y1={winEnds[0].r}
                  x2={winEnds[winEnds.length - 1].c}
                  y2={winEnds[winEnds.length - 1].r}
                />
              ) : null}
              {INDEXES.flatMap((r) =>
                INDEXES.map((c) => {
                  const cell = state.board[r][c]
                  if (cell === 0) return null
                  return (
                    <circle
                      key={`stone-${r}-${c}`}
                      className={cell === 1 ? 'stone black' : 'stone white'}
                      cx={c}
                      cy={r}
                      r={0.42}
                    />
                  )
                }),
              )}
              {last ? <circle className="last-mark" cx={last.c} cy={last.r} r={0.1} /> : null}
            </svg>
            <div className="hit-layer">
              {INDEXES.flatMap((r) =>
                INDEXES.map((c) => (
                  <button
                    key={`hit-${r}-${c}`}
                    type="button"
                    className="hit-cell"
                    aria-label={`落子 ${r + 1}路 ${c + 1}`}
                    tabIndex={-1}
                    style={{
                      left: `${((c + BOARD_PAD) / VIEW) * 100}%`,
                      top: `${((r + BOARD_PAD) / VIEW) * 100}%`,
                    }}
                    onClick={() => apply((current) => place(current, r, c))}
                  />
                )),
              )}
            </div>
          </div>
        </div>

        <aside className="gomoku-panel">
          <p className="hint">棋子落在交叉点上。最后一手有红点；五连会画出连线。</p>
          <div className="actions">
            <button type="button" disabled={state.moves.length === 0} onClick={() => apply(undo)}>
              悔棋
            </button>
            <button type="button" onClick={() => apply(() => createGame())}>
              重新开始
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
