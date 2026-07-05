import { describe, it, expect } from 'vitest'
import { CASES, getDeck } from '../../data/cases'
import { DIAGNOSIS_IDS } from '../../data/diagnoses'

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
