# Variable Heart Rate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace each case's hardcoded `bpm` with an inclusive `[min, max]` range that is rolled to a fresh integer every time a case is dealt (GAME) or paged to (LEARN), so heart rate can't be memorized as a diagnosis tell.

**Architecture:** `cases.json` stores ranges; `cases.js` validates them at import time and exports a pure `rollBpm(caseObj, rng)` sampler; `Simulator.jsx` rolls once per shown case via `useMemo` and passes a case with a plain numeric `bpm` downstream, so `TitleBar`, `EcgScreen`, and the waveform pipeline are untouched.

**Tech Stack:** React 18, Vite, Vitest (jsdom, globals on — no imports of `describe`/`it` needed beyond the existing pattern which imports them explicitly from `vitest`; follow the existing pattern).

**Spec:** `docs/superpowers/specs/2026-07-09-variable-heart-rate-design.md`

## Global Constraints

- `MAX_BPM` is 114 (computed in `src/waveform/beat.js`); every range max must be ≤ 114. Import `MAX_BPM` — never hardcode 114 in source (test literals are fine).
- No runtime network calls; static client-side app.
- Ranges must **overlap** across cases (spec: rate is a probabilistic hint, not a giveaway). Exact values are in Task 2 — do not "improve" them.
- Every commit must leave the full suite green: `npm run test:run`.
- Run all commands from the repo root: `/home/wassu/code/six-second-stemi`.

---

### Task 1: `rollBpm` sampler in `src/data/cases.js`

**Files:**
- Modify: `src/data/cases.js` (append export)
- Test: `src/test/data/cases.test.js` (append describe block)

**Interfaces:**
- Consumes: nothing new — `caseObj.bpm` is assumed to be `[min, max]` (integers, inclusive). In this task only test fixtures have that shape; `cases.json` still holds numbers and is untouched.
- Produces: `rollBpm(caseObj, rng = Math.random) → integer` uniformly sampled from `[min, max]` inclusive. `rng` is a zero-arg function returning a float in `[0, 1)`. Task 2 calls `rollBpm(shownCase)` from `Simulator.jsx`.

- [ ] **Step 1: Write the failing tests**

Append to `src/test/data/cases.test.js` (inside the file, after the existing `describe('cases', ...)` block; add `rollBpm` to the existing import from `'../../data/cases'`):

```js
import { CASES, getDeck, rollBpm } from '../../data/cases'
```

```js
describe('rollBpm', () => {
  const c = { bpm: [60, 105] }
  it('returns min when rng is 0', () => {
    expect(rollBpm(c, () => 0)).toBe(60)
  })
  it('returns max when rng approaches 1 (inclusive upper bound)', () => {
    expect(rollBpm(c, () => 0.999999)).toBe(105)
  })
  it('returns an integer within the range across the rng domain', () => {
    for (const r of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.999999]) {
      const v = rollBpm(c, () => r)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(60)
      expect(v).toBeLessThanOrEqual(105)
    }
  })
  it('handles a degenerate single-value range', () => {
    expect(rollBpm({ bpm: [72, 72] }, () => 0.5)).toBe(72)
  })
  it('defaults rng to Math.random', () => {
    const v = rollBpm(c)
    expect(Number.isInteger(v)).toBe(true)
    expect(v).toBeGreaterThanOrEqual(60)
    expect(v).toBeLessThanOrEqual(105)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/test/data/cases.test.js`
Expected: FAIL — the new describe block errors with `rollBpm is not a function` (or equivalent import failure); the pre-existing `cases` tests still pass.

- [ ] **Step 3: Implement `rollBpm`**

Append to `src/data/cases.js`:

```js
// Sample an integer heart rate uniformly from the case's inclusive
// [min, max] range. rng is injectable for deterministic tests.
export function rollBpm(caseObj, rng = Math.random) {
  const [min, max] = caseObj.bpm
  return min + Math.floor(rng() * (max - min + 1))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/test/data/cases.test.js`
Expected: PASS (all tests in the file, old and new).

- [ ] **Step 5: Run the full suite**

Run: `npm run test:run`
Expected: PASS — nothing else changed.

- [ ] **Step 6: Commit**

```bash
git add src/data/cases.js src/test/data/cases.test.js
git commit -m "feat(cases): add rollBpm sampler for [min, max] heart-rate ranges"
```

---

### Task 2: Range data in `cases.json`, import-time validation, and per-deal roll in `Simulator.jsx`

These three changes are one atomic task: the JSON shape, its validator, and the consumer must flip together or the suite goes red between commits.

**Files:**
- Modify: `src/data/cases.json` (every `"bpm"` value)
- Modify: `src/data/cases.js` (validation block inside `CASES = raw.map(...)`)
- Modify: `src/components/Simulator.jsx` (roll site + prop wiring)
- Test: `src/test/data/cases.test.js` (update the two `cases` assertions about bpm)

**Interfaces:**
- Consumes: `rollBpm(caseObj, rng?)` from Task 1 (`src/data/cases.js`).
- Produces: `CASES`/`getDeck()` now yield cases whose `bpm` is `[min, max]`. `Simulator.jsx` derives `dealtCase` — same case object but with numeric `bpm` — and passes it to `TitleBar`, `EcgScreen`, and `ScreenOverlay`. No other file may read a raw case's `bpm` expecting a number.

- [ ] **Step 1: Update the bpm assertions in `src/test/data/cases.test.js` (failing first)**

In the existing `describe('cases', ...)` block, replace the line

```js
      expect(typeof c.bpm).toBe('number')
```

with

```js
      expect(Array.isArray(c.bpm)).toBe(true)
      expect(c.bpm).toHaveLength(2)
      expect(c.bpm.every(Number.isInteger)).toBe(true)
```

