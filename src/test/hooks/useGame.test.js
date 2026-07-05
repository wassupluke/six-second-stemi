import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGame } from '../../hooks/useGame'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function setup(opts = {}) {
  const onGrade = vi.fn()
  const hook = renderHook(() => useGame({ gameMinutes: 1, onGrade, ...opts }))
  return { ...hook, onGrade }
}

describe('useGame', () => {
  it('starts idle', () => {
    const { result } = setup()
    expect(result.current.phase).toBe('idle')
    expect(result.current.currentCase).toBeNull()
  })
  it('start(novice) enters playing with a case and full timer', () => {
    const { result } = setup()
    act(() => result.current.start('novice'))
    expect(result.current.phase).toBe('playing')
    expect(result.current.currentCase).not.toBeNull()
    expect(result.current.timerRemaining).toBe(60)
    expect(result.current.chancesLeft).toBe(3) // novice
  })
  it('practitioner gets 1 chance', () => {
    const { result } = setup()
    act(() => result.current.start('practitioner'))
    expect(result.current.chancesLeft).toBe(1)
  })
  it('correct answer grades, freezes, and increments counters', () => {
    const { result, onGrade } = setup()
    act(() => result.current.start('novice'))
    const dx = result.current.currentCase.diagnosis
    act(() => result.current.answer(dx))
    expect(result.current.phase).toBe('answered')
    expect(result.current.lastResult).toEqual({ correct: true, selected: dx })
    expect(result.current.counters).toEqual({ cases: 1, correct: 1, attempts: 1 })
    expect(onGrade).toHaveBeenCalledTimes(1)
  })
  it('wrong answers decrement chances; exhaustion reveals + grades once', () => {
    const { result, onGrade } = setup()
    act(() => result.current.start('novice'))
    const wrong = result.current.currentCase.diagnosis === 'inferior' ? 'anterior' : 'inferior'
    act(() => result.current.answer(wrong)) // 3 -> 2, still playing
    expect(result.current.phase).toBe('playing')
    expect(result.current.chancesLeft).toBe(2)
    act(() => result.current.answer(wrong)) // 2 -> 1
    act(() => result.current.answer(wrong)) // 1 -> 0 -> answered
    expect(result.current.phase).toBe('answered')
    expect(result.current.lastResult.correct).toBe(false)
    expect(result.current.counters).toEqual({ cases: 1, correct: 0, attempts: 3 })
    expect(onGrade).toHaveBeenCalledTimes(1)
  })
  it('timer counts down and reaching 0 ends the game', () => {
    const { result } = setup()
    act(() => result.current.start('novice'))
    act(() => vi.advanceTimersByTime(60000))
    expect(result.current.timerRemaining).toBe(0)
    expect(result.current.phase).toBe('gameover')
  })
  it('reset returns to idle', () => {
    const { result } = setup()
    act(() => result.current.start('novice'))
    act(() => result.current.reset())
    expect(result.current.phase).toBe('idle')
  })
})
