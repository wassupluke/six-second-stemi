import { ECG, beatPoints } from './beat'

export function leadPoints(morph, opts) {
  const { bpm, baselineY, beats = 4 } = opts
  const beatWidth = (60 / bpm) * ECG.MM_PER_SEC * ECG.PX_PER_MM
  const points = []
  for (let b = 0; b < beats; b++) {
    const bp = beatPoints(morph, { bpm, baselineY })
    const xOffset = b * beatWidth
    for (let i = 0; i < bp.length; i++) {
      // Drop the duplicate seam point (first of every beat after the first).
      if (b > 0 && i === 0) continue
      points.push([bp[i][0] + xOffset, bp[i][1]])
    }
  }
  return { points, width: beatWidth * beats, beatWidth }
}
