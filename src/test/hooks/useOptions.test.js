import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOptions } from '../../hooks/useOptions'

beforeEach(() => localStorage.clear())

describe('useOptions', () => {
  it('starts from defaults', () => {
    const { result } = renderHook(() => useOptions())
    expect(result.current.options).toEqual({
      gameMinutes: 5, display: 'dynamic', grid: true, volume: 0.6, muted: false,
    })
  })
  it('setOption updates and persists', () => {
    const { result } = renderHook(() => useOptions())
    act(() => result.current.setOption('display', 'static'))
    expect(result.current.options.display).toBe('static')
    expect(JSON.parse(localStorage.getItem('stemi-options')).display).toBe('static')
  })
  it('hydrates from existing storage', () => {
    localStorage.setItem('stemi-options', JSON.stringify({ gameMinutes: 3 }))
    const { result } = renderHook(() => useOptions())
    expect(result.current.options.gameMinutes).toBe(3)
    expect(result.current.options.grid).toBe(true) // merged with defaults
  })
})
