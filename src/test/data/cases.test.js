import { describe, it, expect } from 'vitest'
import { CASES, getDeck, rollBpm, assertValidCase } from '../../data/cases'
import { DIAGNOSIS_IDS } from '../../data/diagnoses'
import { MAX_BPM } from '../../waveform/beat'

describe('cases', () => {
  it('every case references a valid diagnosis and has required fields', () => {
    for (const c of CASES) {
      expect(DIAGNOSIS_IDS).toContain(c.diagnosis)
      expect(Array.isArray(c.bpm)).toBe(true)
      expect(c.bpm).toHaveLength(2)
      expect(c.bpm.every(Number.isInteger)).toBe(true)
      expect(c.explanation.length).toBeGreaterThan(0)
      expect(['classic', 'subtle']).toContain(c.difficulty)
      expect(Array.isArray(c.leads_affected)).toBe(true)
    }
  })
  it('every case bpm range is within the fold-back-safe range (0, MAX_BPM]', () => {
    expect(MAX_BPM).toBeGreaterThan(0)
    for (const c of CASES) {
      const [min, max] = c.bpm
      expect(min).toBeGreaterThan(0)
      expect(min).toBeLessThanOrEqual(max)
      expect(max).toBeLessThanOrEqual(MAX_BPM)
    }
  })
  it('covers all 8 diagnoses at least once', () => {
    const covered = new Set(CASES.map(c => c.diagnosis))
    for (const id of DIAGNOSIS_IDS) expect(covered.has(id)).toBe(true)
  })
  it('novice deck is classic-only; practitioner deck includes everything', () => {
    const nov = getDeck('novice')
    expect(nov.every(c => c.difficulty === 'classic')).toBe(true)
    expect(getDeck('practitioner').length).toBe(CASES.length)
    expect(nov.length).toBeGreaterThan(0)
  })
})

describe('rollBpm', () => {
  const c = { bpm: [60, 105] }
  it('returns min when rng is 0', () => {
    expect(rollBpm(c, () => 0)).toBe(60)
  })
  it('returns max when rng approaches 1 (inclusive upper bound)', () => {
    expect(rollBpm(c, () => 0.999999)).toBe(105)
  })
  it('returns an integer within the range across the rng domain', () => {
    for (const r of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.999999]) {
      const v = rollBpm(c, () => r)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(60)
      expect(v).toBeLessThanOrEqual(105)
    }
  })
  it('handles a degenerate single-value range', () => {
    expect(rollBpm({ bpm: [72, 72] }, () => 0.5)).toBe(72)
  })
  it('defaults rng to Math.random', () => {
    const v = rollBpm(c)
    expect(Number.isInteger(v)).toBe(true)
    expect(v).toBeGreaterThanOrEqual(60)
    expect(v).toBeLessThanOrEqual(105)
  })
})

describe('assertValidCase bpm range validation', () => {
  const base = { id: 'x', diagnosis: 'anterior', bpm: [60, 100] }
  it('accepts a valid range', () => {
    expect(() => assertValidCase(base)).not.toThrow()
  })
  it('rejects a plain number bpm', () => {
    expect(() => assertValidCase({ ...base, bpm: 68 })).toThrow(/invalid bpm range/)
  })
  it('rejects wrong array length', () => {
    expect(() => assertValidCase({ ...base, bpm: [60] })).toThrow(/invalid bpm range/)
  })
  it('rejects non-integer bounds', () => {
    expect(() => assertValidCase({ ...base, bpm: [60.5, 100] })).toThrow(/invalid bpm range/)
  })
  it('rejects min > max', () => {
    expect(() => assertValidCase({ ...base, bpm: [100, 60] })).toThrow(/invalid bpm range/)
  })
  it('rejects min of 0 or below', () => {
    expect(() => assertValidCase({ ...base, bpm: [0, 60] })).toThrow(/invalid bpm range/)
  })
  it('rejects max above MAX_BPM', () => {
    expect(() => assertValidCase({ ...base, bpm: [60, MAX_BPM + 1] })).toThrow(/invalid bpm range/)
  })
})
