import { describe, it, expect } from 'vitest'
import { ECG, beatPoints } from '../../waveform/beat'

const opts = { bpm: 60, baselineY: 50 }

describe('beatPoints', () => {
  it('spans exactly one RR interval in width', () => {
    const pts = beatPoints({ r: 10 }, opts)
    const width = (60 / opts.bpm) * ECG.MM_PER_SEC * ECG.PX_PER_MM // 100px at 60bpm
    expect(pts[0][0]).toBe(0)
    expect(pts[pts.length - 1][0]).toBeCloseTo(width, 5)
  })
  it('starts and ends on the baseline (seamless)', () => {
    const pts = beatPoints({ r: 12, st: 3, t: 4 }, opts)
    expect(pts[0][1]).toBe(opts.baselineY)
    expect(pts[pts.length - 1][1]).toBeCloseTo(opts.baselineY, 5)
  })
  it('R wave rises above baseline (smaller y)', () => {
    const pts = beatPoints({ r: 10 }, opts)
    const minY = Math.min(...pts.map(p => p[1]))
    expect(minY).toBeLessThan(opts.baselineY - 10 * ECG.PX_PER_MM * 0.9)
  })
  it('ST elevation lifts the J/ST region above baseline', () => {
    const flat = beatPoints({ r: 8, st: 0 }, opts)
    const elev = beatPoints({ r: 8, st: 3 }, opts)
    // Sample the ST plateau region (just after QRS). Compare mean y there.
    const region = arr => arr.filter(p => p[0] > 40 && p[0] < 55).map(p => p[1])
    const mean = ys => ys.reduce((a, b) => a + b, 0) / ys.length
    expect(mean(region(elev))).toBeLessThan(mean(region(flat)))
  })
})
