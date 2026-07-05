function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
function pct(n, d) { return d ? Math.round((100 * n) / d) : 0 }

export function GameControls({ phase, timerRemaining, chancesLeft, counters, onReset }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-bezel/90 border-b border-grid/50 text-sm text-trace">
      <div className="flex gap-4">
        <span>Cases: {counters.cases}</span>
        <span>Correct: {counters.correct} ({pct(counters.correct, counters.cases)}%)</span>
        <span>Attempts: {counters.attempts}</span>
      </div>
      <div className="flex items-center gap-4">
        {phase === 'playing' && chancesLeft < 3 && chancesLeft > 0 && (
          <span className="text-trace/80">{chancesLeft} Chance{chancesLeft === 1 ? '' : 's'} Remaining</span>
        )}
        <span className="font-mono text-lg tabular-nums bg-black/40 px-2 rounded">{fmt(timerRemaining)}</span>
        <button className="px-3 py-1 rounded bg-trace/10 hover:bg-trace/20" onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}
