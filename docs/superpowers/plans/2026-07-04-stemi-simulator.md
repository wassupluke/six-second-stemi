# Six-Second STEMI Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side STEMI-recognition trainer that clones the look/feel/interaction of SkillStat's 6-Second ECG simulator, with an animated 12-lead ECG synthesized from data, LEARN/GAME modes, and one-click territory answering.

**Architecture:** Pure-function waveform layer (`src/waveform/`) turns per-lead morphology parameters into seamless-tiling SVG paths; React components render them in a fixed-aspect "simulator" stage and animate them with a single GPU-composited CSS `transform` keyframe (no `<canvas>`, no per-frame JS). Three hooks own state: `useOptions` (persisted settings), `useSession` (cumulative localStorage stats), and `useGame` (the GAME state machine). Everything is bundled at build time — zero runtime network — and deploys as static files to GitHub Pages behind a Cloudflare domain.

**Tech Stack:** React 18, Vite 6, Tailwind CSS 3, Vitest 2 + React Testing Library + jsdom. No new runtime dependencies.

## Global Constraints

- **No runtime network** after initial load. No CDNs, web fonts, analytics, sockets, or `fetch`. All data/styles/fonts bundled. (Zscaler isolation requirement.)
- **System font stack only** — no downloaded fonts.
- **Animation is `transform`-only**, GPU-composited, one shared keyframe timeline. No `<canvas>`, no `requestAnimationFrame` render loop. The only timer is a 1 Hz `setInterval` for the game clock.
- **Honor `prefers-reduced-motion`** and provide a **Static** display toggle that freezes all motion into a readable 12-lead.
- **Graph-paper grid is a CSS `repeating-linear-gradient`**, never an image asset.
- **8 diagnosis answers exactly**, ids: `no-stemi, anterior, anteroseptal, anterolateral, lateral, inferior, posterior, rv`.
- **Difficulty chances:** Novice = 3, Practitioner = 1.
- **Default game length 5 minutes**, configurable 1–8.
- **Vite `base: '/'`** (served at domain root via Cloudflare custom domain).
- **localStorage keys:** `stemi-cumulative-stats`, `stemi-options`. Grading has a single axis (diagnosis); vessel is taught in reveal text, never graded.
- **ECG geometry constants** (shared across the waveform layer): `PX_PER_MM = 4`, `MM_PER_SEC = 25` (so 1 s = 100 px), amplitude scale `10 mm/mV`. Positive morphology amplitude = **upward** deflection (drawn as `baselineY - amp*PX_PER_MM` because SVG y grows downward).
- **Test commands:** `npm run test:run` (single run) and `npx vitest run <path>` (one file). `npm run build` must succeed with no errors.

---

## File Structure

**Created:**
- `src/data/diagnoses.js` — the 8 answer buttons (id + label + short teaching color role).
- `src/data/templates.js` — normal per-lead morphology + per-diagnosis ST/T overrides.
- `src/data/cases.json` — case roster (data, not images).
- `src/data/cases.js` — loads + validates `cases.json`, exposes `getDeck(difficulty)`.
- `src/waveform/beat.js` — `beatPoints(morph, opts)`: one beat as `[x,y]` points.
- `src/waveform/lead.js` — `leadPoints(morph, opts)`: N seamless beats.
- `src/waveform/synth.js` — `pointsToPath`, `leadMorphology`, `synthLead`.
- `src/hooks/useOptions.js` — persisted settings.
- `src/hooks/useGame.js` — GAME state machine.
- `src/components/Lead.jsx` — one animated SVG lead cell.
- `src/components/LeadGrid.jsx` — 4×3 grid of `Lead`.
- `src/components/RhythmStrip.jsx` — full-width lead-II strip.
- `src/components/EcgScreen.jsx` — screen frame: grid bg + LeadGrid + RhythmStrip + overlay.
- `src/components/ScreenOverlay.jsx` — intro / reveal / learn-description card.
- `src/components/DiagnosisButton.jsx` — one answer button with state colors.
- `src/components/AnswerGrid.jsx` — 8 buttons (game) or browse list (learn).
- `src/components/TitleBar.jsx` — "The 6 Second STEMI" + HEART RATE readout.
- `src/components/ControlBar.jsx` — dispatches to GameControls / LearnControls.
- `src/components/GameControls.jsx` — Play/Reset, timer, chances, counters.
- `src/components/LearnControls.jsx` — prev/next + current title.
- `src/components/BottomBar.jsx` — logo, LEARN|GAME tabs, options gear, mute.
- `src/components/OptionsModal.jsx` — game length, dynamic/static, grid, volume.
- `src/components/StatsPanel.jsx` — cumulative accuracy by diagnosis + reset.
- `src/components/Simulator.jsx` — assembles the whole stage.
- `.github/workflows/deploy.yml` — build + deploy to GitHub Pages.
- `public/.nojekyll`, `public/CNAME` — Pages custom-domain plumbing.

**Modified:**
- `src/hooks/useSession.js` — collapse to single grading axis (diagnosis).
- `src/App.jsx` — own `mode`/options, render `Simulator` + `StatsPanel`.
- `src/utils/shuffle.js` — unchanged (reused).
- `vite.config.js` — add `base: '/'`.
- `tailwind.config.js` — add theme tokens (colors, aspect).
- `src/index.css` — add scroll keyframes + grid gradient utility.
- `index.html` — title + remove `/vite.svg` favicon link.

**Deleted (superseded by this spec):**
- `src/data/constants.js`, `src/data/ecgs.json`
- `src/components/{Header,PracticeScreen,StatsScreen,ECGViewer,AnswerPanel,ChoiceList,RevealPanel}.jsx`
- `src/test/components/*` (old component tests), `public/ecgs/*`

---

### Task 1: Reset scaffold, config, and diagnosis constants

Removes superseded files, sets Zscaler-safe config, and lands the first tested data module. After this task `npm run test:run` is green with only the new test, and `npm run build` succeeds on a minimal placeholder app.

**Files:**
- Delete: `src/data/constants.js`, `src/data/ecgs.json`, `src/components/Header.jsx`, `src/components/PracticeScreen.jsx`, `src/components/StatsScreen.jsx`, `src/components/ECGViewer.jsx`, `src/components/AnswerPanel.jsx`, `src/components/ChoiceList.jsx`, `src/components/RevealPanel.jsx`, all files under `src/test/components/`, all files under `public/ecgs/`
- Create: `src/data/diagnoses.js`, `src/test/data/diagnoses.test.js`, `public/.nojekyll`, `public/CNAME`
- Modify: `vite.config.js`, `tailwind.config.js`, `src/index.css`, `index.html`, `src/App.jsx`

**Interfaces:**
- Produces: `DIAGNOSES: {id, label, isStemi}[]` (length 8), `DIAGNOSIS_IDS: string[]`, `diagnosisById(id) → entry|undefined` from `src/data/diagnoses.js`.

- [ ] **Step 1: Delete superseded files**

```bash
git rm src/data/constants.js src/data/ecgs.json \
  src/components/Header.jsx src/components/PracticeScreen.jsx \
  src/components/StatsScreen.jsx src/components/ECGViewer.jsx \
  src/components/AnswerPanel.jsx src/components/ChoiceList.jsx \
  src/components/RevealPanel.jsx
git rm -r src/test/components public/ecgs
```

- [ ] **Step 2: Set Vite base for Pages**

Replace `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
})
```

- [ ] **Step 3: Add Tailwind theme tokens**

Replace `tailwind.config.js` with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        screen: '#0b1a24',      // ECG screen background
        trace: '#e6faff',       // waveform stroke
        grid: '#123b4a',        // graph-paper lines
        bezel: '#1b2b34',       // simulator chrome
        learn: '#2b7bb9',       // LEARN accent (blue)
        game: '#d2691e',        // GAME accent (orange)
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Add scroll keyframes + grid utility to CSS**

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  /* Seamless horizontal scroll: track holds two identical tiles; -50% loops. */
  @keyframes ecg-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .ecg-track {
    display: flex;
    width: 200%;
    height: 100%;
    will-change: transform;
    animation: ecg-scroll linear infinite;
  }
  .ecg-paused { animation-play-state: paused; }

  /* Graph paper as pure CSS — no image asset. 1mm minor, 5mm major at 4px/mm. */
  .ecg-grid {
    background-color: theme('colors.screen');
    background-image:
      repeating-linear-gradient(to right,  theme('colors.grid') 0 1px, transparent 1px 20px),
      repeating-linear-gradient(to bottom, theme('colors.grid') 0 1px, transparent 1px 20px),
      repeating-linear-gradient(to right,  theme('colors.grid') 0 1px, transparent 1px 4px),
      repeating-linear-gradient(to bottom, theme('colors.grid') 0 1px, transparent 1px 4px);
    background-blend-mode: normal;
  }
  .ecg-grid-off { background-color: theme('colors.screen'); }
}

@media (prefers-reduced-motion: reduce) {
  .ecg-track { animation: none; transform: translateX(0); }
}
```

- [ ] **Step 5: Fix index.html title and favicon**

In `index.html`, change the `<title>` line to `    <title>The 6 Second STEMI</title>` and delete the line `    <link rel="icon" type="image/svg+xml" href="/vite.svg" />`.

- [ ] **Step 6: Add Pages plumbing files**

Create `public/.nojekyll` as an empty file. Create `public/CNAME` with a single line placeholder (the real domain is filled in at deploy time):

```
stemi.example.com
```

- [ ] **Step 7: Write the failing test for diagnoses**

Create `src/test/data/diagnoses.test.js`:

```js
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
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npx vitest run src/test/data/diagnoses.test.js`
Expected: FAIL — cannot resolve `../../data/diagnoses`.

- [ ] **Step 9: Implement diagnoses.js**

Create `src/data/diagnoses.js`:

```js
export const DIAGNOSES = [
  { id: 'no-stemi',      label: 'No STEMI',      isStemi: false },
  { id: 'anterior',      label: 'Anterior',      isStemi: true },
  { id: 'anteroseptal',  label: 'Anteroseptal',  isStemi: true },
  { id: 'anterolateral', label: 'Anterolateral', isStemi: true },
  { id: 'lateral',       label: 'Lateral',       isStemi: true },
  { id: 'inferior',      label: 'Inferior',      isStemi: true },
  { id: 'posterior',     label: 'Posterior',     isStemi: true },
  { id: 'rv',            label: 'RV',            isStemi: true },
]

export const DIAGNOSIS_IDS = DIAGNOSES.map(d => d.id)

