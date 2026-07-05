import { describe, it, expect } from 'vitest'
import { CASES, getDeck } from '../../data/cases'
import { DIAGNOSIS_IDS } from '../../data/diagnoses'
import { MAX_BPM } from '../../waveform/beat'

describe('cases', () => {
  it('every case references a valid diagnosis and has required fields', () => {
    for (const c of CASES) {
      expect(DIAGNOSIS_IDS).toContain(c.diagnosis)
      expect(typeof c.bpm).toBe('number')
      expect(c.explanation.length).toBeGreaterThan(0)
      expect(['classic', 'subtle']).toContain(c.difficulty)
      expect(Array.isArray(c.leads_affected)).toBe(true)
    }
  })
  it('every case bpm is within the fold-back-safe range (0, MAX_BPM]', () => {
    expect(MAX_BPM).toBeGreaterThan(0)
    for (const c of CASES) {
      expect(c.bpm).toBeGreaterThan(0)
      expect(c.bpm).toBeLessThanOrEqual(MAX_BPM)
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
