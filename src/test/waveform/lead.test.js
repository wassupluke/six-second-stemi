import { describe, it, expect } from 'vitest'
import { leadPoints } from '../../waveform/lead'
import { pointsToPath } from '../../waveform/synth'

const opts = { bpm: 75, baselineY: 40, beats: 4 }

describe('leadPoints', () => {
  it('tiles an integer number of beats', () => {
    const { points, width, beatWidth } = leadPoints({ r: 10 }, opts)
    expect(width).toBeCloseTo(beatWidth * opts.beats, 5)
    expect(points[0][0]).toBe(0)
    expect(points[points.length - 1][0]).toBeCloseTo(width, 5)
  })
  it('is seamless: first and last y equal baseline', () => {
    const { points } = leadPoints({ r: 10, st: 3, t: 5 }, opts)
    expect(points[0][1]).toBe(opts.baselineY)
    expect(points[points.length - 1][1]).toBeCloseTo(opts.baselineY, 5)
  })
  it('x is monotonically non-decreasing', () => {
    const { points } = leadPoints({ r: 10 }, opts)
    for (let i = 1; i < points.length; i++) {
      expect(points[i][0]).toBeGreaterThanOrEqual(points[i - 1][0] - 1e-6)
    }
  })
})

describe('pointsToPath', () => {
  it('emits an M then L commands', () => {
    const d = pointsToPath([[0, 5], [10, 3], [20, 5]])
    expect(d).toBe('M0,5 L10,3 L20,5')
  })
})
