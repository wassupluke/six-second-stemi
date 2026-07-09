import raw from './cases.json'
import { DIAGNOSIS_IDS } from './diagnoses'
import { MAX_BPM } from '../waveform/beat'

// Throws on any authoring error so a bad case fails the build/tests loudly
// at import time. Exported so the throw paths are unit-testable.
export function assertValidCase(c) {
  if (!DIAGNOSIS_IDS.includes(c.diagnosis)) {
    throw new Error(`case ${c.id} has unknown diagnosis "${c.diagnosis}"`)
  }
  if (!Array.isArray(c.bpm) || c.bpm.length !== 2 || !c.bpm.every(Number.isInteger)
      || !(c.bpm[0] > 0 && c.bpm[0] <= c.bpm[1] && c.bpm[1] <= MAX_BPM)) {
    throw new Error(`case ${c.id} has invalid bpm range ${JSON.stringify(c.bpm)} — need integers 0 < min <= max <= ${MAX_BPM} or the waveform would fold back`)
  }
}

export const CASES = raw.map(c => { assertValidCase(c); return c })

export function getDeck(difficulty) {
  if (difficulty === 'novice') return CASES.filter(c => c.difficulty === 'classic')
  return CASES.slice()
}

// Sample an integer heart rate uniformly from the case's inclusive
// [min, max] range. rng is injectable for deterministic tests.
export function rollBpm(caseObj, rng = Math.random) {
  const [min, max] = caseObj.bpm
  return min + Math.floor(rng() * (max - min + 1))
}
