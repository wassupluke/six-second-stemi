import { TERRITORIES, VESSELS } from '../data/constants'
import { ChoiceList } from './ChoiceList'

export function AnswerPanel({ selectedTerritory, selectedVessel, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 h-full divide-y divide-gray-700 sm:divide-y-0 sm:divide-x overflow-y-auto sm:overflow-hidden">
      <div className="overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-3 pt-3 pb-1">
          Territory
        </h2>
        <ChoiceList
          options={TERRITORIES}
          selected={selectedTerritory}
          onSelect={id => onSelect('territory', id)}
          correctId={null}
        />
      </div>
      <div className="overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-3 pt-3 pb-1">
          Vessel
        </h2>
        <ChoiceList
          options={VESSELS}
          selected={selectedVessel}
          onSelect={id => onSelect('vessel', id)}
          correctId={null}
        />
      </div>
    </div>
  )
}
