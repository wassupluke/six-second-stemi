import { Lead } from './Lead'

export function RhythmStrip({ caseObj, animated }) {
  return (
    <div className="w-full border-t border-grid/40">
      {/* Full-width strip: a wider tile so it overflows the whole width. Scroll
          speed is the shared real paper speed, so it stays in sync with lead II
          in the grid automatically. */}
      <Lead caseObj={caseObj} lead="II" animated={animated} minWidthPx={900} height={70} />
    </div>
  )
}
