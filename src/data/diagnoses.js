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
