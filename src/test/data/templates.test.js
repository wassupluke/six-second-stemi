import { describe, it, expect } from 'vitest'
import { LEADS, NORMAL_LEADS, DIAGNOSIS_TEMPLATES } from '../../data/templates'
import { leadMorphology, synthLead } from '../../waveform/synth'
import { CASES } from '../../data/cases'
import { leadPoints } from '../../waveform/lead'

describe('templates', () => {
  it('defines all 12 leads in grid order', () => {
    expect(LEADS).toEqual(['I','aVR','V1','V4','II','aVL','V2','V5','III','aVF','V3','V6'])
    for (const l of LEADS) expect(NORMAL_LEADS[l]).toBeDefined()
  })
  it('aVR normal QRS is net negative (R < |S|-ish)', () => {
    expect(NORMAL_LEADS.aVR.r).toBeLessThan(1)
  })
  it('inferior template elevates II/III/aVF and depresses I/aVL', () => {
    const t = DIAGNOSIS_TEMPLATES.inferior
    expect(t.II.st).toBeGreaterThan(0)
    expect(t.III.st).toBeGreaterThan(0)
    expect(t.aVF.st).toBeGreaterThan(0)
    expect(t.aVL.st).toBeLessThan(0)
  })
  it('no-stemi template has no ST offset anywhere', () => {
    const t = DIAGNOSIS_TEMPLATES['no-stemi'] || {}
    for (const l of LEADS) expect((t[l]?.st) ?? 0).toBe(0)
  })
})

describe('leadMorphology + synthLead', () => {
  it('merges diagnosis ST onto normal morphology', () => {
    const m = leadMorphology('inferior', 'II')
    expect(m.st).toBeGreaterThan(0)
    expect(m.r).toBe(NORMAL_LEADS.II.r)
  })
  it('synthLead returns a non-empty path and positive width', () => {
    const out = synthLead({ diagnosis: 'anterior', bpm: 80 }, 'V2', { baselineY: 40, beats: 4 })
    expect(out.d.startsWith('M')).toBe(true)
    expect(out.width).toBeGreaterThan(0)
  })
  it('every case lead stays within the 220px coordinate box (no clipping)', () => {
    const COORD_H = 220, baselineY = 110
    for (const c of CASES) {
      for (const lead of LEADS) {
        const morph = leadMorphology(c.diagnosis, lead)
        const { points } = leadPoints(morph, { bpm: c.bpm, baselineY, beats: 4 })
        for (const [, y] of points) {
          expect(y).toBeGreaterThanOrEqual(0)
          expect(y).toBeLessThanOrEqual(COORD_H)
        }
      }
    }
  })
})
