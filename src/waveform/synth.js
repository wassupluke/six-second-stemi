import { NORMAL_LEADS, DIAGNOSIS_TEMPLATES, R_BOOST } from '../data/templates'
import { leadPoints } from './lead'

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

export function synthLead(caseObj, lead, { baselineY, beats = 4 }) {
  const morph = leadMorphology(caseObj.diagnosis, lead)
  const { points, width, beatWidth } = leadPoints(morph, { bpm: caseObj.bpm, baselineY, beats })
  return { d: pointsToPath(points), width, beatWidth }
}
