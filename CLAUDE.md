# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A client-side STEMI-recognition trainer (12-lead ECG simulator) modeled on the SkillStat 6-Second ECG game. React + Vite + Tailwind, static build, **no backend and no runtime network calls** — it must stay safe to run on isolated/proxied networks.

## Commands

- `npm run dev` — Vite dev server
- `npm run test:run` — run all tests once (CI uses this)
- `npm run test` — Vitest watch mode
- `npx vitest run src/test/waveform/beat.test.js` — run a single test file
- `npm run build` — production build to `dist/`

There is no lint script. Vitest is configured inside `vite.config.js` (jsdom environment, globals on, setup in `src/test/setup.js`). Tests live in `src/test/`, mirroring the `src/` layout.

## Deployment constraints (GitHub Pages)

Deployed as a **project page** at `https://wassupluke.com/six-second-stemi/` via the GitHub Actions workflow (`.github/workflows/deploy.yml`: test → build → publish `dist/` on push to `main`).

- `vite.config.js` sets `base: '/six-second-stemi/'` — keep it; assets resolve under the subpath.
- **Never add a `CNAME` file** — the user site (`wassupluke.github.io`) owns the `wassupluke.com` apex; a project CNAME would break user-site routing.

## Architecture

### Waveform synthesis pipeline (data → geometry → SVG)

The core of the app is a deterministic pipeline that turns a case (diagnosis + bpm) into 12 scrolling lead traces:

1. **`src/data/templates.js`** — per-lead normal `{p,q,r,s,t}` amplitudes in **mm**, plus `DIAGNOSIS_TEMPLATES` (per-diagnosis `{st, t}` overrides per lead: `+st` = elevation, `-st` = reciprocal depression) and `R_BOOST` (posterior tall-R in V1–V3).
2. **`src/waveform/synth.js`** — `leadMorphology(diagnosisId, lead)` merges normal + overrides; `synthLead()` builds a tile of ≥4 beats (enough beats to overflow the measured cell width) and returns an SVG path.
3. **`src/waveform/beat.js`** — **single source of truth for all scale/timing constants**: `ECG` (4 px/mm, 25 mm/s), `PAPER_SPEED_PX_PER_SEC`, `AMPLITUDE_GAIN` (3× vertical gain compensating for the coordinate-box downscale), `beatWidthPx(bpm)`, and `MAX_BPM` (above it the complex is wider than the RR interval and the trace would fold back). Don't duplicate these constants elsewhere — `lead.js`, `synth.js`, and `Lead.jsx` all import from here, and tests pin the R-R interval to `(60/bpm) × paper speed`.
4. **`src/waveform/lead.js`** — tiles beats horizontally, dropping the duplicate seam point between beats.

### Rendering and animation (`Lead.jsx` + `index.css`)

- Each lead renders in a tall internal coordinate box (`COORD_H = 220`) squeezed into a ~70–80 px cell via `preserveAspectRatio="none"`. Vertical is scaled; **horizontal stays 1:1** (viewBox width = pixel width) so beat spacing reflects true heart rate.
- Scrolling is pure CSS: two identical SVG tile copies inside `.ecg-track`, animated `translateX(-50%)` with `animationDuration = tile.width / PAPER_SPEED_PX_PER_SEC` — constant real paper speed at every heart rate.
- **Hover-freeze is one shared CSS rule** (`.ecg-screen:hover .ecg-track`) — never add per-lead pause state; a single paused lead drifts permanently out of phase with the rest.
- The graph paper is pure CSS gradients (`.ecg-grid` in `index.css`), no image assets. Theme colors (`screen`, `trace`, `grid`, `bezel`, `learn`, `game`) are defined in `tailwind.config.js`.
- `prefers-reduced-motion` disables scrolling (both in CSS and in `Simulator.jsx`).

### Case data and validation

- `src/data/cases.json` holds the cases; `src/data/cases.js` validates every case **at import time** (known diagnosis id, `0 < bpm ≤ MAX_BPM`) and throws on violation. New cases must respect `MAX_BPM` or the build/tests fail loudly.
- `src/data/diagnoses.js` defines the 8 answer options (`no-stemi` + 7 STEMI territories). LEARN mode shows one representative case per diagnosis; GAME decks come from `getDeck(difficulty)` — `novice` gets only `difficulty: "classic"` cases, `practitioner` gets all (including `subtle` mimics like pericarditis/BER).

### State: three hooks composed by `Simulator.jsx`

- `useGame` — game state machine: `idle → playing → answered → gameover`, with a 1 Hz countdown, per-case chances (novice 3, practitioner 1), and an `onGrade` callback.
- `useSession` — cumulative per-diagnosis stats, persisted to localStorage (`stemi-cumulative-stats`).
- `useOptions` — user options persisted to localStorage (`stemi-options`).

`Simulator.jsx` is the composition root: it owns mode (`learn`/`game`), wires `useGame.onGrade → useSession.gradeAnswer`, and picks the overlay variant from mode + game phase.

## Design docs

`docs/superpowers/specs/` and `docs/superpowers/plans/` contain the original design specs and implementation plans; `.superpowers/sdd/` holds per-task briefs/reports from plan execution. Consult the specs for intended behavior questions.
