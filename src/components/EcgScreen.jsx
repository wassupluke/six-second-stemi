import { LeadGrid } from './LeadGrid'
import { RhythmStrip } from './RhythmStrip'

export function EcgScreen({ caseObj, animated, grid }) {
  // ecg-screen carries the hover-freeze CSS rule: hovering pauses EVERY track
  // together. Pausing a single lead would let the others advance and leave it
  // permanently out of phase with the rest of the 12-lead.
  return (
    <div className={`ecg-screen ${grid ? 'ecg-grid' : 'ecg-grid-off'}`}>
      <LeadGrid caseObj={caseObj} animated={animated} />
      <RhythmStrip caseObj={caseObj} animated={animated} />
    </div>
  )
}
