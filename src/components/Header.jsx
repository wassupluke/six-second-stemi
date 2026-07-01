export function Header({ sessionProgress, onStatsClick }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
      <h1 className="text-lg font-bold text-white tracking-tight">Six-Second STEMI</h1>
      <div className="flex items-center gap-4">
        {sessionProgress.answered > 0 && (
          <span className="text-sm text-gray-300 tabular-nums">
            {sessionProgress.correct}/{sessionProgress.answered}
          </span>
        )}
        <button
          onClick={onStatsClick}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Stats
        </button>
      </div>
    </header>
  )
}
