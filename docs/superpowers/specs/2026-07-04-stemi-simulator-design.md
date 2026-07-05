# Six-Second STEMI — Simulator Design Spec

**Date:** 2026-07-04
**Status:** Approved (2026-07-04)
**Supersedes:** `2026-06-26-stemi-design.md` (static-image, two-column territory+vessel design). This spec replaces the interaction model and screen; the localStorage/stats plumbing and the React/Vite/Vitest scaffold carry over.

## Overview

A shareable, browser-based ECG trainer that reproduces the **look, feel, and interaction** of the simulator portion of SkillStat's *6 Second ECG Simulator (Classic)* — but the skill being drilled is **STEMI recognition and localization** instead of rhythm identification.

The user is shown an animated 12-lead ECG and must identify the STEMI territory (or call "No STEMI") in one click. Immediate grading with a teaching reveal that names the culprit vessel and reciprocal findings. Runs entirely client-side, hosts on GitHub Pages behind a Cloudflare domain, and stays smooth even when isolated by Zscaler.

Reference: <https://www.skillstat.com/tools/ecg-simulator-classic>

## How the reference works (verified by DOM inspection)

The reference simulator is a self-contained static HTML app loaded in an `<iframe>` from
`.../assets/ecg-simulator/html5/index.html`. Findings that drive this design:

- **No `<canvas>`.** Each rhythm is a single pre-rendered PNG (`rhys/rNN.png`) set as the `background-image` of a fixed-size trace div (928×105). The strip **tiles horizontally** and scrolls by animating `background-position` (measured ~130 px/s). A separate `grid.png` sits behind it.
- Motion is therefore **pure CSS on a single property**, GPU-friendly, with zero per-frame JavaScript. This is why it is robust under constrained/isolated networks — and it is the technique we mirror.
- **Two modes** share the bezel:
  - **LEARN** ("Explore. Review."): a wall of 27 rhythm names in five columns. Click a name → that rhythm animates on-screen with a title + description. Hovering the trace **freezes** the animation. Prev/next arrows page through descriptions.
  - **GAME** ("Explore. Review. Play."): choose **Novice** or **Practitioner**, press **Play**. A countdown timer runs (configurable 1–8 min via Options). Identify the displayed rhythm by clicking its name. Correct → timer freezes, advance with **Next Rhythm**. Wrong → "N Chances Remaining" decrements; after chances are exhausted the correct answer is revealed. Live counters show **Rhythms / Correct (%) / Attempts (%)**. **Reset** ends the game.
- **Bottom bar:** SkillStat logo, `LEARN | GAME` tabs, an Options gear, a mute speaker, a fullscreen/pop-out icon.
- **Options modal:** Game Time Period (1–8 min), Sound Volume, **Dynamic vs Static Rhythm Display**, **Grid Display On/Off**.

We reproduce this structure faithfully, swapping rhythm content for STEMI content and the 1-lead trace for a 12-lead grid.

## Scope (v1)

**In scope:**

- Cloned simulator chrome: title bar, ECG screen, control bar, 8-button answer grid, bottom bar with `LEARN | GAME` tabs, Options modal, mute.
- **12-lead animated display**: 4×3 grid of independently scrolling synthesized lead traces + HEART RATE (BPM) readout.
- **Single-click territory answering** over 8 diagnoses: `No STEMI, Anterior, Anteroseptal, Anterolateral, Lateral, Inferior, Posterior, RV`.
- **GAME mode**: Novice/Practitioner, countdown timer, chances-per-case, live Cases/Correct/Attempts counters, Next Case, Reset.
- **LEARN mode**: browse each diagnosis, see it animate with a teaching description, hover-to-freeze.
- **Reveal panel** teaching culprit vessel + reciprocal/associated findings + affected-lead badges.
- **Options** parity: game length, dynamic/static, grid on/off, volume/mute.
- **Cumulative cross-session stats** (localStorage) with accuracy by diagnosis, plus a reset.
- **Deterministic waveform synthesis** so cases are data (JSON), not image assets.

**Out of scope for v1:**

- Named STEMI-equivalents as their own answer buttons (Wellens, de Winter, Sgarbossa, isolated posterior, aVR-STE). The data model reserves a `difficulty: "equivalent"` flag for later. Mimics appear in v1 only *inside* the "No STEMI" bucket.
- User accounts, cloud sync, leaderboards.
- Any server, API, or AI-generated content.
- Audio beyond a mute toggle stub (optional QRS click can land later; not required for v1).

