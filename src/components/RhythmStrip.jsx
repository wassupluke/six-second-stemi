import { Lead } from './Lead'

export function RhythmStrip({ caseObj, animated }) {
  return (
    <div className="w-full border-t border-grid/40">
      {/* Full-width strip: Lead measures its own container, so the tile always
          overflows whatever width the strip renders at. Scroll speed is the
          shared real paper speed, so it stays in sync with lead II in the grid
          automatically. */}
      <Lead caseObj={caseObj} lead="II" animated={animated} height={70} />
    </div>
  )
}
