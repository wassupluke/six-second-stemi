import { TERRITORIES, VESSELS } from '../data/constants'

function pct(correct, total) {
  if (total === 0) return '—'
  return Math.round((correct / total) * 100) + '%'
}

function AccuracyTable({ heading, rows, statMap }) {
  const entries = rows.filter(r => statMap[r.id])
  if (entries.length === 0) return null

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{heading}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 text-left">
            <th className="pb-1 font-normal">Name</th>
            <th className="pb-1 font-normal">Correct</th>
            <th className="pb-1 font-normal">Total</th>
            <th className="pb-1 font-normal">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(row => {
            const s = statMap[row.id]
            return (
              <tr key={row.id} className="border-t border-gray-700">
                <td className="py-1.5">{row.label}</td>
                <td className="py-1.5">{s.correct}</td>
                <td className="py-1.5">{s.total}</td>
                <td className="py-1.5 font-semibold text-white">{pct(s.correct, s.total)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

export function StatsScreen({ cumulativeStats, onReset, onBack }) {
  const hasData =
    Object.keys(cumulativeStats.territory).length > 0 ||
    Object.keys(cumulativeStats.vessel).length > 0

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-900 text-gray-200">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <button onClick={onBack} className="self-start text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to Practice
        </button>

        <h2 className="text-xl font-bold text-white">Stats</h2>

        {!hasData && <p className="text-gray-400">No attempts yet.</p>}

        {hasData && (
          <>
            <AccuracyTable heading="By Territory" rows={TERRITORIES} statMap={cumulativeStats.territory} />
            <AccuracyTable heading="By Vessel" rows={VESSELS} statMap={cumulativeStats.vessel} />
          </>
        )}

        <button
          onClick={onReset}
          className="self-start text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Reset all stats
        </button>
      </div>
    </div>
  )
}