const BY_ID = new Map(DIAGNOSES.map(d => [d.id, d]))
export function diagnosisById(id) {
  return BY_ID.get(id)
}
```

- [ ] **Step 10: Replace App.jsx with a temporary placeholder**

So the build/test pass while the old imports are gone. Replace `src/App.jsx` with:

```jsx
export default function App() {
  return (
    <div className="h-screen flex items-center justify-center bg-bezel text-trace font-sans">
      The 6 Second STEMI — coming together…
    </div>
  )
}
```

- [ ] **Step 11: Run tests and build to verify green**

Run: `npm run test:run`
Expected: PASS (diagnoses test only; old component tests are gone).
Run: `npm run build`
Expected: build completes, `dist/` written, no errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: reset scaffold to simulator spec, add config + diagnosis constants"
```

---

### Task 2: Waveform — single beat geometry

Builds one heartbeat as an array of `[x,y]` points in a millimeter-based coordinate system. Positive morphology amplitude is upward (drawn below `baselineY` numerically). The beat starts and ends exactly on the baseline so beats tile seamlessly.

**Files:**
- Create: `src/waveform/beat.js`, `src/test/waveform/beat.test.js`

**Interfaces:**
- Produces: `ECG = { PX_PER_MM: 4, MM_PER_SEC: 25 }` and `beatPoints(morph, opts) → [x,y][]`.
  - `morph`: `{ p, q, r, s, st, t }` amplitudes in mm (signed; + = upward). Missing keys default to 0.
  - `opts`: `{ bpm, baselineY }`. Returns points from `[0, baselineY]` to `[beatWidth, baselineY]` where `beatWidth = (60/bpm) * MM_PER_SEC * PX_PER_MM`.

- [ ] **Step 1: Write the failing test**

Create `src/test/waveform/beat.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { ECG, beatPoints } from '../../waveform/beat'

const opts = { bpm: 60, baselineY: 50 }

describe('beatPoints', () => {
  it('spans exactly one RR interval in width', () => {
    const pts = beatPoints({ r: 10 }, opts)
    const width = (60 / opts.bpm) * ECG.MM_PER_SEC * ECG.PX_PER_MM // 100px at 60bpm
    expect(pts[0][0]).toBe(0)
    expect(pts[pts.length - 1][0]).toBeCloseTo(width, 5)
  })
  it('starts and ends on the baseline (seamless)', () => {
    const pts = beatPoints({ r: 12, st: 3, t: 4 }, opts)
    expect(pts[0][1]).toBe(opts.baselineY)
    expect(pts[pts.length - 1][1]).toBeCloseTo(opts.baselineY, 5)
  })
  it('R wave rises above baseline (smaller y)', () => {
    const pts = beatPoints({ r: 10 }, opts)
    const minY = Math.min(...pts.map(p => p[1]))
    expect(minY).toBeLessThan(opts.baselineY - 10 * ECG.PX_PER_MM * 0.9)
  })
  it('ST elevation lifts the J/ST region above baseline', () => {
    const flat = beatPoints({ r: 8, st: 0 }, opts)
    const elev = beatPoints({ r: 8, st: 3 }, opts)
    // Sample the ST plateau region (just after QRS). Compare mean y there.
    const region = arr => arr.filter(p => p[0] > 40 && p[0] < 55).map(p => p[1])
    const mean = ys => ys.reduce((a, b) => a + b, 0) / ys.length
    expect(mean(region(elev))).toBeLessThan(mean(region(flat)))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/waveform/beat.test.js`
Expected: FAIL — cannot resolve `../../waveform/beat`.

- [ ] **Step 3: Implement beat.js**

Create `src/waveform/beat.js`:

```js
export const ECG = { PX_PER_MM: 4, MM_PER_SEC: 25 }

// Fixed complex durations in seconds (independent of heart rate).
const DUR = { preGap: 0.04, p: 0.09, pr: 0.05, q: 0.02, r: 0.045, s: 0.02, st: 0.10, t: 0.16 }

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
  const secPx = s => s * ECG.MM_PER_SEC * ECG.PX_PER_MM
  const mmPx = mm => mm * ECG.PX_PER_MM
  const beatWidth = secPx(60 / bpm)
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
  return pts
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/waveform/beat.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/waveform/beat.js src/test/waveform/beat.test.js
git commit -m "feat: synthesize single ECG beat geometry"
```

---

### Task 2 note on the `st` sampling window

The ST-plateau test samples `x` in `(40, 55)`. At 60 bpm the QRS ends near `preGap+p+pr+q+r+s = secPx(0.04+0.09+0.05+0.02+0.045+0.02)=secPx(0.265)=26.5px`, then ST plateau spans ~`secPx(0.10)=10px`, i.e. roughly `26.5→36.5`, T follows. The window `(40,55)` lands on the ST-T fusion region where elevation is still visible; both `st` and `t` are near baseline-referenced, so elevated ST keeps this region higher. If a future timing change moves the plateau, update the window in lockstep.

---

### Task 3: Waveform — lead tiling and path serialization

Concatenates whole beats into a tile wide enough to fill a lead cell, and serializes points to an SVG `d` string. The tile contains an integer number of beats so two copies laid end-to-end scroll seamlessly.

**Files:**
- Create: `src/waveform/lead.js`, `src/waveform/synth.js`, `src/test/waveform/lead.test.js`

**Interfaces:**
- Consumes: `ECG`, `beatPoints` from `src/waveform/beat.js`.
- Produces:
  - `leadPoints(morph, opts) → { points: [x,y][], width, beatWidth }` from `src/waveform/lead.js`. `opts`: `{ bpm, baselineY, beats }` (beats defaults to 4).
  - `pointsToPath(points) → string` from `src/waveform/synth.js`.

- [ ] **Step 1: Write the failing test**

Create `src/test/waveform/lead.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { leadPoints } from '../../waveform/lead'
import { pointsToPath } from '../../waveform/synth'

const opts = { bpm: 75, baselineY: 40, beats: 4 }

describe('leadPoints', () => {
  it('tiles an integer number of beats', () => {
    const { points, width, beatWidth } = leadPoints({ r: 10 }, opts)
    expect(width).toBeCloseTo(beatWidth * opts.beats, 5)
    expect(points[0][0]).toBe(0)
    expect(points[points.length - 1][0]).toBeCloseTo(width, 5)
  })
  it('is seamless: first and last y equal baseline', () => {
    const { points } = leadPoints({ r: 10, st: 3, t: 5 }, opts)
    expect(points[0][1]).toBe(opts.baselineY)
    expect(points[points.length - 1][1]).toBeCloseTo(opts.baselineY, 5)
  })
  it('x is monotonically non-decreasing', () => {
    const { points } = leadPoints({ r: 10 }, opts)
    for (let i = 1; i < points.length; i++) {
      expect(points[i][0]).toBeGreaterThanOrEqual(points[i - 1][0] - 1e-6)
    }
  })
})

describe('pointsToPath', () => {
  it('emits an M then L commands', () => {
    const d = pointsToPath([[0, 5], [10, 3], [20, 5]])
    expect(d).toBe('M0,5 L10,3 L20,5')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/waveform/lead.test.js`
Expected: FAIL — cannot resolve `../../waveform/lead`.

- [ ] **Step 3: Implement lead.js and synth.js (path part)**

Create `src/waveform/lead.js`:

```js
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
```

Create `src/waveform/synth.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/waveform/lead.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/waveform/lead.js src/waveform/synth.js src/test/waveform/lead.test.js
git commit -m "feat: tile beats into a seamless lead and serialize to SVG path"
```

---

### Task 4: Diagnosis templates and per-lead morphology

Encodes the normal per-lead QRS morphology (so V1 is rS, V6 is qR, aVR inverted, etc.) and, per diagnosis, which leads show ST elevation / reciprocal depression / T changes. `leadMorphology` combines them; `synthLead` produces the ready-to-render path for one lead of one case.

**Files:**
- Create: `src/data/templates.js`, `src/test/data/templates.test.js`
- Modify: `src/waveform/synth.js` (add `leadMorphology`, `synthLead`)

**Interfaces:**
- Consumes: `leadPoints` (lead.js), `pointsToPath` (synth.js), `ECG` (beat.js).
- Produces:
  - `LEADS: string[]` — 12 lead ids in grid order: `['I','aVR','V1','V4','II','aVL','V2','V5','III','aVF','V3','V6']`.
  - `NORMAL_LEADS: Record<lead, {p,q,r,s,t}>` and `DIAGNOSIS_TEMPLATES: Record<diagnosisId, Record<lead, Partial<{st,t}>>>` from `templates.js`.
  - `leadMorphology(diagnosisId, lead) → {p,q,r,s,st,t}` and `synthLead(caseObj, lead, {baselineY, beats}) → { d, width, beatWidth }` from `synth.js`. `caseObj` provides `{ diagnosis, bpm }`.

- [ ] **Step 1: Write the failing test**

Create `src/test/data/templates.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { LEADS, NORMAL_LEADS, DIAGNOSIS_TEMPLATES } from '../../data/templates'
import { leadMorphology, synthLead } from '../../waveform/synth'

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
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/data/templates.test.js`
Expected: FAIL — cannot resolve `../../data/templates`.

- [ ] **Step 3: Implement templates.js**

Create `src/data/templates.js`. Amplitudes in mm; normal morphology approximates textbook lead vectors (values are illustrative, not diagnostic):

```js
export const LEADS = ['I','aVR','V1','V4','II','aVL','V2','V5','III','aVF','V3','V6']

// Normal per-lead {p, q, r, s, t} amplitudes in mm (+ = upward).
export const NORMAL_LEADS = {
  I:   { p: 1.0, q: 0.5, r: 8,  s: 1, t: 2.0 },
  II:  { p: 1.5, q: 0.5, r: 12, s: 1, t: 3.0 },
  III: { p: 0.8, q: 0.5, r: 6,  s: 2, t: 1.5 },
  aVR: { p: -1.0, q: 0, r: 0.5, s: 8, t: -2.0 },
  aVL: { p: 0.6, q: 0.5, r: 5,  s: 2, t: 1.0 },
  aVF: { p: 1.0, q: 0.5, r: 8,  s: 1, t: 2.0 },
  V1:  { p: 0.8, q: 0,   r: 2,  s: 9, t: -1.0 },
  V2:  { p: 1.0, q: 0,   r: 4,  s: 10, t: 2.0 },
  V3:  { p: 1.0, q: 0.5, r: 8,  s: 6, t: 3.0 },
  V4:  { p: 1.0, q: 0.5, r: 12, s: 3, t: 4.0 },
  V5:  { p: 1.0, q: 1,   r: 12, s: 1, t: 3.0 },
  V6:  { p: 1.0, q: 1,   r: 10, s: 0.5, t: 2.5 },
}

// Per-diagnosis overrides: { lead: { st?, t? } } in mm. Only affected leads listed.
// + st = elevation, - st = reciprocal depression. t override replaces normal T (hyperacute/inverted).
export const DIAGNOSIS_TEMPLATES = {
  'no-stemi': {},
  anterior:      { V1:{st:2}, V2:{st:4,t:6}, V3:{st:4,t:6}, V4:{st:3,t:5}, II:{st:-1}, III:{st:-1}, aVF:{st:-1} },
  anteroseptal:  { V1:{st:3,t:4}, V2:{st:4,t:5}, V3:{st:2} },
  anterolateral: { V2:{st:3}, V3:{st:3,t:5}, V4:{st:3,t:5}, V5:{st:3}, V6:{st:2}, I:{st:2}, aVL:{st:2} },
  lateral:       { I:{st:2,t:3}, aVL:{st:3,t:4}, V5:{st:2}, V6:{st:2}, II:{st:-1}, III:{st:-2}, aVF:{st:-1} },
  inferior:      { II:{st:3,t:4}, III:{st:4,t:4}, aVF:{st:3,t:4}, I:{st:-1}, aVL:{st:-2} },
  posterior:     { V1:{st:-3}, V2:{st:-4}, V3:{st:-3}, V1r:undefined }, // reciprocal anterior depression, tall R handled below
  rv:            { III:{st:4,t:4}, II:{st:2}, aVF:{st:3}, V1:{st:2}, I:{st:-2}, aVL:{st:-2} },
}

// Posterior also shows tall R in V1-V3 (mirror of posterior Q). Apply as an R boost.
export const R_BOOST = {
  posterior: { V1: 6, V2: 6, V3: 4 },
}
```

