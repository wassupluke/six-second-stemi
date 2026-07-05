export function TitleBar({ bpm }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-bezel border-b border-grid/50">
      <span className="font-bold tracking-wide text-trace">The 6 Second STEMI</span>
      {bpm ? (
        <span className="flex items-baseline gap-2 text-trace">
          <span className="text-[10px] uppercase tracking-widest text-trace/70">Heart Rate</span>
          <span className="text-2xl font-bold tabular-nums">{bpm}</span>
        </span>
      ) : null}
    </div>
  )
}
