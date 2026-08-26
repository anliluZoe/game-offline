import { describe, expect, it } from 'vitest'
import { createGame, move } from './engine.ts'
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
  it('restores a saved checkers game', () => {
    const storage = memoryStorage()
    const state = move(createGame(), { x: 9, y: 3 }, { x: 8, y: 4 })
    saveGame(state, storage)
    expect(loadGame(storage)).toEqual(state)
  })

  it('starts a new game when the save is missing, corrupt, or the wrong shape', () => {
    expect(loadGame(memoryStorage())).toEqual(createGame())
    expect(loadGame(memoryStorage({ 'checkers-v1': '{not json' }))).toEqual(createGame())
    expect(loadGame(memoryStorage({ 'checkers-v1': JSON.stringify({ version: 1 }) }))).toEqual(
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
