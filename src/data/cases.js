import raw from './cases.json'
import { DIAGNOSIS_IDS } from './diagnoses'
import { MAX_BPM } from '../waveform/beat'

export const CASES = raw.map(c => {
  if (!DIAGNOSIS_IDS.includes(c.diagnosis)) {
    throw new Error(`case ${c.id} has unknown diagnosis "${c.diagnosis}"`)
  }
  if (!(c.bpm > 0 && c.bpm <= MAX_BPM)) {
    throw new Error(`case ${c.id} has bpm ${c.bpm} outside (0, ${MAX_BPM}] — the waveform would fold back`)
  }
  return c
})

export function getDeck(difficulty) {
  if (difficulty === 'novice') return CASES.filter(c => c.difficulty === 'classic')
  return CASES.slice()
}
