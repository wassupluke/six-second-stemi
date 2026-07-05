import { useState, useCallback } from 'react'

const KEY = 'stemi-options'
const DEFAULTS = { gameMinutes: 5, display: 'dynamic', grid: true, volume: 0.6, muted: false }

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function useOptions() {
  const [options, setOptions] = useState(read)
  const setOption = useCallback((key, value) => {
    setOptions(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])
  return { options, setOption }
}
