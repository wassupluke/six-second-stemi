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
  posterior:     { V1:{st:-3}, V2:{st:-4}, V3:{st:-3} }, // reciprocal anterior depression, tall R handled below
  rv:            { III:{st:4,t:4}, II:{st:2}, aVF:{st:3}, V1:{st:2}, I:{st:-2}, aVL:{st:-2} },
}

// Posterior also shows tall R in V1-V3 (mirror of posterior Q). Apply as an R boost.
export const R_BOOST = {
  posterior: { V1: 6, V2: 6, V3: 4 },
}
