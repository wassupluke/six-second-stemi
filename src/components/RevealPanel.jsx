import { TERRITORIES, VESSELS } from '../data/constants'

export function RevealPanel({ ecg, selectedTerritory, selectedVessel, onNext }) {
  const tCorrect = selectedTerritory === ecg.territory
  const vCorrect = selectedVessel === ecg.vessel

  const correctTerritoryLabel = TERRITORIES.find(t => t.id === ecg.territory)?.label
  const correctVesselLabel = VESSELS.find(v => v.id === ecg.vessel)?.label
  const selectedTerritoryLabel = TERRITORIES.find(t => t.id === selectedTerritory)?.label
  const selectedVesselLabel = VESSELS.find(v => v.id === selectedVessel)?.label

  return (
    <div className="flex flex-col h-full p-4 gap-3 overflow-y-auto">
      <div className="flex flex-wrap gap-6 text-sm font-semibold">
        <div>
          <span className={tCorrect ? 'text-green-400' : 'text-red-400'}>
            {tCorrect ? '✓' : '✗'} {selectedTerritoryLabel}
          </span>
          {!tCorrect && (
            <span className="text-gray-400">
              {' → '}
              <span className="text-green-400">{correctTerritoryLabel}</span>
            </span>
          )}
        </div>
        <div>
          <span className={vCorrect ? 'text-green-400' : 'text-red-400'}>
            {vCorrect ? '✓' : '✗'} {selectedVesselLabel}
          </span>
          {!vCorrect && (
            <span className="text-gray-400">
              {' → '}
              <span className="text-green-400">{correctVesselLabel}</span>
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-200 leading-relaxed flex-1">{ecg.explanation}</p>

      <div className="flex flex-wrap gap-1">
        {ecg.leads_affected.map(lead => (
          <span key={lead} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded font-mono">
            {lead}
          </span>
        ))}
      </div>

      {ecg.attribution && (
        <p className="text-xs text-gray-500 italic">{ecg.attribution}</p>
      )}

      <button
        onClick={onNext}
        className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
      >
        Next ECG →
      </button>
    </div>
  )
}
