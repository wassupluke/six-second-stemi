import { useLayoutEffect, useRef, useState } from 'react'

// Measured content-box width of the element the returned ref is attached to.
// Starts at 0 on first paint, then tracks resizes, so consumers can size
// content to the real rendered width instead of hard-coding a guess.
export function useContainerWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    if (typeof ResizeObserver === 'undefined') return // jsdom
    const ro = new ResizeObserver(entries => setWidth(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}
