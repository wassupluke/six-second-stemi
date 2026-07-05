import { Lead } from './Lead'

export function RhythmStrip({ caseObj, animated }) {
  return (
    <div className="w-full border-t border-grid/40">
      {/* The strip renders ~4x wider than a grid cell (the grid is 4 columns),
          so it needs 4x the grid Lead's 6s duration to scroll at the same
          on-screen paper speed and stay in sync with lead II in the grid. */}
      <Lead caseObj={caseObj} lead="II" animated={animated} durationSec={24} height={70} />
    </div>
  )
}
