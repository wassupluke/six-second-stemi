import { describe, it, expect } from 'vitest'
import { NURSING } from '../../data/nursing'
import { DIAGNOSES, DIAGNOSIS_IDS } from '../../data/diagnoses'

describe('nursing considerations data', () => {
  it('covers every STEMI territory', () => {
    const stemiIds = DIAGNOSES.filter(d => d.isStemi).map(d => d.id)
    for (const id of stemiIds) {
      expect(NURSING[id], `missing nursing entry for ${id}`).toBeDefined()
    }
  })

  it('has no entry for no-stemi', () => {
    expect(NURSING['no-stemi']).toBeUndefined()
  })

  it('keys only valid diagnosis ids', () => {
    for (const id of Object.keys(NURSING)) {
      expect(DIAGNOSIS_IDS).toContain(id)
    }
  })

  it('each entry has non-empty watch and hemodynamics string lists', () => {
    for (const [id, entry] of Object.entries(NURSING)) {
      expect(entry.watch.length, `${id} watch empty`).toBeGreaterThan(0)
      expect(entry.hemodynamics.length, `${id} hemodynamics empty`).toBeGreaterThan(0)
      for (const s of [...entry.watch, ...entry.hemodynamics]) {
        expect(typeof s).toBe('string')
        expect(s.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
