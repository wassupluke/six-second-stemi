# Variable Heart Rate — Design

**Date:** 2026-07-09
**Status:** Approved

## Problem

Each case in `src/data/cases.json` carries a hardcoded `bpm`. Users can memorize
the rate→diagnosis mapping ("96 bpm is always the anterolateral STEMI"), which
defeats the training value of the game.

## Goal

Heart rate varies on every deal, so rate never uniquely identifies a case —
while still *skewing* the clinically meaningful way (RV infarct tends brady,
pericarditis tends tachy) as a probabilistic hint rather than a giveaway.

## Non-goals

- Rate variability within a single displayed trace (arrhythmia simulation).
- Randomizing anything other than heart rate.

## Design

### Data: `bpm` becomes an inclusive integer range

In `cases.json`, `"bpm": 68` becomes `"bpm": [min, max]` (two integers,
inclusive at both ends).

Ranges deliberately **overlap** — if the RV case were the only bradycardic one,
"slow = RV" would just replace the old memorizable tell:

| case | range | rationale |
|-|-|-|
| `rv-1` | [45, 80] | skews brady (RV infarct picture), overlaps normal |
| `none-peri-1` | [88, 114] | skews tachy (pericarditis), overlaps normal |
| all others | [60, 105] | broad NSR band |

All maxima respect `MAX_BPM` (114, from `src/waveform/beat.js`) — above it the
waveform folds back on itself.

### Validation (`src/data/cases.js`)

Import-time validation becomes: `bpm` is a 2-element array of integers with
`0 < min ≤ max ≤ MAX_BPM`. Throws with the case id on violation, as today.

### Rolling: pure helper in `cases.js`

```js
export function rollBpm(caseObj, rng = Math.random)
// → integer uniformly sampled from [min, max], inclusive
```

The injectable `rng` keeps it deterministic under test.

### Roll site: one `useMemo` in `Simulator.jsx`

```js
const dealtCase = useMemo(
  () => shownCase && { ...shownCase, bpm: rollBpm(shownCase) },
  [shownCase]
)
```

`dealtCase` replaces `shownCase` everywhere downstream (`TitleBar`,
`EcgScreen`, `ScreenOverlay`). Downstream components keep receiving a case
with a plain numeric `bpm` — no changes there.

Behavior this yields:

- **GAME:** every deal rolls fresh (deck advance changes `shownCase`).
- **LEARN:** every page-turn rolls fresh, including revisiting the same card
  (`useMemo` has a single-slot cache, so leaving and returning recomputes).
- Ordinary re-renders mid-case do **not** re-roll — the trace and displayed
  rate stay stable while a case is on screen.

## Testing

- `rollBpm`: injected deterministic rng; result is an integer; both bounds
  reachable/inclusive; result within range across the rng's [0, 1) domain.
- `cases.js` validation: rejects non-array bpm, wrong length, non-integers,
  min > max, max > MAX_BPM; accepts all shipped cases.
- Sweep existing tests for fixtures using numeric `bpm` (e.g.
  `cases.test.js`, component tests) and update to the range shape or to
  pre-rolled numeric bpm as appropriate.

## Error handling

All failure modes are authoring errors caught at import time by validation
(build and tests fail loudly). `rollBpm` assumes validated input.
