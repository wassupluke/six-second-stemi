import { DIAGNOSES } from '../data/diagnoses'

export function StatsPanel({ cumulativeStats, onReset, onClose }) {
  const byDx = cumulativeStats.diagnosis || {}
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[30rem] max-w-[92%] p-5 rounded-lg bg-bezel border border-grid/60 text-trace" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Cumulative accuracy</h2>
          <button aria-label="Close stats" onClick={onClose} className="text-trace/70">✕</button>
        </div>
        <ul className="divide-y divide-grid/40">
          {DIAGNOSES.map(d => {
            const s = byDx[d.id]
            const pct = s && s.total ? Math.round((100 * s.correct) / s.total) : null
            return (
              <li key={d.id} className="flex items-center justify-between py-1.5 text-sm">
                <span>{d.label}</span>
                <span className="tabular-nums text-trace/85">
                  {s ? `${s.correct}/${s.total}` : '—'} {pct !== null ? `(${pct}%)` : ''}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="flex justify-end mt-4">
          <button className="px-3 py-1.5 rounded bg-red-700/80 text-white" onClick={onReset}>Reset all stats</button>
        </div>
      </div>
    </div>
  )
}
