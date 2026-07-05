import { useState, useCallback, useEffect } from 'react'

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
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(options)) } catch { /* ignore */ }
  }, [options])
  const setOption = useCallback((key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }, [])
  return { options, setOption }
}
