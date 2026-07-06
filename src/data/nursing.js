// Per-territory nursing considerations shown in the learn/reveal feedback card.
// Keyed by diagnosis id; no-stemi intentionally has no entry (nothing renders).
// watch = high-acuity complications to monitor for; hemodynamics = how to
// manage preload / afterload / contractility in that territory.
export const NURSING = {
  inferior: {
    watch: [
      'Bradycardia and AV blocks — the RCA supplies the SA node (~60%) and AV node (~90%); keep atropine and pacing pads at the bedside.',
      'Papillary muscle rupture (posteromedial muscle has single RCA supply): new holosystolic murmur with sudden flash pulmonary edema, typically day 2–7.',
      'Hypotension after nitroglycerin — screen for RV involvement (V4R) before giving nitrates.',
      'Nausea, vomiting, and vagal symptoms are common and can mask ischemic pain.',
    ],
    hemodynamics: [
      'Preload: protect it — hold nitrates, morphine, and diuretics until RV infarct is excluded.',
      'Rate is often the weak link: treat symptomatic bradycardia promptly to maintain cardiac output.',
    ],
  },
  rv: {
    watch: [
      'Preload dependent — hypotension + clear lungs + JVD is the classic triad.',
      'Profound hypotension after nitroglycerin or morphine; both are contraindicated.',
      'High-grade AV block and bradyarrhythmias (proximal RCA) — pacing readiness.',
      'Almost always coexists with inferior MI, so watch for its complications too.',
    ],
    hemodynamics: [
      'Preload: maximize — IV fluid boluses are first-line for hypotension; avoid nitrates, morphine, and diuretics.',
      'Contractility: if ~1–2 L of fluid does not restore pressure, anticipate inotropes (dobutamine).',
    ],
  },
  anterior: {
    watch: [
      'Cardiogenic shock / pump failure — largest LV territory: crackles, S3, cool extremities, falling urine output, rising lactate.',
      'Ventricular arrhythmias (VT/VF) — continuous monitoring with the defibrillator close.',
      'New bundle branch block — a marker of extensive septal involvement.',
    ],
    hemodynamics: [
      'Preload: keep euvolemic — avoid aggressive fluids; flash pulmonary edema risk.',
      'Afterload: reduce as tolerated (nitrates if normotensive) to unload the failing LV.',
      'Contractility: escalate early for shock signs — may need inotropes or mechanical support.',
    ],
  },
  anteroseptal: {
    watch: [
      'Infranodal conduction failure: new RBBB/LBBB, fascicular blocks, Mobitz II — often atropine-refractory, so have transcutaneous pacing ready.',
      'Ventricular septal rupture (day 3–5): new harsh holosystolic murmur with abrupt deterioration.',
      'Ventricular arrhythmias (VT/VF).',
    ],
    hemodynamics: [
      'Manage like LAD territory: euvolemia, afterload reduction as tolerated, and early escalation for pump failure.',
    ],
  },
  anterolateral: {
    watch: [
      'Highest risk of cardiogenic shock — the widest area of myocardium at risk.',
      'Track perfusion trends: mentation, urine output, lactate, cool or mottled skin.',
      'Malignant ventricular arrhythmias.',
    ],
    hemodynamics: [
      'Preload: keep euvolemic — flash pulmonary edema risk.',
      'Afterload: reduce if BP allows to cut LV workload.',
      'Contractility: anticipate inotropes or mechanical support (IABP/Impella) if shock develops.',
    ],
  },
  lateral: {
    watch: [
      'LCx infarcts underrepresent on the 12-lead — the territory is often larger than the ECG suggests; weigh symptoms over subtle I/aVL changes.',
      'Acute mitral regurgitation and heart failure signs.',
      'Often extends posteriorly — check for tall R waves / ST depression in V1–V3.',
    ],
    hemodynamics: [
      'Usually tolerated hemodynamically; nitrates are OK if normotensive.',
      'If new MR develops: afterload reduction supports forward flow — prepare for rapid decompensation.',
    ],
  },
  posterior: {
    watch: [
      'Treat as a STEMI equivalent — depression-only V1–V3 still needs emergent reperfusion; advocate for cath lab activation.',
      'Usually accompanies inferior or lateral MI — the total infarct is larger than it appears.',
      'Acute mitral regurgitation (posteromedial papillary muscle): new murmur, flash pulmonary edema.',
    ],
    hemodynamics: [
      'Follow the companion territory (often RCA): hold nitrates until RV involvement is excluded.',
      'If MR develops: reduce afterload to promote forward flow and prepare for pulmonary edema management.',
    ],
  },
}