## UX / Interaction Design

### Screen layout (desktop)

```
┌──────────────────────────────────────────────────────────┐
│  The 6 Second STEMI                          HEART RATE   │  title bar
│  ┌────────────────────────────────────────────────────┐  │
│  │  I    │  aVR  │  V1   │  V4   │                     │  │
│  │  II   │  aVL  │  V2   │  V5   │   4×3 lead grid,    │  │  ECG screen
│  │  III  │  aVF  │  V3   │  V6   │   each cell a       │  │  (dark, gridded)
│  │  ── rhythm strip (lead II), full width ──────────── │  │
│  └────────────────────────────────────────────────────┘  │
│  Cases: 3   Correct: 2 (67%)   Attempts: 4      02:41  ▮  │  control bar
│  ┌──────────┬──────────┬──────────┬──────────┐           │
│  │ No STEMI │ Anterior │Anterosept│Anterolat │           │  answer grid
│  ├──────────┼──────────┼──────────┼──────────┤           │  (8 buttons)
│  │ Lateral  │ Inferior │Posterior │    RV     │           │
│  └──────────┴──────────┴──────────┴──────────┘           │
│  [S2]  logo            LEARN | GAME      ⚙  🔊  ⤢          │  bottom bar
└──────────────────────────────────────────────────────────┘
```

