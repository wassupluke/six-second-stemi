import { renderHook, act } from '@testing-library/react'
import { useSession } from '../../hooks/useSession'

const mockECG = { id: 'ecg-001', territory: 'inferior', vessel: 'RCA' }

beforeEach(() => {
  localStorage.clear()
})

test('initializes with empty stats', () => {
  const { result } = renderHook(() => useSession())
  expect(result.current.sessionProgress).toEqual({ answered: 0, correct: 0 })
  expect(result.current.cumulativeStats).toEqual({ territory: {}, vessel: {} })
})

test('gradeAnswer increments sessionProgress.answered', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'inferior', 'RCA') })
  expect(result.current.sessionProgress.answered).toBe(1)
})

test('gradeAnswer increments sessionProgress.correct when both right', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'inferior', 'RCA') })
  expect(result.current.sessionProgress.correct).toBe(1)
})

test('gradeAnswer does not increment sessionProgress.correct when wrong', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'anterior', 'LAD') })
  expect(result.current.sessionProgress.correct).toBe(0)
})

test('gradeAnswer updates cumulativeStats territory', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'inferior', 'RCA') })
  expect(result.current.cumulativeStats.territory.inferior).toEqual({ correct: 1, total: 1 })
})

test('gradeAnswer marks territory correct only when selection matches', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'anterior', 'RCA') })
  expect(result.current.cumulativeStats.territory.inferior).toEqual({ correct: 0, total: 1 })
})

test('gradeAnswer updates cumulativeStats vessel', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'inferior', 'RCA') })
  expect(result.current.cumulativeStats.vessel.RCA).toEqual({ correct: 1, total: 1 })
})

test('gradeAnswer persists cumulativeStats to localStorage', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'inferior', 'RCA') })
  const stored = JSON.parse(localStorage.getItem('stemi-cumulative-stats'))
  expect(stored.territory.inferior).toEqual({ correct: 1, total: 1 })
})

test('initializes cumulativeStats from existing localStorage', () => {
  localStorage.setItem('stemi-cumulative-stats', JSON.stringify({
    territory: { inferior: { correct: 3, total: 4 } },
    vessel: { RCA: { correct: 3, total: 4 } },
  }))
  const { result } = renderHook(() => useSession())
  expect(result.current.cumulativeStats.territory.inferior).toEqual({ correct: 3, total: 4 })
})

test('resetStats clears cumulativeStats', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'inferior', 'RCA') })
  act(() => { result.current.resetStats() })
  expect(result.current.cumulativeStats).toEqual({ territory: {}, vessel: {} })
})

test('resetStats clears localStorage', () => {
  const { result } = renderHook(() => useSession())
  act(() => { result.current.gradeAnswer(mockECG, 'inferior', 'RCA') })
  act(() => { result.current.resetStats() })
  expect(JSON.parse(localStorage.getItem('stemi-cumulative-stats'))).toEqual({ territory: {}, vessel: {} })
})
