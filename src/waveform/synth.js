import { NORMAL_LEADS, DIAGNOSIS_TEMPLATES, R_BOOST } from '../data/templates'
import { leadPoints } from './lead'
import { beatWidthPx } from './beat'

export function pointsToPath(points) {
  if (points.length === 0) return ''
  const round = n => Math.round(n * 100) / 100
  const [x0, y0] = points[0]
  let d = `M${round(x0)},${round(y0)}`
  for (let i = 1; i < points.length; i++) {
    d += ` L${round(points[i][0])},${round(points[i][1])}`
  }
  return d
}

export function leadMorphology(diagnosisId, lead) {
  const base = NORMAL_LEADS[lead]
  const tmpl = DIAGNOSIS_TEMPLATES[diagnosisId] || {}
  const over = tmpl[lead] || {}
  const rBoost = (R_BOOST[diagnosisId] && R_BOOST[diagnosisId][lead]) || 0
  return {
    p: base.p,
    q: base.q,
    r: base.r + rBoost,
    s: base.s,
    st: over.st ?? 0,
    t: over.t ?? base.t,
  }
}

// Builds a lead's scrolling tile. Beat count is derived from `minWidthPx` so the
// tile always overflows the visible cell (at least 4 beats), which keeps the
// two-copy scroll seamless AND preserves true horizontal scale: at a given
// heart rate the beat width is fixed, so more beats fit a faster rate.
export function synthLead(caseObj, lead, { baselineY, minWidthPx }) {
  // Bad inputs would otherwise flow into an invalid CSS animation-duration and
  // render a silently frozen or empty trace — fail loudly instead.
  if (!(Number.isFinite(caseObj.bpm) && caseObj.bpm > 0)) {
    throw new Error(`synthLead: caseObj.bpm must be a positive number, got ${caseObj.bpm}`)
  }
  if (!Number.isFinite(minWidthPx)) {
    throw new Error(`synthLead: minWidthPx must be a number, got ${minWidthPx}`)
  }
  const morph = leadMorphology(caseObj.diagnosis, lead)
  const beats = Math.max(4, Math.ceil(minWidthPx / beatWidthPx(caseObj.bpm)))
  const { points, width } = leadPoints(morph, { bpm: caseObj.bpm, baselineY, beats })
  return { d: pointsToPath(points), width }
}