and replace the body of the `'every case bpm is within the fold-back-safe range (0, MAX_BPM]'` test with:

```js
  it('every case bpm range is within the fold-back-safe range (0, MAX_BPM]', () => {
    expect(MAX_BPM).toBeGreaterThan(0)
    for (const c of CASES) {
      const [min, max] = c.bpm
      expect(min).toBeGreaterThan(0)
      expect(min).toBeLessThanOrEqual(max)
      expect(max).toBeLessThanOrEqual(MAX_BPM)
    }
  })
```

- [ ] **Step 2: Run to verify the updated tests fail**

Run: `npx vitest run src/test/data/cases.test.js`
Expected: FAIL — `Array.isArray(c.bpm)` is `false` (json still holds numbers). The Task 1 `rollBpm` tests still pass.

- [ ] **Step 3: Convert `cases.json` to ranges**

Replace each case's `"bpm"` value (exact values from the spec — rv-1 skews brady, none-peri-1 skews tachy, everything else shares the broad NSR band):

| id | old | new |
|-|-|-|
| inf-1 | 68 | [60, 105] |
| ant-1 | 88 | [60, 105] |
| asp-1 | 82 | [60, 105] |
| alat-1 | 96 | [60, 105] |
| lat-1 | 74 | [60, 105] |
| post-1 | 78 | [60, 105] |
| rv-1 | 58 | [45, 80] |
| none-normal-1 | 72 | [60, 105] |
| none-ber-1 | 64 | [60, 105] |
| none-peri-1 | 94 | [88, 114] |

e.g. the first case becomes `"bpm": [60, 105],` — keep every other field untouched.

- [ ] **Step 4: Update import-time validation in `src/data/cases.js`**

Replace the whole validation section (the `CASES = raw.map(...)` block) with an exported, unit-testable validator used by the map:

```js
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
```

- [ ] **Step 5: Add throw-path tests for the validator**

Append to `src/test/data/cases.test.js` (add `assertValidCase` to the import from `'../../data/cases'`):

```js
describe('assertValidCase bpm range validation', () => {
  const base = { id: 'x', diagnosis: 'anterior', bpm: [60, 100] }
  it('accepts a valid range', () => {
    expect(() => assertValidCase(base)).not.toThrow()
  })
  it('rejects a plain number bpm', () => {
    expect(() => assertValidCase({ ...base, bpm: 68 })).toThrow(/invalid bpm range/)
  })
  it('rejects wrong array length', () => {
    expect(() => assertValidCase({ ...base, bpm: [60] })).toThrow(/invalid bpm range/)
  })
  it('rejects non-integer bounds', () => {
    expect(() => assertValidCase({ ...base, bpm: [60.5, 100] })).toThrow(/invalid bpm range/)
  })
  it('rejects min > max', () => {
    expect(() => assertValidCase({ ...base, bpm: [100, 60] })).toThrow(/invalid bpm range/)
  })
  it('rejects min of 0 or below', () => {
    expect(() => assertValidCase({ ...base, bpm: [0, 60] })).toThrow(/invalid bpm range/)
  })
  it('rejects max above MAX_BPM', () => {
    expect(() => assertValidCase({ ...base, bpm: [60, MAX_BPM + 1] })).toThrow(/invalid bpm range/)
  })
})
```

Run: `npx vitest run src/test/data/cases.test.js`
Expected: PASS (all describe blocks).

Note: the full suite is NOT expected to catch the remaining gap — with array bpm flowing into the waveform synth, `Simulator.test.jsx` renders NaN path data *silently* and still passes. Do not commit here; the app is visibly broken until Step 6, and Step 8's manual check is what verifies the wiring.

- [ ] **Step 6: Roll per shown case in `src/components/Simulator.jsx`**

Add `rollBpm` to the existing import:

```js
import { CASES, rollBpm } from '../data/cases'
```

Immediately after the line `const shownCase = mode === 'game' ? game.currentCase : learnCase`, add:

```js
  // Roll a concrete heart rate once per dealt/browsed case. useMemo's
  // single-slot cache re-rolls whenever shownCase changes (every GAME deal,
  // every LEARN page-turn — including returning to a card) but keeps the
  // rate stable across re-renders while a case is on screen.
  const dealtCase = useMemo(
    () => shownCase && { ...shownCase, bpm: rollBpm(shownCase) },
    [shownCase]
  )
```

Then swap the downstream props from `shownCase` to `dealtCase` (four places):

```js
      caseObj={overlayVariant === 'gameover' ? null : dealtCase}
```

```js
      <TitleBar bpm={dealtCase?.bpm ?? null} />
      <EcgScreen caseObj={dealtCase} animated={animated} grid={options.grid} />
```

```js
        correctId={mode === 'game' ? dealtCase?.diagnosis : undefined}
```

(`useMemo` is already imported in this file.)

- [ ] **Step 7: Run the full suite**

Run: `npm run test:run`
Expected: PASS — all test files green.

- [ ] **Step 8: Verify in the running app**

Run: `npm run dev`, open the printed URL, and check:
1. LEARN: page away from a card and back — the HR readout changes between visits, and beat spacing visibly matches the shown rate.
2. LEARN: while a card is displayed, the rate does not change on its own (hover-freeze, option toggles, etc. don't re-roll).
3. GAME → Novice: each dealt case shows a rate, and repeated games show different rates for the same diagnosis.

Stop the dev server when done.

- [ ] **Step 9: Commit**

```bash
git add src/data/cases.json src/data/cases.js src/components/Simulator.jsx src/test/data/cases.test.js
git commit -m "feat(cases): roll heart rate per deal from overlapping [min, max] ranges"
```
