import { DIAGNOSES } from '../data/diagnoses'
import { DiagnosisButton } from './DiagnosisButton'

export function AnswerGrid({ mode, selected, result, correctId, disabled, onPick }) {
  function stateFor(id) {
    if (result && id === result.selected) return result.correct ? 'selected-correct' : 'selected-wrong'
    if (result && !result.correct && id === correctId) return 'reveal-correct'
    if (mode === 'learn' && id === selected) return 'selected-correct'
    return 'idle'
  }
  return (
    <div className="grid grid-cols-4 gap-2 p-2">
      {DIAGNOSES.map(d => (
        <DiagnosisButton
          key={d.id}
          diagnosis={d}
          state={stateFor(d.id)}
          disabled={disabled}
          onClick={() => { if (!disabled) onPick(d.id) }}
        />
      ))}
    </div>
  )
}