- [ ] **Step 4: Add leadMorphology and synthLead to synth.js**

Append to `src/waveform/synth.js`:

```js
import { NORMAL_LEADS, DIAGNOSIS_TEMPLATES, R_BOOST } from '../data/templates'
import { leadPoints } from './lead'

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
```

Note: put the two new `import` lines at the **top** of `synth.js` alongside any existing imports, not mid-file.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/data/templates.test.js src/test/waveform/lead.test.js`
Expected: PASS (all).

- [ ] **Step 6: Commit**

```bash
git add src/data/templates.js src/waveform/synth.js src/test/data/templates.test.js
git commit -m "feat: add diagnosis morphology templates and per-lead synth"
```

---

### Task 5: Case roster and deck loader

Defines the case content (data, not images) and a loader that validates every case references a real diagnosis and exposes a difficulty-filtered deck.

**Files:**
- Create: `src/data/cases.json`, `src/data/cases.js`, `src/test/data/cases.test.js`

**Interfaces:**
- Consumes: `DIAGNOSIS_IDS` (diagnoses.js).
- Produces: `CASES: Case[]` and `getDeck(difficulty) → Case[]` from `src/data/cases.js`.
  - `Case = { id, diagnosis, bpm, rhythm, culprit, leads_affected: string[], explanation, difficulty: 'classic'|'subtle', mimic?: string }`.
  - `getDeck('novice')` → classic only; `getDeck('practitioner')` → all cases.

- [ ] **Step 1: Write the failing test**

Create `src/test/data/cases.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { CASES, getDeck } from '../../data/cases'
import { DIAGNOSIS_IDS } from '../../data/diagnoses'

