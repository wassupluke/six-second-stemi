import { describe, it, expect } from 'vitest'
import { DIAGNOSES, DIAGNOSIS_IDS, diagnosisById } from '../../data/diagnoses'

describe('diagnoses', () => {
  it('has exactly the 8 spec diagnoses in order', () => {
    expect(DIAGNOSIS_IDS).toEqual([
      'no-stemi', 'anterior', 'anteroseptal', 'anterolateral',
      'lateral', 'inferior', 'posterior', 'rv',
    ])
  })
  it('marks only no-stemi as non-STEMI', () => {
    expect(diagnosisById('no-stemi').isStemi).toBe(false)
    expect(diagnosisById('inferior').isStemi).toBe(true)
  })
  it('every entry has a human label', () => {
    for (const d of DIAGNOSES) expect(d.label.length).toBeGreaterThan(0)
  })
  it('returns undefined for unknown id', () => {
    expect(diagnosisById('nope')).toBeUndefined()
  })
})
