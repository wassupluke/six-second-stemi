import raw from './cases.json'
import { DIAGNOSIS_IDS } from './diagnoses'

export const CASES = raw.map(c => {
  if (!DIAGNOSIS_IDS.includes(c.diagnosis)) {
    throw new Error(`case ${c.id} has unknown diagnosis "${c.diagnosis}"`)
  }
  return c
})

export function getDeck(difficulty) {
  if (difficulty === 'novice') return CASES.filter(c => c.difficulty === 'classic')
  return CASES.slice()
}
