export const ECG = { PX_PER_MM: 4, MM_PER_SEC: 25 }

// Real-time ECG paper speed in px/s (25 mm/s at 4 px/mm). Scrolling the trace
// at this constant speed keeps the on-screen sweep at true paper speed, so the
// heart rate shows up as beat spacing — faster HR = complexes closer together
// and more of them passing per second.
export const PAPER_SPEED_PX_PER_SEC = ECG.MM_PER_SEC * ECG.PX_PER_MM

// Vertical amplitude gain. The tall coordinate box (COORD_H=220px in Lead.jsx)
// is scaled down to the ~70px cell (x70/220 ~= 0.32), which would otherwise draw
// amplitudes at only ~1/3 of the grid's true 4px/mm (10mm/mV) scale — QRS
// complexes look far too short against the graph paper. This gain restores the
// on-screen height to ~true mm/mV. (Exact-true would be 220/70 ~= 3.14; 3 keeps
// the tallest R waves from overrunning the cell too aggressively.)
export const AMPLITUDE_GAIN = 3

// Fixed complex durations in seconds (independent of heart rate).
const DUR = { preGap: 0.04, p: 0.09, pr: 0.05, q: 0.02, r: 0.045, s: 0.02, st: 0.10, t: 0.16 }

// Seconds occupied by the P-QRS-ST-T complex (everything but the TP baseline).
const COMPLEX_SEC = DUR.preGap + DUR.p + DUR.pr + DUR.q + DUR.r + DUR.s + DUR.st + DUR.t

// Horizontal px of one beat (RR interval) at the given heart rate. Single
// source of truth so beat.js and lead.js can never drift and break the seam.
export function beatWidthPx(bpm) {
  return (60 / bpm) * PAPER_SPEED_PX_PER_SEC
}

// Above this rate the complex is wider than the RR interval, so the waveform
// would fold back on itself (non-monotonic x). Cases are validated against it
// in src/data/cases.js.
export const MAX_BPM = Math.floor(60 / COMPLEX_SEC)

// Sample a smooth half-sine hump of `heightPx` (up = negative y) over `width` px.
function hump(x0, width, baseYFn, heightPx, steps = 8) {
  const pts = []
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const x = x0 + t * width
    const y = baseYFn(t) - heightPx * Math.sin(Math.PI * t)
    pts.push([x, y])
  }
  return pts
}

export function beatPoints(morph, opts) {
  const { bpm, baselineY } = opts
  const m = { p: 0, q: 0, r: 0, s: 0, st: 0, t: 0, ...morph }
  const secPx = s => s * PAPER_SPEED_PX_PER_SEC
  const mmPx = mm => mm * ECG.PX_PER_MM * AMPLITUDE_GAIN
  const beatWidth = beatWidthPx(bpm)
  const y = mm => baselineY - mmPx(mm) // + amplitude => up (smaller y)
  const stY = y(m.st)

  const pts = [[0, baselineY]]
  let x = secPx(DUR.preGap)
  pts.push([x, baselineY])

  // P wave (hump back to baseline)
  pts.push(...hump(x, secPx(DUR.p), () => baselineY, mmPx(m.p)))
  x += secPx(DUR.p)

  // PR segment
  x += secPx(DUR.pr)
  pts.push([x, baselineY])

  // QRS: sharp linear deflections
  x += secPx(DUR.q); pts.push([x, y(m.q)])
  x += secPx(DUR.r); pts.push([x, y(m.r)])
  x += secPx(DUR.s); pts.push([x, y(m.s)])

  // J point rises to ST level
  pts.push([x, stY])

  // ST segment flat at ST level
  x += secPx(DUR.st)
  pts.push([x, stY])

  // T wave: hump from ST level descending to baseline (ST-T fusion)
  pts.push(...hump(x, secPx(DUR.t), t => stY + (baselineY - stY) * t, mmPx(m.t)))
  x += secPx(DUR.t)

  // TP baseline fills the remainder of the RR interval
  pts.push([beatWidth, baselineY])

  // Clamp every y into [0, 2*baselineY] so a lead can never draw outside
  // its coordinate box, no matter how extreme an amplitude/ST value is.
  return pts.map(([px, py]) => [px, Math.max(0, Math.min(2 * baselineY, py))])
}
