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
