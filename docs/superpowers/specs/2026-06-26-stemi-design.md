# STEMI Recognition Practice Web App — Design Spec

**Date:** 2026-06-26
**Status:** Approved

## Overview

A shareable, web-based ECG practice tool for residents and students. Users are shown a real de-identified 12-lead ECG and must identify the STEMI territory and culprit vessel. Immediate feedback with teaching explanations. Progress tracked locally — no accounts required.

Reference: [skillstat.com/tools/ecg-simulator](https://www.skillstat.com/tools/ecg-simulator)

---

## Scope (v1)

**In scope:**
- Classic STEMI patterns across 7 territories
- Territory + vessel identification per ECG
- Static teaching text per case
- Session accuracy breakdown by territory and vessel
- Persistent localStorage stats (cumulative across sessions)

**Out of scope for v1:**
- STEMI equivalents (Wellens', de Winter, posterior STEMI, Sgarbossa) — gated behind `difficulty: "equivalent"` in the data model for future use
- User accounts or cloud sync
- Claude API / AI-generated explanations
- Leaderboards or social features

---

## Data Model

All case data lives in `src/data/ecgs.json`. Each entry:

```json
{
  "id": "ecg-001",
  "image": "/ecgs/ecg-001.jpg",
  "territory": "inferior",
  "vessel": "RCA",
  "leads_affected": ["II", "III", "aVF"],
  "explanation": "Classic inferior STEMI: ST elevation in II, III, and aVF with reciprocal depression in I and aVL. The inferior wall is supplied by the RCA in ~80% of patients (right-dominant). Look for concomitant RV involvement if ST elevation in III > II.",
  "source": "LITFL",
  "attribution": "Life In The Fast Lane — used with attribution",
  "difficulty": "classic"
}
```

**Valid `territory` values:**
`anterior | septal | lateral | inferior | posterior | RV | anterolateral`

**Valid `vessel` values:**
`LAD | LAD-proximal | RCA | RCA-proximal | LCx`

**Valid `difficulty` values:**
`classic` (v1 only; `equivalent` reserved for future use)

ECG images are static files in `public/ecgs/`. Adding a new case = drop image + add JSON entry. No code changes needed.

---

## Clinical Scope

| Territory | Key Leads | Vessel |
|-|-|-|
| Anterior | V1–V4 | LAD |
| Septal | V1–V2 | LAD (proximal) |
| Lateral | I, aVL, V5–V6 | LCx |
| Inferior | II, III, aVF | RCA (usually) or LCx |
| Posterior | V1–V3 (reciprocal) | RCA or LCx |
| RV | V1, V4R | RCA (proximal) |
| Anterolateral | V1–V6, I, aVL | LAD (proximal) |

---

## Architecture

**Stack:** React + Vite + Tailwind CSS. No backend. Static hosting (Vercel/Netlify).

### Component Tree

```
App
├── Header                    — title, live session score (X/Y correct), "Stats" nav link
├── PracticeScreen            — main game loop, owns all session state
│   ├── ECGViewer             — top 55% of screen: ECG image, letterboxed
│   ├── AnswerPanel           — bottom 45%: two-column selection (pre-reveal)
│   │   ├── ChoiceList        — territory column (7 options)
│   │   └── ChoiceList        — vessel column (5 options)
│   └── RevealPanel           — replaces AnswerPanel after both selections made
│       ├── Verdict           — correct/incorrect badge per choice, correct answer shown
│       ├── Explanation       — static teaching text + leads_affected badges
│       └── NextButton        — advances to next ECG
└── StatsScreen               — shown when deck exhausted or via nav
    ├── TerritoryBreakdown    — accuracy % per territory
    └── VesselBreakdown       — accuracy % per vessel
```

### State (PracticeScreen)

```
deck: ECGEntry[]              — shuffled, consumed front-to-back
currentECG: ECGEntry
selectedTerritory: string | null
selectedVessel: string | null
revealed: boolean             — auto-flips true when both selections non-null

sessionProgress: {            — in-memory only, resets each session
  answered: number
  correct: number
}

cumulativeStats: CumulativeStats  — read from localStorage on mount, written on every answer
```

`sessionProgress` drives the header score (X/Y). `cumulativeStats` drives the StatsScreen breakdown. They are never mixed.

Custom hook `useSession` encapsulates cumulativeStats read/write and localStorage sync.

---

## UI Layout

### Practice Screen

```
┌─────────────────────────────────────┐
│  Six-Second STEMI         [9/12] ✓  │
├─────────────────────────────────────┤
│                                     │
│         ECG IMAGE (top 55%)         │
│    fills width, letterboxed tall    │
│                                     │
├──────────────┬──────────────────────┤
│  TERRITORY   │  VESSEL              │
│  ○ Anterior  │  ○ LAD               │
│  ○ Septal    │  ○ LAD (proximal)    │
│  ○ Lateral   │  ○ RCA               │
│  ○ Inferior  │  ○ RCA (proximal)    │
│  ○ Posterior │  ○ LCx               │
│  ○ RV        │                      │
│  ○ Anterolat │                      │
└──────────────┴──────────────────────┘
```

On mobile: ECG at ~45% viewport height, territory and vessel columns stack vertically.

### Reveal State (bottom half replaced)

```
✓ Inferior   ✗ LAD → ✓ RCA
──────────────────────────────────────
Classic inferior STEMI: ST elevation in II, III, aVF...
[II] [III] [aVF]
                              [ Next ECG → ]
```

### Interaction States

| State | Visual |
|-|-|
| Unselected | Neutral/muted |
| Selected (pre-reveal) | Highlighted, not yet graded |
| Post-reveal correct | Green |
| Post-reveal incorrect | Red; correct answer shown in green |

Reveal is automatic — no submit button. Both selections non-null → `revealed = true`.

### Styling

Tailwind CSS. Dark background for ECG readability. Light card for answer panel. Clinical aesthetic — no playful colors or animations beyond functional state changes.

---

## Data Flow & Persistence

### Startup

1. Import `ecgs.json` (bundled at build time — no network request)
2. Read `sessionStats` from localStorage or initialize empty
3. Shuffle deck, draw first card

### Per-Answer Cycle

1. User selects territory + vessel → `revealed = true`
2. Grade both against `currentECG.territory` / `currentECG.vessel`
3. Update `sessionStats`, write to localStorage immediately
4. User clicks "Next ECG" → draw next card, reset selections and `revealed`
5. Deck exhausted → show StatsScreen

### localStorage Schema

Only `cumulativeStats` is persisted. `sessionProgress` is in-memory only.

```json
{
  "cumulativeStats": {
    "territory": {
      "inferior":  { "correct": 3, "total": 4 },
      "anterior":  { "correct": 2, "total": 3 }
    },
    "vessel": {
      "RCA": { "correct": 3, "total": 4 },
      "LAD": { "correct": 2, "total": 3 }
    }
  }
}
```

Stats accumulate across sessions. StatsScreen includes a "Reset all stats" button that clears localStorage and reinitializes `cumulativeStats` to empty.

---

## Project Structure

```
six-second-stemi/
├── public/
│   └── ecgs/               — ECG image files (jpg/png)
├── src/
│   ├── data/
│   │   └── ecgs.json       — all case metadata
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ECGViewer.jsx
│   │   ├── AnswerPanel.jsx
│   │   ├── ChoiceList.jsx
│   │   ├── RevealPanel.jsx
│   │   └── StatsScreen.jsx
│   ├── hooks/
│   │   └── useSession.js   — session state + localStorage sync
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

## Deployment

`vite build` → `dist/` → Vercel/Netlify. Auto-deploy on push to `main`. Zero server configuration.

---

## Open Questions (deferred)

- ECG image curation: how many cases for launch? Manual annotation process for `leads_affected` and `explanation`?
- Attribution display: inline on each ECG card, or consolidated credits page?
