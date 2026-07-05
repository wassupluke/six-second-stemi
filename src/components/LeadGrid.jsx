import { Lead } from './Lead'
import { LEADS } from '../data/templates'

// LEADS is already in column-major grid order:
// row0: I aVR V1 V4 | row1: II aVL V2 V5 | row2: III aVF V3 V6
export function LeadGrid({ caseObj, animated }) {
  return (
    <div className="grid grid-cols-4 grid-rows-3 w-full">
      {LEADS.map(lead => (
        <Lead key={lead} caseObj={caseObj} lead={lead} animated={animated} minWidthPx={300} height={70} />
      ))}
    </div>
  )
}
