import { describe, it, expect } from 'vitest'
import { synthLead, leadMorphology } from '../../waveform/synth'
import { leadPoints } from '../../waveform/lead'
import { beatWidthPx, PAPER_SPEED_PX_PER_SEC } from '../../waveform/beat'

const c = { diagnosis: 'anterior', bpm: 80 }
const baselineY = 110

describe('synthLead beat-count derivation', () => {
  it('emits enough whole beats to cover minWidthPx', () => {
    const bw = beatWidthPx(c.bpm)
    const { width } = synthLead(c, 'V2', { baselineY, minWidthPx: 900 })
    const beats = Math.max(4, Math.ceil(900 / bw))
    expect(width).toBeGreaterThanOrEqual(900)
    expect(width).toBeCloseTo(beats * bw, 5)
  })
  it('covers minWidthPx across the full bpm range', () => {
    for (const bpm of [40, 60, 72, 96, 114]) {
      const { width } = synthLead({ ...c, bpm }, 'II', { baselineY, minWidthPx: 768 })
      expect(width).toBeGreaterThanOrEqual(768)
    }
  })
  it('floors at 4 beats when minWidthPx is small', () => {
    const bw = beatWidthPx(c.bpm)
    const { width } = synthLead(c, 'V2', { baselineY, minWidthPx: 0 })
    expect(width).toBeCloseTo(4 * bw, 5)
  })
  it('throws on invalid bpm instead of emitting a frozen trace', () => {
    expect(() => synthLead({ diagnosis: 'anterior', bpm: 0 }, 'V2', { baselineY, minWidthPx: 300 })).toThrow(/bpm/)
    expect(() => synthLead({ diagnosis: 'anterior' }, 'V2', { baselineY, minWidthPx: 300 })).toThrow(/bpm/)
  })
  it('throws on missing minWidthPx instead of emitting an empty tile', () => {
    expect(() => synthLead(c, 'V2', { baselineY })).toThrow(/minWidthPx/)
  })
})

describe('R-R interval', () => {
  it('spaces R peaks exactly (60/bpm) x paper speed apart at every heart rate', () => {
    for (const bpm of [40, 58, 72, 96, 114]) {
      const morph = leadMorphology('no-stemi', 'II') // tall positive R: the tile minimum y IS the R peak
      const beats = 6
      const { points } = leadPoints(morph, { bpm, baselineY, beats })
      const minY = Math.min(...points.map(p => p[1]))
      const rXs = points.filter(p => p[1] === minY).map(p => p[0])
      expect(rXs.length).toBe(beats)
      const rr = beatWidthPx(bpm)
      for (let i = 1; i < rXs.length; i++) {
        expect(rXs[i] - rXs[i - 1]).toBeCloseTo(rr, 6)
      }
      // Scrolling at paper speed, that spacing is exactly 60/bpm seconds per beat.
      expect(rr / PAPER_SPEED_PX_PER_SEC).toBeCloseTo(60 / bpm, 9)
    }
  })
})
