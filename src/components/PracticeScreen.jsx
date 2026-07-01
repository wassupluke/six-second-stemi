import { useState, useEffect } from 'react'
import { ECGViewer } from './ECGViewer'
import { AnswerPanel } from './AnswerPanel'
import { RevealPanel } from './RevealPanel'

export function PracticeScreen({ ecgs, session, onSessionComplete }) {
  const [idx, setIdx] = useState(0)
  const [selectedTerritory, setSelectedTerritory] = useState(null)
  const [selectedVessel, setSelectedVessel] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const currentECG = ecgs[idx]

  useEffect(() => {
    if (selectedTerritory && selectedVessel && !revealed) {
      setRevealed(true)
      session.gradeAnswer(currentECG, selectedTerritory, selectedVessel)
    }
  }, [selectedTerritory, selectedVessel]) // eslint-disable-line react-hooks/exhaustive-deps -- gradeAnswer and currentECG intentionally omitted: effect must fire on selection change only, not on every gradeAnswer identity change

  function handleSelect(type, id) {
    if (type === 'territory') setSelectedTerritory(id)
    else setSelectedVessel(id)
  }

  function handleNext() {
    if (idx + 1 >= ecgs.length) {
      onSessionComplete()
      return
    }
    setIdx(i => i + 1)
    setSelectedTerritory(null)
    setSelectedVessel(null)
    setRevealed(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-[45] sm:flex-[55] min-h-0 bg-black">
        <ECGViewer ecg={currentECG} />
      </div>
      <div className="flex-[55] sm:flex-[45] min-h-0 border-t border-gray-700 bg-gray-800 overflow-hidden">
        {revealed ? (
          <RevealPanel
            ecg={currentECG}
            selectedTerritory={selectedTerritory}
            selectedVessel={selectedVessel}
            onNext={handleNext}
          />
        ) : (
          <AnswerPanel
            selectedTerritory={selectedTerritory}
            selectedVessel={selectedVessel}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  )
}
