import { useLayoutEffect, useRef, useState } from 'react'

// Measured border-box width of the element the returned ref is attached to.
// Starts at 0 on first paint, then tracks resizes, so consumers can size
// content to the real rendered width instead of hard-coding a guess.
// Border-box (not content-box) because grid cells tile at their outer width:
// column k's left edge sits at exactly k × this width, which is what the
// column phase offset in Lead.jsx needs. For tile sizing it errs a hair
// large (border included), which is the safe direction.
export function useContainerWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.getBoundingClientRect().width)
    measure()
    if (typeof ResizeObserver === 'undefined') return // jsdom
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}
