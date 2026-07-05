const STATE_CLASS = {
  idle: 'bg-bezel text-trace hover:bg-trace/10 border-grid/50',
  'selected-wrong': 'bg-red-600 text-white border-red-400',
  'selected-correct': 'bg-green-600 text-white border-green-400',
  'reveal-correct': 'bg-green-700/80 text-white border-green-400',
}

export function DiagnosisButton({ diagnosis, state = 'idle', onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-2 py-2 text-sm font-semibold rounded border transition-colors ${STATE_CLASS[state]} disabled:cursor-default`}
    >
      {diagnosis.label}
    </button>
  )
}
