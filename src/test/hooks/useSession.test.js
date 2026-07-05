import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSession } from '../../hooks/useSession'

beforeEach(() => localStorage.clear())
const caseObj = { diagnosis: 'inferior' }

describe('useSession', () => {
  it('grades a correct answer and updates buckets', () => {
    const { result } = renderHook(() => useSession())
    let correct
    act(() => { correct = result.current.gradeAnswer(caseObj, 'inferior') })
    expect(correct).toBe(true)
    expect(result.current.sessionProgress).toEqual({ answered: 1, correct: 1 })
    expect(result.current.cumulativeStats.diagnosis.inferior).toEqual({ correct: 1, total: 1 })
  })
  it('grades an incorrect answer', () => {
    const { result } = renderHook(() => useSession())
    act(() => { result.current.gradeAnswer(caseObj, 'anterior') })
    expect(result.current.sessionProgress).toEqual({ answered: 1, correct: 0 })
    expect(result.current.cumulativeStats.diagnosis.inferior).toEqual({ correct: 0, total: 1 })
  })
  it('persists and resets', () => {
    const { result } = renderHook(() => useSession())
    act(() => { result.current.gradeAnswer(caseObj, 'inferior') })
    expect(JSON.parse(localStorage.getItem('stemi-cumulative-stats')).diagnosis.inferior.total).toBe(1)
    act(() => { result.current.resetStats() })
    expect(result.current.cumulativeStats.diagnosis).toEqual({})
  })
})
