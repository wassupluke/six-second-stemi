import { Lead } from './Lead'

export function RhythmStrip({ caseObj, animated }) {
  return (
    <div className="w-full border-t border-grid/40">
      <Lead caseObj={caseObj} lead="II" animated={animated} durationSec={12} height={70} />
    </div>
  )
}