The screen is a fixed-aspect stage (like the original's bezel), centered and scaled to fit
its container so proportions never break. The standard 12-lead arrangement is 4 columns ×
3 rows (I/II/III, aVR/aVL/aVF, V1–V3, V4–V6) with a **lead-II rhythm strip** spanning the
bottom — the clinical convention and enough vertical space for the answer to be readable.

### Mobile / narrow

Below ~700px the stage keeps its aspect ratio and scales down; the answer grid reflows to
2 columns beneath the screen. The 12-lead grid stays 4×3 (it is the ECG — it must not
reflow), but the stage as a whole shrinks. Static mode is auto-preferred on very small or
reduced-motion contexts.

### Modes

**LEARN.** The answer grid becomes a browse list of the 8 diagnoses (plus, optionally, the
named mimics for teaching). Clicking one shows a representative case animating with its
title and full teaching description. Hovering the ECG **freezes** all lead animation
(matches the original's freeze-on-hover). Prev/next arrows page through the diagnoses.

**GAME.** Intro card: "Explore. Review. Play." with **Novice** / **Practitioner**.
Pressing a difficulty starts play:

- A case is drawn; all 12 leads animate; the HEART RATE shows the case BPM.
- Timer counts down from the configured game length.
- Player clicks one diagnosis button:
  - **Correct** → timer freezes, button turns green, reveal panel shows, **Next Case** appears.
  - **Wrong** → button turns red, "N Chances Remaining" decrements. Novice = 3 chances, Practitioner = 1. When chances hit 0 the correct button is highlighted green and the reveal panel shows.
- **Next Case** draws the next case and resumes the timer.
- Live counters: **Cases** (attempted), **Correct (x%)**, **Attempts (y%)** — same triple as the original.
- Timer reaching 0, or **Reset**, ends the game → end-of-game summary card (score + accuracy), which also folds into cumulative stats.

**Difficulty** is a case filter/flag, not just a chances count:

- *Novice*: textbook classic cases (`difficulty: "classic"`), obvious ST elevation, 3 chances.
- *Practitioner*: adds subtler elevations and a higher share of mimics under "No STEMI"; 1 chance.

### Answer button states

| State | Visual |
|-|-|
| Idle | Neutral, readable on dark chrome |
| Hover (playing) | Subtle highlight |
| Selected → correct | Green |
| Selected → incorrect | Red |
| Correct answer after chances exhausted | Green outline/fill on the right button |
| Disabled (post-answer, pre-Next) | Muted |

### Reveal panel

Replaces/overlays the lower area after grading, e.g.:

```
✓ Inferior STEMI                                    Culprit: RCA (~80%)
ST elevation in II, III, aVF with reciprocal depression in I and aVL.
STE greater in III than II favors RCA over LCx. Check V4R for RV involvement.
[II] [III] [aVF]                                          [ Next Case → ]
```

Shows verdict, culprit vessel, the teaching `explanation`, and `leads_affected` badges.
For "No STEMI" cases it names the actual pattern (e.g. "Benign early repolarization —
concave ST elevation with notched J-points; no reciprocal change").

### Options modal (parity with reference)

- **Game Time Period**: 1–8 minutes (default 5).
- **Display**: Dynamic (animated) vs **Static ECG** (frozen). Static is forced when the OS
  requests reduced motion.
- **Grid Display**: On/Off (toggles the ECG graph-paper background).
- **Sound Volume / Mute**: volume slider + the bottom-bar mute toggle. v1 audio is a stub;
  the control persists the setting even if no sound plays yet.

Options persist to localStorage.

## Waveform Synthesis (the core technical piece)

Cases are **data, not images**. Each of the 12 leads is drawn from a compact morphology
description and rendered to a **seamless-tiling SVG path**, then scrolled with CSS.

### Model

A single heartbeat is composed from parametric wave components on a baseline:

- **P wave** — small bump before QRS (amplitude/width per lead; can be absent/inverted).
- **QRS complex** — Q/R/S deflections with per-lead amplitude and polarity (encodes the
  lead's normal axis so V1 is rS, V6 is qR, aVR is negative, etc.).
- **ST segment** — a horizontal offset; **this is where STEMI lives.** A per-diagnosis
  **ST-vector** assigns an elevation (mm→px) or depression to each lead.
- **T wave** — rounded deflection; can be hyperacute (tall) or inverted per pattern.

The synthesizer produces a path for **exactly N whole beats** whose left and right edges
meet at the same baseline Y, so two copies laid end-to-end tile seamlessly. Beat spacing is
derived from the case **BPM** (RR interval), so the on-screen rate matches the HEART RATE
readout.

### Diagnosis templates → ST vectors

A template maps a diagnosis to which leads are elevated/depressed and by how much, e.g.:

| Diagnosis | Elevated leads | Reciprocal depression | Culprit |
|-|-|-|-|
| Anterior | V1–V4 (esp. V2–V4) | II, III, aVF (often) | LAD |
| Anteroseptal | V1–V2(–V3) | — | LAD (proximal) |
| Anterolateral | V1–V6, I, aVL | — | LAD (proximal) |
| Lateral | I, aVL, V5–V6 | II, III, aVF | LCx |
| Inferior | II, III, aVF | I, aVL | RCA (usually) |
| Posterior | (reciprocal) V1–V3 depression, tall R | inferred | RCA/LCx |
| RV | III > II, V1; V4R | I, aVL | RCA (proximal) |
| No STEMI → normal | none | none | — |
| No STEMI → BER | concave STE V2–V5, notched J | none | — |
| No STEMI → LVH | ST/T "strain" (secondary) | — | — |
| No STEMI → pericarditis | diffuse concave STE, PR depression | aVR (PR elevation) | — |

Each **case** in JSON references a diagnosis template, a BPM, a rhythm baseline (default
NSR), an `answer` (one of the 8 buttons), the teaching `explanation`, `culprit`,
`leads_affected`, `difficulty`, and optional per-lead overrides. The `answer` for every
mimic is `No STEMI`; the reveal text names the specific mimic.

### Rendering & animation

- Each lead cell contains a horizontal **track** holding **two identical SVG copies** of the
  lead's tile. The track is animated with a single linear, infinite
  `@keyframes scroll { to { transform: translateX(-50%) } }`.
- All 12 tracks share the **same duration** so the whole 12-lead moves as one coherent
  sweep. `transform` only → GPU-composited, no layout/paint per frame, no JS timer.
- `will-change: transform` on tracks; `prefers-reduced-motion` and the Static toggle set
  `animation-play-state: paused` (or omit the animation) → an instantly-frozen, fully
  readable 12-lead.
- Hover-to-freeze (LEARN) pauses `animation-play-state`.
- The **graph-paper grid** is a pure CSS `repeating-linear-gradient` (no image request),
  toggled by the Grid option.

### Why this over alternatives

- **vs. build-time PNG strips (the reference's own method):** SVG-from-params keeps cases as
  tiny JSON, preserves "add a case = edit JSON", and avoids shipping/​downloading dozens of
  PNGs — better for Zscaler and for authoring. The rendering path is still CSS-transform
  animation, identical in performance profile. If profiling ever shows SVG cost matters, the
  same generator can pre-rasterize to PNG without changing the data model. (Documented
  fallback, not v1 work.)
- **vs. `<canvas>` + rAF:** canvas repaints every frame on the CPU/GPU and is the most
  fragile choice under isolation; rejected.

## Architecture

**Stack:** React + Vite + Tailwind CSS + Vitest (existing scaffold). No backend. Static build.

### Component tree

```
App                         — owns mode ('learn'|'game'), options, useSession
└── Simulator               — the bezel/stage; scales to container, fixed aspect
    ├── TitleBar            — "The 6 Second STEMI" + HEART RATE readout
    ├── EcgScreen
    │   ├── LeadGrid        — 4×3 layout of Lead
    │   │   └── Lead ×12    — SVG track, CSS-animated; freeze on hover/static
    │   ├── RhythmStrip     — full-width lead-II strip
    │   └── ScreenOverlay   — intro card / reveal panel / learn description
    ├── ControlBar
    │   ├── GameControls    — Play/Reset, timer, chances, Cases/Correct/Attempts
    │   └── LearnControls   — prev/next, title
    ├── AnswerGrid          — 8 DiagnosisButton (game) OR browse list (learn)
    ├── BottomBar           — logo, LEARN|GAME tabs, options gear, mute
    └── OptionsModal        — time period, dynamic/static, grid, volume
└── StatsPanel              — cumulative accuracy by diagnosis + reset (modal from bottom bar)
```

### State ownership

- **`App`**: `mode`, `options` (persisted), and `useSession()`.
- **`useGame` hook** (new): the GAME state machine —
  `phase: 'idle' | 'playing' | 'answered' | 'gameover'`, `deck`, `currentCase`,
  `chancesLeft`, `timerRemaining`, live `counters {cases, correct, attempts}`, and actions
  `start(difficulty)`, `answer(diagnosis)`, `next()`, `reset()`, `tick()`. Timer via a
  single `setInterval` at 1 Hz (not per-frame).
- **`useSession` hook** (kept, adapted): cumulative cross-session stats in localStorage,
  now keyed by **diagnosis/territory** only (vessel is no longer a graded axis).
  `gradeAnswer` simplifies to a single correctness axis. `resetStats` unchanged.
- **Waveform synth** is pure functions in `src/waveform/` — no React state.

### Files

```
six-second-stemi/
├── public/
│   └── CNAME                         — Cloudflare custom domain for Pages
├── src/
│   ├── data/
│   │   ├── diagnoses.js              — 8 answer buttons + display labels
│   │   ├── templates.js             — diagnosis → ST-vector / morphology template
│   │   └── cases.json               — case roster (data, not images)
│   ├── waveform/
│   │   ├── beat.js                  — build one beat's component path
│   │   ├── lead.js                  — assemble N seamless beats for a lead
│   │   └── synth.js                 — case + lead → SVG path string (pure, tested)
│   ├── hooks/
│   │   ├── useSession.js            — cumulative stats (adapted)
│   │   ├── useGame.js               — GAME state machine (new)
│   │   └── useOptions.js            — options + localStorage (new)
│   ├── components/                  — see tree above
│   ├── App.jsx
│   └── main.jsx
├── .github/workflows/deploy.yml     — build + deploy to GitHub Pages
├── vite.config.js                   — base '/', react + vitest
└── tailwind.config.js
```

The existing `constants.js` (TERRITORIES/VESSELS) is replaced by `diagnoses.js` and
`templates.js`. Existing components (`ECGViewer`, `AnswerPanel`, `ChoiceList`,
`RevealPanel`, `StatsScreen`, `PracticeScreen`, `Header`) are **superseded**; their tested
logic (grading, session, shuffle) is salvaged into the new hooks/components rather than
kept as-is. Nothing in the current tree is assumed correct — it is re-derived against this
spec.

## Data flow

### Startup

1. Bundle `cases.json` + templates at build time (no network).
2. Read `options` and `cumulativeStats` from localStorage (or defaults).
3. Idle in the last-used mode (default LEARN).

### GAME cycle

1. `start(difficulty)` → filter deck by difficulty, shuffle, draw first case, start timer.
2. `synth(case, lead)` builds 12 SVG tiles; leads animate.
3. `answer(dx)` → grade against `case.answer`; update chances/counters; on resolve, write to
   cumulative stats; show reveal.
4. `next()` → draw next case, reset chances, resume timer.
5. Timer 0 or deck empty or `reset()` → `gameover` summary.

### localStorage schema

```json
{
  "stemi-cumulative-stats": {
    "diagnosis": {
      "inferior":  { "correct": 3, "total": 4 },
      "anterior":  { "correct": 2, "total": 3 },
      "no-stemi":  { "correct": 5, "total": 6 }
    }
  },
  "stemi-options": {
    "gameMinutes": 5, "display": "dynamic", "grid": true, "volume": 0.6, "muted": false
  }
}
```

Live game counters are in-memory only; cumulative stats persist across sessions. StatsPanel
renders accuracy per diagnosis with a reset.

## Error handling & edge cases

- **Empty/filtered deck** (e.g. a difficulty with no cases) → disable that difficulty button
  with a tooltip; never start an empty game.
- **Corrupt localStorage** → `try/catch` falls back to defaults (existing pattern in
  `useSession`).
- **Synth guarantees** → generator asserts first/last baseline Y match (seamless tile);
  unit-tested. Out-of-range ST offsets are clamped so a lead never draws outside its cell.
- **Reduced motion / Static** → no animation started; screen shows a frozen, readable 12-lead.
- **Rapid clicks** → answer buttons disable immediately on first grade until `next()`.
- **Timer/interval cleanup** on unmount, mode switch, and reset to avoid leaks.

## Testing strategy

Vitest + React Testing Library (jsdom), matching the existing setup.

- **Waveform synth (pure, highest-value):** determinism (same input → same path), seamless
  tiling (start Y == end Y), ST-vector correctness (elevated leads offset up in the path;
  reciprocal leads down), BPM → beat-count/RR spacing, clamping.
- **`useGame` state machine:** start/answer/next/reset transitions, chances by difficulty,
  correct freezes timer, counters and percentages, deck exhaustion → gameover.
- **`useSession`:** grading updates the right diagnosis bucket; persistence; reset.
- **Components:** AnswerGrid state colors; reveal panel content; mode switching; Options
  toggles drive `data-*`/class changes; Static/reduced-motion disables animation.
- **Smoke (optional, Playwright):** app mounts, a game can be played to a grade without
  console errors, animation classes present. Kept light to avoid CI flakiness.

Animation *timing* itself is not asserted (jsdom can't); we assert the presence/absence of
the animation and the correctness of the generated geometry.

## Deployment

- **Build:** `vite build` → `dist/`. `base: '/'` (served at domain root via the Cloudflare
  custom domain). Add `.nojekyll` and a `public/CNAME` with the domain.
- **CI:** `.github/workflows/deploy.yml` — on push to `main`: install, `npm test`,
  `npm run build`, deploy `dist/` to GitHub Pages (`actions/deploy-pages`).
- **Cloudflare:** DNS points the custom domain at the Pages site; Pages serves static
  assets only. Nothing dynamic, so Cloudflare/Zscaler caching is safe.

## Zscaler / isolation requirements (hard constraints)

1. **No runtime network** after initial load — all cases, templates, fonts, and styles are
   bundled. No CDNs, web fonts, analytics, sockets, or fetches.
2. **System font stack** only (no downloaded fonts).
3. **Animation is `transform`-only**, GPU-composited, single shared timeline; no `<canvas>`,
   no `requestAnimationFrame` render loop, no per-frame JS. Timer is 1 Hz `setInterval`.
4. **`prefers-reduced-motion` honored** and a **Static toggle** provides a fully functional
   no-animation experience.
5. **CSS grid background** (gradient), not an image, so the graph paper needs no asset.
6. Keep concurrent animated layers bounded (12 lead tracks + shared keyframe) and profiled.

## Resolved at review (2026-07-04)

- Runtime SVG synthesis: **confirmed** (PNG pre-raster remains a documented fallback only).
- Default game length: **5 minutes**, configurable 1–8.
- Lead-II rhythm strip at the bottom: **confirmed** (13 traces total).
- LEARN lists **only the 8 diagnosis buttons** — mimics are taught solely through
  "No STEMI" reveal text, never as separate LEARN entries.

## Open questions (deferred, not blocking)

- Exact case count for launch and how many mimics under "No STEMI".
- Whether v1 ships a QRS-click sound or leaves audio as a persisted-but-silent stub.
- Final visual theme (reference-blue "LEARN" / orange "GAME" screen tints vs. a neutral
  clinical palette) — cosmetic, resolved during implementation.
