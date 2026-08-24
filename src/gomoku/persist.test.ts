import { describe, expect, it } from 'vitest'
import { createGame, place } from './engine.ts'
import { loadGame, saveGame } from './persist.ts'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem(key: string) {
      return Object.hasOwn(data, key) ? data[key] : null
    },
    setItem(key: string, value: string) {
      data[key] = value
    },
  }
}

describe('saveGame / loadGame', () => {
  it('restores a saved game', () => {
    const storage = memoryStorage()
    let state = place(createGame(), 7, 7)
    state = place(state, 7, 8)
    saveGame(state, storage)
    expect(loadGame(storage)).toEqual(state)
  })

  it('starts a new game when the save is missing, corrupt, or the wrong shape', () => {
    expect(loadGame(memoryStorage())).toEqual(createGame())
    expect(loadGame(memoryStorage({ 'gomoku-v1': '{not json' }))).toEqual(createGame())
    expect(loadGame(memoryStorage({ 'gomoku-v1': JSON.stringify({ version: 1 }) }))).toEqual(
      createGame(),
    )

    const badBoard = {
      version: 1,
      board: [[0]],
      turn: 1,
      moves: [],
      winner: null,
      winningLine: null,
    }
    expect(loadGame(memoryStorage({ 'gomoku-v1': JSON.stringify(badBoard) }))).toEqual(
      createGame(),
    )
  })

  it('does not throw when storage writes fail', () => {
    const storage = {
      getItem() {
        return null
      },
      setItem() {
        throw new Error('quota')
      },
    }
    expect(() => saveGame(createGame(), storage)).not.toThrow()
  })
})