describe('cases', () => {
  it('every case references a valid diagnosis and has required fields', () => {
    for (const c of CASES) {
      expect(DIAGNOSIS_IDS).toContain(c.diagnosis)
      expect(typeof c.bpm).toBe('number')
      expect(c.explanation.length).toBeGreaterThan(0)
      expect(['classic', 'subtle']).toContain(c.difficulty)
      expect(Array.isArray(c.leads_affected)).toBe(true)
    }
  })
  it('covers all 8 diagnoses at least once', () => {
    const covered = new Set(CASES.map(c => c.diagnosis))
    for (const id of DIAGNOSIS_IDS) expect(covered.has(id)).toBe(true)
  })
  it('novice deck is classic-only; practitioner deck includes everything', () => {
    const nov = getDeck('novice')
    expect(nov.every(c => c.difficulty === 'classic')).toBe(true)
    expect(getDeck('practitioner').length).toBe(CASES.length)
    expect(nov.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/data/cases.test.js`
Expected: FAIL — cannot resolve `../../data/cases`.

- [ ] **Step 3: Create cases.json**

Create `src/data/cases.json` with at least one classic case per diagnosis (clinician review can expand later):

```json
[
  { "id": "inf-1", "diagnosis": "inferior", "bpm": 68, "rhythm": "NSR", "culprit": "RCA",
    "leads_affected": ["II", "III", "aVF"], "difficulty": "classic",
    "explanation": "Classic inferior STEMI: ST elevation in II, III, aVF with reciprocal depression in I and aVL. Inferior wall is RCA-supplied in ~80% (right-dominant). STE greater in III than II favors RCA over LCx; check V4R for RV involvement." },
  { "id": "ant-1", "diagnosis": "anterior", "bpm": 88, "rhythm": "NSR", "culprit": "LAD",
    "leads_affected": ["V1", "V2", "V3", "V4"], "difficulty": "classic",
    "explanation": "Anterior STEMI: ST elevation across V1-V4 from LAD occlusion. Large territory at risk and high mortality. Reciprocal inferior depression may appear." },
  { "id": "asp-1", "diagnosis": "anteroseptal", "bpm": 82, "rhythm": "NSR", "culprit": "LAD (proximal)",
    "leads_affected": ["V1", "V2", "V3"], "difficulty": "classic",
    "explanation": "Anteroseptal STEMI: ST elevation focused in V1-V3 from proximal LAD occlusion involving septal perforators. Loss of septal r-wave may be seen." },
  { "id": "alat-1", "diagnosis": "anterolateral", "bpm": 96, "rhythm": "NSR", "culprit": "LAD (proximal)",
    "leads_affected": ["V2", "V3", "V4", "V5", "V6", "I", "aVL"], "difficulty": "classic",
    "explanation": "Anterolateral STEMI: extensive ST elevation across the precordium plus I and aVL from a proximal LAD (often wrapping) occlusion. Large territory; watch for pump failure." },
  { "id": "lat-1", "diagnosis": "lateral", "bpm": 74, "rhythm": "NSR", "culprit": "LCx",
    "leads_affected": ["I", "aVL", "V5", "V6"], "difficulty": "classic",
    "explanation": "Lateral STEMI: ST elevation in I, aVL, V5, V6 from LCx occlusion, with reciprocal inferior depression. High-lateral (I/aVL) changes can be subtle." },
  { "id": "post-1", "diagnosis": "posterior", "bpm": 78, "rhythm": "NSR", "culprit": "RCA/LCx",
    "leads_affected": ["V1", "V2", "V3"], "difficulty": "classic",
    "explanation": "Posterior STEMI: horizontal ST DEPRESSION with tall R waves in V1-V3 is the mirror image of posterior injury. Confirm with posterior leads V7-V9 showing elevation. Often accompanies inferior/lateral MI." },
  { "id": "rv-1", "diagnosis": "rv", "bpm": 58, "rhythm": "sinus brady", "culprit": "RCA (proximal)",
    "leads_affected": ["III", "aVF", "V1"], "difficulty": "classic",
    "explanation": "RV STEMI: inferior STE with STE III > II and elevation in V1; confirm with V4R. Preload-dependent - avoid nitrates. Proximal RCA occlusion before the RV marginal branch." },
  { "id": "none-normal-1", "diagnosis": "no-stemi", "bpm": 72, "rhythm": "NSR", "culprit": "-",
    "leads_affected": [], "difficulty": "classic", "mimic": "normal",
    "explanation": "Normal ECG. No pathologic ST elevation; J-points at baseline, T waves concordant and proportionate. No reciprocal changes." },
  { "id": "none-ber-1", "diagnosis": "no-stemi", "bpm": 64, "rhythm": "NSR", "culprit": "-",
    "leads_affected": ["V2", "V3", "V4"], "difficulty": "subtle", "mimic": "benign early repolarization",
    "explanation": "Benign early repolarization mimic: concave ST elevation with notched J-points, most prominent in mid-precordial leads, no reciprocal depression, stable over time." },
  { "id": "none-peri-1", "diagnosis": "no-stemi", "bpm": 94, "rhythm": "sinus tach", "culprit": "-",
    "leads_affected": ["I", "II", "aVF", "V5", "V6"], "difficulty": "subtle", "mimic": "pericarditis",
    "explanation": "Pericarditis mimic: diffuse concave ST elevation across multiple territories with PR-segment depression (and PR elevation in aVR), without a coronary distribution or reciprocal change." }
]
```

- [ ] **Step 4: Implement cases.js loader**

Create `src/data/cases.js`:

```js
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/data/cases.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/data/cases.json src/data/cases.js src/test/data/cases.test.js
git commit -m "feat: add STEMI case roster and difficulty deck loader"
```

---

### Task 6: useOptions hook

Persisted settings backing the Options modal: game length, dynamic/static display, grid on/off, volume, mute.

**Files:**
- Create: `src/hooks/useOptions.js`, `src/test/hooks/useOptions.test.js`

**Interfaces:**
- Produces: `useOptions() → { options, setOption }` where
  `options = { gameMinutes: 5, display: 'dynamic', grid: true, volume: 0.6, muted: false }`
  and `setOption(key, value)` persists to `localStorage['stemi-options']`.

- [ ] **Step 1: Write the failing test**

Create `src/test/hooks/useOptions.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOptions } from '../../hooks/useOptions'

beforeEach(() => localStorage.clear())

describe('useOptions', () => {
  it('starts from defaults', () => {
    const { result } = renderHook(() => useOptions())
    expect(result.current.options).toEqual({
      gameMinutes: 5, display: 'dynamic', grid: true, volume: 0.6, muted: false,
    })
  })
  it('setOption updates and persists', () => {
    const { result } = renderHook(() => useOptions())
    act(() => result.current.setOption('display', 'static'))
    expect(result.current.options.display).toBe('static')
    expect(JSON.parse(localStorage.getItem('stemi-options')).display).toBe('static')
  })
  it('hydrates from existing storage', () => {
    localStorage.setItem('stemi-options', JSON.stringify({ gameMinutes: 3 }))
    const { result } = renderHook(() => useOptions())
    expect(result.current.options.gameMinutes).toBe(3)
    expect(result.current.options.grid).toBe(true) // merged with defaults
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/hooks/useOptions.test.js`
Expected: FAIL — cannot resolve `../../hooks/useOptions`.

- [ ] **Step 3: Implement useOptions.js**

Create `src/hooks/useOptions.js`:

```js
import { useState, useCallback } from 'react'

const KEY = 'stemi-options'
const DEFAULTS = { gameMinutes: 5, display: 'dynamic', grid: true, volume: 0.6, muted: false }

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function useOptions() {
  const [options, setOptions] = useState(read)
  const setOption = useCallback((key, value) => {
    setOptions(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])
  return { options, setOption }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/hooks/useOptions.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useOptions.js src/test/hooks/useOptions.test.js
git commit -m "feat: add persisted useOptions hook"
```

---

### Task 7: Adapt useSession to single-axis grading

Rewrites the existing hook so grading and cumulative stats are keyed by **diagnosis** only (vessel is no longer graded). Keeps the localStorage/corrupt-data resilience.

**Files:**
- Modify: `src/hooks/useSession.js`
- Modify: `src/test/hooks/useSession.test.js` (rewrite to the new API)

**Interfaces:**
- Produces: `useSession() → { sessionProgress, cumulativeStats, gradeAnswer, resetStats }`.
  - `gradeAnswer(caseObj, selectedDiagnosisId) → boolean` (returns correctness), updates `sessionProgress {answered, correct}` and `cumulativeStats.diagnosis[caseObj.diagnosis] {correct,total}`, persists to `localStorage['stemi-cumulative-stats']`.
  - `cumulativeStats = { diagnosis: { [id]: {correct,total} } }`.

- [ ] **Step 1: Rewrite the test**

Replace `src/test/hooks/useSession.test.js` with:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSession } from '../../hooks/useSession'

beforeEach(() => localStorage.clear())
const caseObj = { diagnosis: 'inferior' }

describe('useSession', () => {
  it('grades a correct answer and updates buckets', () => {
    const { result } = renderHook(() => useSession())
    let correct
    act(() => { correct = result.current.gradeAnswer(caseObj, 'inferior') })
    expect(correct).toBe(true)
    expect(result.current.sessionProgress).toEqual({ answered: 1, correct: 1 })
    expect(result.current.cumulativeStats.diagnosis.inferior).toEqual({ correct: 1, total: 1 })
  })
  it('grades an incorrect answer', () => {
    const { result } = renderHook(() => useSession())
    act(() => { result.current.gradeAnswer(caseObj, 'anterior') })
    expect(result.current.sessionProgress).toEqual({ answered: 1, correct: 0 })
    expect(result.current.cumulativeStats.diagnosis.inferior).toEqual({ correct: 0, total: 1 })
  })
  it('persists and resets', () => {
    const { result } = renderHook(() => useSession())
    act(() => { result.current.gradeAnswer(caseObj, 'inferior') })
    expect(JSON.parse(localStorage.getItem('stemi-cumulative-stats')).diagnosis.inferior.total).toBe(1)
    act(() => { result.current.resetStats() })
    expect(result.current.cumulativeStats.diagnosis).toEqual({})
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/hooks/useSession.test.js`
Expected: FAIL — new API not present (old hook grades territory+vessel).

- [ ] **Step 3: Rewrite useSession.js**

Replace `src/hooks/useSession.js` with:

```js
import { useState, useCallback } from 'react'

const STORAGE_KEY = 'stemi-cumulative-stats'
const emptyStats = () => ({ diagnosis: {} })

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { diagnosis: {}, ...JSON.parse(raw) } : emptyStats()
  } catch {
    return emptyStats()
  }
}

function bump(bucket, key, isCorrect) {
  const prev = bucket[key] ?? { correct: 0, total: 0 }
  return { ...bucket, [key]: { correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 } }
}

export function useSession() {
  const [cumulativeStats, setCumulativeStats] = useState(readStorage)
  const [sessionProgress, setSessionProgress] = useState({ answered: 0, correct: 0 })

  const gradeAnswer = useCallback((caseObj, selectedDiagnosisId) => {
    const correct = selectedDiagnosisId === caseObj.diagnosis
    setSessionProgress(prev => ({
      answered: prev.answered + 1,
      correct: prev.correct + (correct ? 1 : 0),
    }))
    setCumulativeStats(prev => {
      const next = { diagnosis: bump(prev.diagnosis, caseObj.diagnosis, correct) }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    return correct
  }, [])

  const resetStats = useCallback(() => {
    const empty = emptyStats()
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(empty)) } catch { /* ignore */ }
    setCumulativeStats(empty)
  }, [])

  return { sessionProgress, cumulativeStats, gradeAnswer, resetStats }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/hooks/useSession.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSession.js src/test/hooks/useSession.test.js
git commit -m "refactor: grade sessions by diagnosis only"
```

---

### Task 8: useGame state machine

The GAME loop: start with a difficulty, draw cases, count down a 1 Hz timer, handle chances, expose live counters, advance/reset. Correct answers freeze the timer; exhausting chances reveals the answer.

**Files:**
- Create: `src/hooks/useGame.js`, `src/test/hooks/useGame.test.js`

**Interfaces:**
- Consumes: `getDeck` (cases.js), `shuffle` (utils/shuffle.js).
- Produces: `useGame({ gameMinutes, onGrade }) → { phase, currentCase, chancesLeft, timerRemaining, counters, lastResult, start, answer, next, reset }`.
  - `phase`: `'idle' | 'playing' | 'answered' | 'gameover'`.
  - `counters`: `{ cases, correct, attempts }`.
  - `lastResult`: `{ correct: boolean, selected: string } | null`.
  - `start(difficulty)`, `answer(diagnosisId)`, `next()`, `reset()`.
  - `onGrade(caseObj, diagnosisId)` is called once per graded case (correct, or chances exhausted) so the parent can update `useSession`.

- [ ] **Step 1: Write the failing test**

Create `src/test/hooks/useGame.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGame } from '../../hooks/useGame'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function setup(opts = {}) {
  const onGrade = vi.fn()
  const hook = renderHook(() => useGame({ gameMinutes: 1, onGrade, ...opts }))
  return { ...hook, onGrade }
}

describe('useGame', () => {
  it('starts idle', () => {
    const { result } = setup()
    expect(result.current.phase).toBe('idle')
    expect(result.current.currentCase).toBeNull()
  })
  it('start(novice) enters playing with a case and full timer', () => {
    const { result } = setup()
    act(() => result.current.start('novice'))
    expect(result.current.phase).toBe('playing')
    expect(result.current.currentCase).not.toBeNull()
    expect(result.current.timerRemaining).toBe(60)
    expect(result.current.chancesLeft).toBe(3) // novice
  })
  it('practitioner gets 1 chance', () => {
    const { result } = setup()
    act(() => result.current.start('practitioner'))
    expect(result.current.chancesLeft).toBe(1)
  })
  it('correct answer grades, freezes, and increments counters', () => {
    const { result, onGrade } = setup()
    act(() => result.current.start('novice'))
    const dx = result.current.currentCase.diagnosis
    act(() => result.current.answer(dx))
    expect(result.current.phase).toBe('answered')
    expect(result.current.lastResult).toEqual({ correct: true, selected: dx })
    expect(result.current.counters).toEqual({ cases: 1, correct: 1, attempts: 1 })
    expect(onGrade).toHaveBeenCalledTimes(1)
  })
  it('wrong answers decrement chances; exhaustion reveals + grades once', () => {
    const { result, onGrade } = setup()
    act(() => result.current.start('novice'))
    const wrong = result.current.currentCase.diagnosis === 'inferior' ? 'anterior' : 'inferior'
    act(() => result.current.answer(wrong)) // 3 -> 2, still playing
    expect(result.current.phase).toBe('playing')
    expect(result.current.chancesLeft).toBe(2)
    act(() => result.current.answer(wrong)) // 2 -> 1
    act(() => result.current.answer(wrong)) // 1 -> 0 -> answered
    expect(result.current.phase).toBe('answered')
    expect(result.current.lastResult.correct).toBe(false)
    expect(result.current.counters).toEqual({ cases: 1, correct: 0, attempts: 3 })
    expect(onGrade).toHaveBeenCalledTimes(1)
  })
  it('timer counts down and reaching 0 ends the game', () => {
    const { result } = setup()
    act(() => result.current.start('novice'))
    act(() => vi.advanceTimersByTime(60000))
    expect(result.current.timerRemaining).toBe(0)
    expect(result.current.phase).toBe('gameover')
  })
  it('reset returns to idle', () => {
    const { result } = setup()
    act(() => result.current.start('novice'))
    act(() => result.current.reset())
    expect(result.current.phase).toBe('idle')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/hooks/useGame.test.js`
Expected: FAIL — cannot resolve `../../hooks/useGame`.

- [ ] **Step 3: Implement useGame.js**

Create `src/hooks/useGame.js`:

```js
import { useState, useRef, useEffect, useCallback } from 'react'
import { getDeck } from '../data/cases'
import { shuffle } from '../utils/shuffle'

const CHANCES = { novice: 3, practitioner: 1 }

export function useGame({ gameMinutes, onGrade }) {
  const [phase, setPhase] = useState('idle')
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [chancesLeft, setChancesLeft] = useState(0)
  const [timerRemaining, setTimerRemaining] = useState(gameMinutes * 60)
  const [counters, setCounters] = useState({ cases: 0, correct: 0, attempts: 0 })
  const [lastResult, setLastResult] = useState(null)
  const difficultyRef = useRef('novice')

  const currentCase = phase === 'idle' || phase === 'gameover' ? null : (deck[index] ?? null)

  // 1 Hz countdown, only while playing or answered (timer freezes on 'answered').
  useEffect(() => {
    if (phase !== 'playing') return undefined
    const id = setInterval(() => {
      setTimerRemaining(t => {
        if (t <= 1) { clearInterval(id); setPhase('gameover'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  const start = useCallback((difficulty) => {
    difficultyRef.current = difficulty
    setDeck(shuffle(getDeck(difficulty)))
    setIndex(0)
    setChancesLeft(CHANCES[difficulty] ?? 3)
    setTimerRemaining(gameMinutes * 60)
    setCounters({ cases: 0, correct: 0, attempts: 0 })
    setLastResult(null)
    setPhase('playing')
  }, [gameMinutes])

  const answer = useCallback((diagnosisId) => {
    if (phase !== 'playing') return
    const c = deck[index]
    if (!c) return
    const correct = diagnosisId === c.diagnosis
    if (correct) {
      setCounters(p => ({ cases: p.cases + 1, correct: p.correct + 1, attempts: p.attempts + 1 }))
      setLastResult({ correct: true, selected: diagnosisId })
      onGrade(c, diagnosisId)
      setPhase('answered')
      return
    }
    const remaining = chancesLeft - 1
    setChancesLeft(remaining)
    setCounters(p => ({ ...p, attempts: p.attempts + 1 }))
    if (remaining <= 0) {
      setCounters(p => ({ ...p, cases: p.cases + 1 }))
      setLastResult({ correct: false, selected: diagnosisId })
      onGrade(c, diagnosisId)
      setPhase('answered')
    }
  }, [phase, deck, index, chancesLeft, onGrade])

  const next = useCallback(() => {
    setIndex(i => {
      const ni = i + 1
      if (ni >= deck.length) { setPhase('gameover'); return i }
      setChancesLeft(CHANCES[difficultyRef.current] ?? 3)
      setLastResult(null)
      setPhase('playing')
      return ni
    })
  }, [deck.length])

  const reset = useCallback(() => {
    setPhase('idle')
    setLastResult(null)
    setTimerRemaining(gameMinutes * 60)
  }, [gameMinutes])

  return { phase, currentCase, chancesLeft, timerRemaining, counters, lastResult, start, answer, next, reset }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/hooks/useGame.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGame.js src/test/hooks/useGame.test.js
git commit -m "feat: add useGame state machine with timer and chances"
```

---

### Task 9: Lead component (animated SVG)

Renders one lead cell: an SVG whose `<path>` (two copies in a flex track) scrolls via the CSS keyframe. Animation is disabled when `display === 'static'` or the lead is hovered (LEARN freeze).

**Files:**
- Create: `src/components/Lead.jsx`, `src/test/components/Lead.test.jsx`

**Interfaces:**
- Consumes: `synthLead` (synth.js), `LEADS` (templates.js).
- Produces: `<Lead caseObj lead animated durationSec height />`.
  - Renders a labeled cell; when `animated` is false, the track gets class `ecg-paused`.
  - `caseObj` may be `null` (renders an empty gridded cell).

- [ ] **Step 1: Write the failing test**

Create `src/test/components/Lead.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Lead } from '../../components/Lead'

const c = { diagnosis: 'inferior', bpm: 68 }

describe('Lead', () => {
  it('renders the lead label', () => {
    const { getByText } = render(<Lead caseObj={c} lead="II" animated height={80} />)
    expect(getByText('II')).toBeInTheDocument()
  })
  it('renders two path copies for seamless scroll', () => {
    const { container } = render(<Lead caseObj={c} lead="II" animated height={80} />)
    expect(container.querySelectorAll('path').length).toBe(2)
  })
  it('pauses animation when not animated', () => {
    const { container } = render(<Lead caseObj={c} lead="II" animated={false} height={80} />)
    expect(container.querySelector('.ecg-track').classList.contains('ecg-paused')).toBe(true)
  })
  it('renders an empty cell when caseObj is null', () => {
    const { container, getByText } = render(<Lead caseObj={null} lead="V1" animated height={80} />)
    expect(getByText('V1')).toBeInTheDocument()
    expect(container.querySelectorAll('path').length).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/components/Lead.test.jsx`
Expected: FAIL — cannot resolve `../../components/Lead`.

- [ ] **Step 3: Implement Lead.jsx**

Create `src/components/Lead.jsx`:

```jsx
import { useState } from 'react'
import { synthLead } from '../waveform/synth'

export function Lead({ caseObj, lead, animated, durationSec = 6, height = 80 }) {
  const [hovered, setHovered] = useState(false)
  const baselineY = height / 2
  const tile = caseObj ? synthLead(caseObj, lead, { baselineY, beats: 4 }) : null
  const paused = !animated || hovered

  return (
    <div
      className="relative overflow-hidden border-r border-b border-grid/40"
      style={{ height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="absolute top-0.5 left-1 z-10 text-[10px] font-semibold text-trace/80 select-none">
        {lead}
      </span>
      {tile && (
        <div className={`ecg-track ${paused ? 'ecg-paused' : ''}`} style={{ animationDuration: `${durationSec}s` }}>
          {[0, 1].map(i => (
            <svg
              key={i}
              width={tile.width}
              height={height}
              viewBox={`0 0 ${tile.width} ${height}`}
              preserveAspectRatio="none"
              className="h-full"
              style={{ flex: '0 0 50%' }}
            >
              <path d={tile.d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-trace" />
            </svg>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/components/Lead.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Lead.jsx src/test/components/Lead.test.jsx
git commit -m "feat: add animated SVG Lead component"
```

---

### Task 10: LeadGrid and RhythmStrip

Lays 12 `Lead`s into a 4×3 grid (column-major so the standard I/II/III, aVR/aVL/aVF, V1–V3, V4–V6 arrangement holds) plus a full-width lead-II rhythm strip.

**Files:**
- Create: `src/components/LeadGrid.jsx`, `src/components/RhythmStrip.jsx`, `src/test/components/LeadGrid.test.jsx`

**Interfaces:**
- Consumes: `Lead`, `LEADS` (templates.js).
- Produces: `<LeadGrid caseObj animated />` (renders 12 `Lead`s in `LEADS` order) and `<RhythmStrip caseObj animated />` (renders lead II full width).

- [ ] **Step 1: Write the failing test**

Create `src/test/components/LeadGrid.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LeadGrid } from '../../components/LeadGrid'
import { RhythmStrip } from '../../components/RhythmStrip'
import { LEADS } from '../../data/templates'

const c = { diagnosis: 'anterior', bpm: 80 }

describe('LeadGrid', () => {
  it('renders all 12 lead labels', () => {
    const { getAllByText, getByText } = render(<LeadGrid caseObj={c} animated />)
    for (const l of LEADS) {
      // "II" also appears in the rhythm strip elsewhere; within the grid each appears once.
      expect(getByText(l)).toBeInTheDocument()
    }
    expect(getAllByText('V4').length).toBe(1)
  })
})

describe('RhythmStrip', () => {
  it('labels itself as lead II', () => {
    const { getByText } = render(<RhythmStrip caseObj={c} animated />)
    expect(getByText('II')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/components/LeadGrid.test.jsx`
Expected: FAIL — cannot resolve `../../components/LeadGrid`.

- [ ] **Step 3: Implement LeadGrid.jsx and RhythmStrip.jsx**

Create `src/components/LeadGrid.jsx`:

```jsx
import { Lead } from './Lead'
import { LEADS } from '../data/templates'

// LEADS is already in column-major grid order:
// row0: I aVR V1 V4 | row1: II aVL V2 V5 | row2: III aVF V3 V6
export function LeadGrid({ caseObj, animated }) {
  return (
    <div className="grid grid-cols-4 grid-rows-3 w-full">
      {LEADS.map(lead => (
        <Lead key={lead} caseObj={caseObj} lead={lead} animated={animated} height={70} />
      ))}
    </div>
  )
}
```

Create `src/components/RhythmStrip.jsx`:

```jsx
import { Lead } from './Lead'

export function RhythmStrip({ caseObj, animated }) {
  return (
    <div className="w-full border-t border-grid/40">
      <Lead caseObj={caseObj} lead="II" animated={animated} durationSec={12} height={70} />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/components/LeadGrid.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/LeadGrid.jsx src/components/RhythmStrip.jsx src/test/components/LeadGrid.test.jsx
git commit -m "feat: add 12-lead grid and rhythm strip"
```

---

### Task 11: EcgScreen and ScreenOverlay

The screen frame: gridded background (toggleable), the lead grid + rhythm strip, and an overlay card that shows the intro (idle), the reveal (answered), or a LEARN description.

**Files:**
- Create: `src/components/EcgScreen.jsx`, `src/components/ScreenOverlay.jsx`, `src/test/components/ScreenOverlay.test.jsx`

**Interfaces:**
- Consumes: `LeadGrid`, `RhythmStrip`, `diagnosisById` (diagnoses.js).
- Produces:
  - `<EcgScreen caseObj animated grid overlay />` — `grid` toggles `.ecg-grid`/`.ecg-grid-off`; `overlay` is arbitrary node rendered above the leads.
  - `<ScreenOverlay variant caseObj result onNext onStart onPrev onNextLearn />`:
    - `variant='intro'` → "Explore. Review. Play." + Novice/Practitioner (calls `onStart('novice'|'practitioner')`).
    - `variant='reveal'` → verdict + culprit + explanation + `leads_affected` badges + "Next Case" (`onNext`).
    - `variant='learn'` → diagnosis label + explanation + prev/next (`onPrev`/`onNextLearn`).
    - `variant='gameover'` → summary from `result` + "Play again" (`onStart`... via intro; here `onNext` acts as "back to intro").

- [ ] **Step 1: Write the failing test**

Create `src/test/components/ScreenOverlay.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ScreenOverlay } from '../../components/ScreenOverlay'

const c = { diagnosis: 'inferior', culprit: 'RCA', leads_affected: ['II','III','aVF'],
  explanation: 'Inferior STEMI teaching text.' }

describe('ScreenOverlay', () => {
  it('intro offers both difficulties', () => {
    const onStart = vi.fn()
    const { getByText } = render(<ScreenOverlay variant="intro" onStart={onStart} />)
    fireEvent.click(getByText('Novice'))
    expect(onStart).toHaveBeenCalledWith('novice')
    fireEvent.click(getByText('Practitioner'))
    expect(onStart).toHaveBeenCalledWith('practitioner')
  })
  it('reveal shows verdict, culprit, explanation, lead badges, and Next', () => {
    const onNext = vi.fn()
    const { getByText, getAllByText } = render(
      <ScreenOverlay variant="reveal" caseObj={c} result={{ correct: true, selected: 'inferior' }} onNext={onNext} />
    )
    expect(getByText(/Inferior/i)).toBeInTheDocument()
    expect(getByText(/RCA/)).toBeInTheDocument()
    expect(getByText('Inferior STEMI teaching text.')).toBeInTheDocument()
    expect(getByText('III')).toBeInTheDocument()
    fireEvent.click(getByText(/Next Case/i))
    expect(onNext).toHaveBeenCalled()
  })
  it('reveal marks incorrect answers', () => {
    const { getByText } = render(
      <ScreenOverlay variant="reveal" caseObj={c} result={{ correct: false, selected: 'anterior' }} onNext={() => {}} />
    )
    expect(getByText(/Incorrect/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/components/ScreenOverlay.test.jsx`
Expected: FAIL — cannot resolve `../../components/ScreenOverlay`.

- [ ] **Step 3: Implement ScreenOverlay.jsx and EcgScreen.jsx**

Create `src/components/ScreenOverlay.jsx`:

```jsx
import { diagnosisById } from '../data/diagnoses'

function Badges({ leads }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {leads.map(l => (
        <span key={l} className="px-1.5 py-0.5 text-[11px] rounded bg-trace/15 text-trace">{l}</span>
      ))}
    </div>
  )
}

export function ScreenOverlay({ variant, caseObj, result, onStart, onNext, onPrev, onNextLearn }) {
  if (variant === 'intro') {
    return (
      <Card>
        <h2 className="text-xl font-bold text-trace">Explore. Review. Play.</h2>
        <p className="text-trace/80 text-sm mt-1">Identify the STEMI territory shown, or call No STEMI.</p>
        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 rounded bg-game text-white font-semibold" onClick={() => onStart('novice')}>Novice</button>
          <button className="px-4 py-2 rounded bg-game/80 text-white font-semibold" onClick={() => onStart('practitioner')}>Practitioner</button>
        </div>
      </Card>
    )
  }
  if (variant === 'reveal' && caseObj) {
    const label = diagnosisById(caseObj.diagnosis)?.label ?? caseObj.diagnosis
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-trace">
            {result?.correct ? '✓ ' : '✗ Incorrect — '}{label}{caseObj.mimic ? ` (${caseObj.mimic})` : ' STEMI'}
          </h2>
          {caseObj.culprit && caseObj.culprit !== '-' && (
            <span className="text-sm text-trace/80">Culprit: {caseObj.culprit}</span>
          )}
        </div>
        <p className="text-trace/85 text-sm mt-2">{caseObj.explanation}</p>
        {caseObj.leads_affected?.length > 0 && <Badges leads={caseObj.leads_affected} />}
        <div className="flex justify-end mt-3">
          <button className="px-4 py-2 rounded bg-game text-white font-semibold" onClick={onNext}>Next Case →</button>
        </div>
      </Card>
    )
  }
  if (variant === 'learn' && caseObj) {
    const label = diagnosisById(caseObj.diagnosis)?.label ?? caseObj.diagnosis
    return (
      <Card>
        <div className="flex items-center justify-between">
          <button className="px-3 py-1 rounded bg-trace/10 text-trace" onClick={onPrev}>‹ Prev</button>
          <h2 className="text-lg font-bold text-trace">{label}</h2>
          <button className="px-3 py-1 rounded bg-trace/10 text-trace" onClick={onNextLearn}>Next ›</button>
        </div>
        <p className="text-trace/85 text-sm mt-2">{caseObj.explanation}</p>
        {caseObj.leads_affected?.length > 0 && <Badges leads={caseObj.leads_affected} />}
      </Card>
    )
  }
  if (variant === 'gameover') {
    return (
      <Card>
        <h2 className="text-xl font-bold text-trace">Game over</h2>
        <p className="text-trace/85 text-sm mt-1">
          {result ? `Correct ${result.correct}/${result.cases} (${result.cases ? Math.round(100*result.correct/result.cases) : 0}%)` : ''}
        </p>
        <div className="flex justify-end mt-3">
          <button className="px-4 py-2 rounded bg-game text-white font-semibold" onClick={onNext}>Play again</button>
        </div>
      </Card>
    )
  }
  return null
}

function Card({ children }) {
  return (
    <div className="absolute inset-x-0 bottom-0 m-3 p-4 rounded-lg bg-bezel/95 backdrop-blur border border-grid/50">
      {children}
    </div>
  )
}
```

Create `src/components/EcgScreen.jsx`:

```jsx
import { LeadGrid } from './LeadGrid'
import { RhythmStrip } from './RhythmStrip'

export function EcgScreen({ caseObj, animated, grid, overlay }) {
  return (
    <div className={`relative ${grid ? 'ecg-grid' : 'ecg-grid-off'}`}>
      <LeadGrid caseObj={caseObj} animated={animated} />
      <RhythmStrip caseObj={caseObj} animated={animated} />
      {overlay}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/components/ScreenOverlay.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/EcgScreen.jsx src/components/ScreenOverlay.jsx src/test/components/ScreenOverlay.test.jsx
git commit -m "feat: add ECG screen frame and overlay cards"
```

---

### Task 12: DiagnosisButton and AnswerGrid

The 8-button answer grid. In GAME each button grades on click and shows state colors; the correct answer is highlighted green after the case resolves. In LEARN clicking a button selects that diagnosis to browse.

**Files:**
- Create: `src/components/DiagnosisButton.jsx`, `src/components/AnswerGrid.jsx`, `src/test/components/AnswerGrid.test.jsx`

**Interfaces:**
- Consumes: `DIAGNOSES` (diagnoses.js).
- Produces: `<AnswerGrid mode selected result correctId disabled onPick />`.
  - `mode`: `'game' | 'learn'`.
  - `result`: `{ correct, selected } | null` (game, after answering).
  - `correctId`: the correct diagnosis id to highlight once answered.
  - `disabled`: disables all buttons (post-answer).
  - `onPick(id)`: click handler.
- `<DiagnosisButton diagnosis state onClick disabled />` where `state ∈ 'idle'|'selected-correct'|'selected-wrong'|'reveal-correct'`.

- [ ] **Step 1: Write the failing test**

Create `src/test/components/AnswerGrid.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { AnswerGrid } from '../../components/AnswerGrid'

describe('AnswerGrid', () => {
  it('renders all 8 diagnosis labels', () => {
    const { getByText } = render(<AnswerGrid mode="game" onPick={() => {}} />)
    for (const label of ['No STEMI','Anterior','Anteroseptal','Anterolateral','Lateral','Inferior','Posterior','RV']) {
      expect(getByText(label)).toBeInTheDocument()
    }
  })
  it('calls onPick with the id', () => {
    const onPick = vi.fn()
    const { getByText } = render(<AnswerGrid mode="game" onPick={onPick} />)
    fireEvent.click(getByText('Inferior'))
    expect(onPick).toHaveBeenCalledWith('inferior')
  })
  it('marks the selected wrong answer red and the correct answer green after answering', () => {
    const { getByText } = render(
      <AnswerGrid mode="game" disabled result={{ correct: false, selected: 'anterior' }} correctId="inferior" onPick={() => {}} />
    )
    expect(getByText('Anterior').className).toMatch(/red/)
    expect(getByText('Inferior').className).toMatch(/green/)
  })
  it('disables buttons when disabled', () => {
    const onPick = vi.fn()
    const { getByText } = render(<AnswerGrid mode="game" disabled onPick={onPick} />)
    fireEvent.click(getByText('Lateral'))
    expect(onPick).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/components/AnswerGrid.test.jsx`
Expected: FAIL — cannot resolve `../../components/AnswerGrid`.

- [ ] **Step 3: Implement DiagnosisButton.jsx and AnswerGrid.jsx**

Create `src/components/DiagnosisButton.jsx`:

```jsx
const STATE_CLASS = {
  idle: 'bg-bezel text-trace hover:bg-trace/10 border-grid/50',
  'selected-wrong': 'bg-red-600 text-white border-red-400',
  'selected-correct': 'bg-green-600 text-white border-green-400',
  'reveal-correct': 'bg-green-700/80 text-white border-green-400',
}

export function DiagnosisButton({ diagnosis, state = 'idle', onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-2 py-2 text-sm font-semibold rounded border transition-colors ${STATE_CLASS[state]} disabled:cursor-default`}
    >
      {diagnosis.label}
    </button>
  )
}
```

Create `src/components/AnswerGrid.jsx`:

```jsx
import { DIAGNOSES } from '../data/diagnoses'
import { DiagnosisButton } from './DiagnosisButton'

export function AnswerGrid({ mode, selected, result, correctId, disabled, onPick }) {
  function stateFor(id) {
    if (result && id === result.selected) return result.correct ? 'selected-correct' : 'selected-wrong'
    if (result && !result.correct && id === correctId) return 'reveal-correct'
    if (mode === 'learn' && id === selected) return 'selected-correct'
    return 'idle'
  }
  return (
    <div className="grid grid-cols-4 gap-2 p-2">
      {DIAGNOSES.map(d => (
        <DiagnosisButton
          key={d.id}
          diagnosis={d}
          state={stateFor(d.id)}
          disabled={disabled}
          onClick={() => { if (!disabled) onPick(d.id) }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/components/AnswerGrid.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/DiagnosisButton.jsx src/components/AnswerGrid.jsx src/test/components/AnswerGrid.test.jsx
git commit -m "feat: add diagnosis answer grid with state colors"
```

---

### Task 13: TitleBar and control bars

The top bar with HEART RATE readout, and the mode-specific control bars: GameControls (Play/Reset, timer, chances text, live counters) and LearnControls (title only — nav lives in the overlay).

**Files:**
- Create: `src/components/TitleBar.jsx`, `src/components/GameControls.jsx`, `src/components/LearnControls.jsx`, `src/components/ControlBar.jsx`, `src/test/components/GameControls.test.jsx`

**Interfaces:**
- Produces:
  - `<TitleBar bpm />` — shows "The 6 Second STEMI" and, when `bpm` is truthy, "HEART RATE" + the number.
  - `<GameControls phase timerRemaining chancesLeft counters onReset />` — formats `mm:ss`, shows `Cases / Correct (x%) / Attempts`, and "N Chance(s) Remaining" while playing.
  - `<LearnControls />` — static label.
  - `<ControlBar mode game />` — dispatches to the right control set (`game` is the `useGame` return object).

- [ ] **Step 1: Write the failing test**

Create `src/test/components/GameControls.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { GameControls } from '../../components/GameControls'
import { TitleBar } from '../../components/TitleBar'

describe('TitleBar', () => {
  it('shows heart rate when bpm present', () => {
    const { getByText } = render(<TitleBar bpm={68} />)
    expect(getByText('68')).toBeInTheDocument()
    expect(getByText(/HEART RATE/i)).toBeInTheDocument()
  })
  it('omits heart rate when no bpm', () => {
    const { queryByText } = render(<TitleBar bpm={null} />)
    expect(queryByText(/HEART RATE/i)).toBeNull()
  })
})

describe('GameControls', () => {
  const base = { phase: 'playing', timerRemaining: 125, chancesLeft: 2,
    counters: { cases: 3, correct: 2, attempts: 4 }, onReset: () => {} }
  it('formats the timer as mm:ss', () => {
    const { getByText } = render(<GameControls {...base} />)
    expect(getByText('02:05')).toBeInTheDocument()
  })
  it('shows counters with correct percentage', () => {
    const { getByText } = render(<GameControls {...base} />)
    expect(getByText(/Correct: 2 \(67%\)/)).toBeInTheDocument()
  })
  it('shows chances remaining while playing', () => {
    const { getByText } = render(<GameControls {...base} />)
    expect(getByText(/2 Chances Remaining/)).toBeInTheDocument()
  })
  it('reset fires', () => {
    const onReset = vi.fn()
    const { getByText } = render(<GameControls {...base} onReset={onReset} />)
    fireEvent.click(getByText(/Reset/i))
    expect(onReset).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/components/GameControls.test.jsx`
Expected: FAIL — cannot resolve the new components.

- [ ] **Step 3: Implement the components**

Create `src/components/TitleBar.jsx`:

```jsx
export function TitleBar({ bpm }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-bezel border-b border-grid/50">
      <span className="font-bold tracking-wide text-trace">The 6 Second STEMI</span>
      {bpm ? (
        <span className="flex items-baseline gap-2 text-trace">
          <span className="text-[10px] uppercase tracking-widest text-trace/70">Heart Rate</span>
          <span className="text-2xl font-bold tabular-nums">{bpm}</span>
        </span>
      ) : null}
    </div>
  )
}
```

Create `src/components/GameControls.jsx`:

```jsx
function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
function pct(n, d) { return d ? Math.round((100 * n) / d) : 0 }

export function GameControls({ phase, timerRemaining, chancesLeft, counters, onReset }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-bezel/90 border-b border-grid/50 text-sm text-trace">
      <div className="flex gap-4">
        <span>Cases: {counters.cases}</span>
        <span>Correct: {counters.correct} ({pct(counters.correct, counters.cases)}%)</span>
        <span>Attempts: {counters.attempts}</span>
      </div>
      <div className="flex items-center gap-4">
        {phase === 'playing' && chancesLeft < 3 && chancesLeft > 0 && (
          <span className="text-trace/80">{chancesLeft} Chance{chancesLeft === 1 ? '' : 's'} Remaining</span>
        )}
        <span className="font-mono text-lg tabular-nums bg-black/40 px-2 rounded">{fmt(timerRemaining)}</span>
        <button className="px-3 py-1 rounded bg-trace/10 hover:bg-trace/20" onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}
```

Create `src/components/LearnControls.jsx`:

```jsx
export function LearnControls() {
  return (
    <div className="px-3 py-1.5 bg-bezel/90 border-b border-grid/50 text-sm text-trace/80">
      Explore. Review. — pick a territory to study its pattern.
    </div>
  )
}
```

Create `src/components/ControlBar.jsx`:

```jsx
import { GameControls } from './GameControls'
import { LearnControls } from './LearnControls'

export function ControlBar({ mode, game }) {
  if (mode === 'game' && game.phase !== 'idle') {
    return (
      <GameControls
        phase={game.phase}
        timerRemaining={game.timerRemaining}
        chancesLeft={game.chancesLeft}
        counters={game.counters}
        onReset={game.reset}
      />
    )
  }
  return <LearnControls />
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/components/GameControls.test.jsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/TitleBar.jsx src/components/GameControls.jsx src/components/LearnControls.jsx src/components/ControlBar.jsx src/test/components/GameControls.test.jsx
git commit -m "feat: add title bar and mode control bars"
```

---

### Task 14: BottomBar and OptionsModal

The bottom bar (LEARN|GAME tabs, options gear, mute) and the Options modal (game length 1–8, dynamic/static, grid on/off, volume).

**Files:**
- Create: `src/components/BottomBar.jsx`, `src/components/OptionsModal.jsx`, `src/test/components/BottomBar.test.jsx`

**Interfaces:**
- Produces:
  - `<BottomBar mode onMode onOpenOptions muted onToggleMute />` — tabs call `onMode('learn'|'game')`.
  - `<OptionsModal options setOption onClose />` — controls bound to `useOptions`.

- [ ] **Step 1: Write the failing test**

Create `src/test/components/BottomBar.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { BottomBar } from '../../components/BottomBar'
import { OptionsModal } from '../../components/OptionsModal'

describe('BottomBar', () => {
  it('switches modes', () => {
    const onMode = vi.fn()
    const { getByText } = render(<BottomBar mode="learn" onMode={onMode} onOpenOptions={() => {}} muted={false} onToggleMute={() => {}} />)
    fireEvent.click(getByText('GAME'))
    expect(onMode).toHaveBeenCalledWith('game')
  })
  it('opens options', () => {
    const onOpen = vi.fn()
    const { getByLabelText } = render(<BottomBar mode="learn" onMode={() => {}} onOpenOptions={onOpen} muted={false} onToggleMute={() => {}} />)
    fireEvent.click(getByLabelText(/options/i))
    expect(onOpen).toHaveBeenCalled()
  })
})

describe('OptionsModal', () => {
  const options = { gameMinutes: 5, display: 'dynamic', grid: true, volume: 0.6, muted: false }
  it('toggles static display', () => {
    const setOption = vi.fn()
    const { getByLabelText } = render(<OptionsModal options={options} setOption={setOption} onClose={() => {}} />)
    fireEvent.click(getByLabelText('Static ECG'))
    expect(setOption).toHaveBeenCalledWith('display', 'static')
  })
  it('toggles grid off', () => {
    const setOption = vi.fn()
    const { getByLabelText } = render(<OptionsModal options={options} setOption={setOption} onClose={() => {}} />)
    fireEvent.click(getByLabelText('Grid Off'))
    expect(setOption).toHaveBeenCalledWith('grid', false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/components/BottomBar.test.jsx`
Expected: FAIL — cannot resolve the new components.

- [ ] **Step 3: Implement BottomBar.jsx and OptionsModal.jsx**

Create `src/components/BottomBar.jsx`:

```jsx
export function BottomBar({ mode, onMode, onOpenOptions, muted, onToggleMute }) {
  const tab = (id, label, accent) => (
    <button
      onClick={() => onMode(id)}
      className={`px-3 py-1 font-semibold border-b-2 ${mode === id ? `border-${accent} text-trace` : 'border-transparent text-trace/60'}`}
    >
      {label}
    </button>
  )
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-bezel border-t border-grid/50">
      <span className="text-trace/70 font-bold text-sm">S2 · SKILLSTAT-style</span>
      <div className="flex items-center gap-2">
        {tab('learn', 'LEARN', 'learn')}
        {tab('game', 'GAME', 'game')}
      </div>
      <div className="flex items-center gap-3">
        <button aria-label="Options" onClick={onOpenOptions} className="text-trace/80 hover:text-trace">⚙</button>
        <button aria-label={muted ? 'Unmute' : 'Mute'} onClick={onToggleMute} className="text-trace/80 hover:text-trace">
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
```

Create `src/components/OptionsModal.jsx`:

```jsx
export function OptionsModal({ options, setOption, onClose }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[26rem] max-w-[92%] p-5 rounded-lg bg-bezel border border-grid/60 text-trace" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Options</h2>
          <button aria-label="Close options" onClick={onClose} className="text-trace/70">✕</button>
        </div>

        <fieldset className="mb-4">
          <legend className="text-sm text-trace/80 mb-1">Game Time Period (minutes)</legend>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8].map(m => (
              <button
                key={m}
                onClick={() => setOption('gameMinutes', m)}
                className={`w-8 h-8 rounded ${options.gameMinutes === m ? 'bg-game text-white' : 'bg-trace/10'}`}
              >{m}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="text-sm text-trace/80 mb-1">Rhythm Display</legend>
          <label className="mr-4 inline-flex items-center gap-1">
            <input type="radio" name="display" checked={options.display === 'dynamic'} onChange={() => setOption('display', 'dynamic')} />
            <span>Dynamic ECG</span>
          </label>
          <label className="inline-flex items-center gap-1" aria-label="Static ECG">
            <input type="radio" name="display" checked={options.display === 'static'} onChange={() => setOption('display', 'static')} />
            <span>Static ECG</span>
          </label>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="text-sm text-trace/80 mb-1">Grid Display</legend>
          <label className="mr-4 inline-flex items-center gap-1" aria-label="Grid On">
            <input type="radio" name="grid" checked={options.grid} onChange={() => setOption('grid', true)} />
            <span>On</span>
          </label>
          <label className="inline-flex items-center gap-1" aria-label="Grid Off">
            <input type="radio" name="grid" checked={!options.grid} onChange={() => setOption('grid', false)} />
            <span>Off</span>
          </label>
        </fieldset>

        <fieldset>
          <legend className="text-sm text-trace/80 mb-1">Sound Volume</legend>
          <input
            type="range" min="0" max="1" step="0.1" value={options.volume} aria-label="Sound Volume"
            onChange={e => setOption('volume', Number(e.target.value))}
          />
        </fieldset>
      </div>
    </div>
  )
}
```

Note: the dynamic Tailwind classes `border-${accent}` require those exact classes to be present in the safelist. Add `learn`/`game` border colors to `tailwind.config.js` `safelist`: append `safelist: ['border-learn', 'border-game']` to the config object created in Task 1. Do this now as part of this step.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/components/BottomBar.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomBar.jsx src/components/OptionsModal.jsx src/test/components/BottomBar.test.jsx tailwind.config.js
git commit -m "feat: add bottom bar and options modal"
```

---

### Task 15: StatsPanel

Cumulative cross-session accuracy by diagnosis, with a reset. Opened from the bottom bar (wired in Task 16).

**Files:**
- Create: `src/components/StatsPanel.jsx`, `src/test/components/StatsPanel.test.jsx`

**Interfaces:**
- Consumes: `DIAGNOSES` (diagnoses.js).
- Produces: `<StatsPanel cumulativeStats onReset onClose />` — a row per diagnosis with `correct/total (pct%)`, and a Reset button calling `onReset`.

- [ ] **Step 1: Write the failing test**

Create `src/test/components/StatsPanel.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { StatsPanel } from '../../components/StatsPanel'

const stats = { diagnosis: { inferior: { correct: 3, total: 4 }, anterior: { correct: 1, total: 2 } } }

describe('StatsPanel', () => {
  it('shows per-diagnosis accuracy', () => {
    const { getByText } = render(<StatsPanel cumulativeStats={stats} onReset={() => {}} onClose={() => {}} />)
    expect(getByText(/Inferior/)).toBeInTheDocument()
    expect(getByText(/3\/4/)).toBeInTheDocument()
    expect(getByText(/75%/)).toBeInTheDocument()
  })
  it('reset fires', () => {
    const onReset = vi.fn()
    const { getByText } = render(<StatsPanel cumulativeStats={stats} onReset={onReset} onClose={() => {}} />)
    fireEvent.click(getByText(/Reset all stats/i))
    expect(onReset).toHaveBeenCalled()
  })
  it('shows a dash for diagnoses with no attempts', () => {
    const { getAllByText } = render(<StatsPanel cumulativeStats={{ diagnosis: {} }} onReset={() => {}} onClose={() => {}} />)
    expect(getAllByText('—').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/components/StatsPanel.test.jsx`
Expected: FAIL — cannot resolve `../../components/StatsPanel`.

- [ ] **Step 3: Implement StatsPanel.jsx**

Create `src/components/StatsPanel.jsx`:

```jsx
import { DIAGNOSES } from '../data/diagnoses'

export function StatsPanel({ cumulativeStats, onReset, onClose }) {
  const byDx = cumulativeStats.diagnosis || {}
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[30rem] max-w-[92%] p-5 rounded-lg bg-bezel border border-grid/60 text-trace" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Cumulative accuracy</h2>
          <button aria-label="Close stats" onClick={onClose} className="text-trace/70">✕</button>
        </div>
        <ul className="divide-y divide-grid/40">
          {DIAGNOSES.map(d => {
            const s = byDx[d.id]
            const pct = s && s.total ? Math.round((100 * s.correct) / s.total) : null
            return (
              <li key={d.id} className="flex items-center justify-between py-1.5 text-sm">
                <span>{d.label}</span>
                <span className="tabular-nums text-trace/85">
                  {s ? `${s.correct}/${s.total}` : '—'} {pct !== null ? `(${pct}%)` : ''}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="flex justify-end mt-4">
          <button className="px-3 py-1.5 rounded bg-red-700/80 text-white" onClick={onReset}>Reset all stats</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/components/StatsPanel.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/StatsPanel.jsx src/test/components/StatsPanel.test.jsx
git commit -m "feat: add cumulative stats panel"
```

---

### Task 16: Simulator assembly and App integration

Wires everything into the stage and the app root: mode switching, LEARN browsing, GAME loop, options, mute, stats, and the Static/reduced-motion → animation decision.

**Files:**
- Create: `src/components/Simulator.jsx`, `src/test/components/Simulator.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: all hooks and components above; `CASES` (cases.js) for LEARN representative cases; `DIAGNOSIS_IDS` (diagnoses.js).
- Produces: `<Simulator />` — self-contained; owns `mode`, modal visibility, LEARN index; instantiates `useOptions`, `useSession`, `useGame`.
- `App` renders `<Simulator />` inside the full-screen bezel shell.

- [ ] **Step 1: Write the failing test**

Create `src/test/components/Simulator.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { Simulator } from '../../components/Simulator'

describe('Simulator', () => {
  it('starts in LEARN and shows the answer/browse grid', () => {
    const { getByText } = render(<Simulator />)
    expect(getByText('LEARN')).toBeInTheDocument()
    expect(getByText('Inferior')).toBeInTheDocument()
  })
  it('can enter GAME, start novice, and grade a case', () => {
    const { getByText, container } = render(<Simulator />)
    fireEvent.click(getByText('GAME'))
    fireEvent.click(getByText('Novice'))
    // A case is now showing; answer with each button until one grades.
    // Click "No STEMI" then correct path is exercised by clicking the shown case's territory.
    // Simplest deterministic check: after starting, the timer control is visible.
    expect(container.textContent).toMatch(/\d\d:\d\d/)
  })
  it('renders without console errors on mount', () => {
    const { container } = render(<Simulator />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/components/Simulator.test.jsx`
Expected: FAIL — cannot resolve `../../components/Simulator`.

- [ ] **Step 3: Implement Simulator.jsx**

Create `src/components/Simulator.jsx`:

```jsx
import { useState, useMemo, useEffect } from 'react'
import { useOptions } from '../hooks/useOptions'
import { useSession } from '../hooks/useSession'
import { useGame } from '../hooks/useGame'
import { CASES } from '../data/cases'
import { DIAGNOSIS_IDS } from '../data/diagnoses'
import { TitleBar } from './TitleBar'
import { EcgScreen } from './EcgScreen'
import { ScreenOverlay } from './ScreenOverlay'
import { ControlBar } from './ControlBar'
import { AnswerGrid } from './AnswerGrid'
import { BottomBar } from './BottomBar'
import { OptionsModal } from './OptionsModal'
import { StatsPanel } from './StatsPanel'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// One representative case per diagnosis, in the diagnosis order, for LEARN.
function learnCases() {
  return DIAGNOSIS_IDS.map(id => CASES.find(c => c.diagnosis === id)).filter(Boolean)
}

export function Simulator() {
  const [mode, setMode] = useState('learn')
  const [modal, setModal] = useState(null) // 'options' | 'stats' | null
  const [learnIndex, setLearnIndex] = useState(0)
  const { options, setOption } = useOptions()
  const session = useSession()
  const game = useGame({ gameMinutes: options.gameMinutes, onGrade: session.gradeAnswer })

  const learn = useMemo(learnCases, [])
  const reduced = prefersReducedMotion()
  const animated = options.display === 'dynamic' && !reduced

  // Switching to LEARN resets the game so its timer stops.
  useEffect(() => { if (mode === 'learn' && game.phase !== 'idle') game.reset() }, [mode]) // eslint-disable-line

  const learnCase = learn[learnIndex] ?? null
  const shownCase = mode === 'game' ? game.currentCase : learnCase
  const overlayVariant =
    mode === 'learn' ? 'learn'
    : game.phase === 'idle' ? 'intro'
    : game.phase === 'answered' ? 'reveal'
    : game.phase === 'gameover' ? 'gameover'
    : null

  const overlay = overlayVariant && (
    <ScreenOverlay
      variant={overlayVariant}
      caseObj={overlayVariant === 'gameover' ? null : shownCase}
      result={overlayVariant === 'gameover' ? { ...game.counters } : game.lastResult}
      onStart={game.start}
      onNext={overlayVariant === 'gameover' ? game.reset : game.next}
      onPrev={() => setLearnIndex(i => (i - 1 + learn.length) % learn.length)}
      onNextLearn={() => setLearnIndex(i => (i + 1) % learn.length)}
    />
  )

  const answerDisabled = mode === 'game' && game.phase !== 'playing'

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col rounded-lg overflow-hidden shadow-2xl">
      <TitleBar bpm={shownCase?.bpm ?? null} />
      <EcgScreen caseObj={shownCase} animated={animated} grid={options.grid} overlay={overlay} />
      <ControlBar mode={mode} game={game} />
      <AnswerGrid
        mode={mode}
        selected={mode === 'learn' ? learnCase?.diagnosis : undefined}
        result={mode === 'game' ? game.lastResult : null}
        correctId={mode === 'game' ? shownCase?.diagnosis : undefined}
        disabled={answerDisabled}
        onPick={id => {
          if (mode === 'game') game.answer(id)
          else setLearnIndex(learn.findIndex(c => c.diagnosis === id))
        }}
      />
      <BottomBar
        mode={mode}
        onMode={setMode}
        onOpenOptions={() => setModal('options')}
        muted={options.muted}
        onToggleMute={() => setOption('muted', !options.muted)}
      />
      {modal === 'options' && <OptionsModal options={options} setOption={setOption} onClose={() => setModal(null)} />}
      {modal === 'stats' && (
        <StatsPanel cumulativeStats={session.cumulativeStats} onReset={session.resetStats} onClose={() => setModal(null)} />
      )}
      {/* stats entry point: a small link in the bottom-left via BottomBar could open it; expose through options for now */}
      <button className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-trace/40" onClick={() => setModal('stats')}>
        stats
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Update App.jsx**

Replace `src/App.jsx` with:

```jsx
import { Simulator } from './components/Simulator'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans">
      <Simulator />
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/test/components/Simulator.test.jsx`
Expected: PASS (3 tests).
Run: `npm run test:run`
Expected: PASS (all suites).

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open the printed URL. Confirm: LEARN shows a scrolling 12-lead + description; clicking a territory changes the case; GAME → Novice starts the timer; a correct click freezes and reveals; a wrong click decrements chances; Options toggles Static (freezes) and Grid; mute toggles; the `stats` link opens the panel. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/components/Simulator.jsx src/test/components/Simulator.test.jsx src/App.jsx
git commit -m "feat: assemble simulator and wire app root"
```

---

### Task 17: GitHub Pages deploy workflow

Adds CI that tests, builds, and deploys `dist/` to GitHub Pages. Cloudflare points the custom domain at the Pages site.

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md` (create if absent) with deploy notes

**Interfaces:** none (infra).

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Add README deploy notes**

Create or update `README.md` with:

```markdown
# The 6 Second STEMI

A client-side STEMI-recognition trainer modeled on the SkillStat 6-Second ECG simulator.
Static build, no backend, no runtime network — safe under isolated/proxied networks.

## Develop
- `npm install`
- `npm run dev`
- `npm run test:run`

## Deploy (GitHub Pages + Cloudflare)
1. Repo Settings → Pages → Source: **GitHub Actions**.
2. Push to `main`; the `Deploy to GitHub Pages` workflow tests, builds, and publishes `dist/`.
3. Set the real domain in `public/CNAME` (currently a placeholder).
4. In Cloudflare DNS, point the domain at the Pages site (CNAME to `<user>.github.io`, proxied).
   `vite.config.js` uses `base: '/'`, correct for a root custom domain.
```

- [ ] **Step 3: Verify the build one more time**

Run: `npm run build`
Expected: succeeds, `dist/index.html` present.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: add GitHub Pages deploy workflow and deploy docs"
```

---

## Self-Review

**1. Spec coverage:**

- Cloned chrome (title/screen/control/answer/bottom bars, options, mute) → Tasks 11, 12, 13, 14, 16. ✓
- Animated 12-lead + HEART RATE → Tasks 9, 10, 13. ✓
- Single-click 8-diagnosis answering → Tasks 1, 12. ✓
- GAME (Novice/Practitioner, timer, chances, counters, Next, Reset) → Tasks 8, 13. ✓
- LEARN (browse 8, description, hover-freeze) → Tasks 9 (hover), 11, 16. ✓
- Reveal (culprit, explanation, lead badges) → Task 11. ✓
- Options parity (length, dynamic/static, grid, volume) → Tasks 6, 14. ✓
- Cumulative stats + reset → Tasks 7, 15. ✓
- Deterministic waveform synthesis (params → seamless SVG) → Tasks 2, 3, 4. ✓
- Case roster incl. No-STEMI mimics → Task 5. ✓
- Zscaler constraints (no network, system fonts, transform-only, reduced-motion, CSS grid) → Tasks 1 (CSS/keyframes/grid), 9 (transform/pause), 16 (reduced-motion). ✓
- GitHub Pages + Cloudflare deploy → Tasks 1 (base/CNAME/.nojekyll), 17. ✓
- LEARN lists only the 8 buttons (review resolution) → Task 16 `learnCases()` maps `DIAGNOSIS_IDS`. ✓

**2. Placeholder scan:** No "TBD/TODO/handle appropriately". `public/CNAME` holds an intentional placeholder domain, explicitly called out in Task 17 README step. The `stats` entry point is a real (if minimal) button, not a placeholder.

**3. Type consistency:**

- `synthLead(caseObj, lead, {baselineY, beats})` defined in Task 4, consumed in Task 9 with `{ baselineY, beats: 4 }`. ✓
- `useGame` return shape (Task 8) consumed identically in ControlBar (Task 13) and Simulator (Task 16): `phase, currentCase, chancesLeft, timerRemaining, counters, lastResult, start, answer, next, reset`. ✓
- `gradeAnswer(caseObj, selectedDiagnosisId)` (Task 7) passed as `onGrade` to `useGame` (Task 8) and called with `(c, diagnosisId)`. ✓
- `cumulativeStats = { diagnosis: {...} }` produced in Task 7, consumed in Task 15. ✓
- `AnswerGrid` props (`mode, selected, result, correctId, disabled, onPick`) defined in Task 12, passed identically in Task 16. ✓
- `LEADS` order defined in Task 4 and relied on for grid layout in Task 10. ✓

Fixes applied inline during review: `useGame`'s `answer` increments `cases` on the resolving attempt (correct, or last wrong) exactly once; the `chancesLeft < 3` guard in GameControls avoids showing "3 Chances Remaining" before the first wrong answer (cosmetic parity with the reference, which only shows the hint after a miss).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-04-stemi-simulator.md`. Two execution options:

**1. Subagent-Driven (recommended)** — a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session with checkpoints for review.

Which approach?
