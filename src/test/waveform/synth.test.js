import { describe, it, expect } from 'vitest'
import { synthLead } from '../../waveform/synth'
import { beatWidthPx } from '../../waveform/beat'

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
