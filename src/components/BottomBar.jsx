export function BottomBar({ mode, onMode, onOpenStats, onOpenOptions, muted, onToggleMute }) {
  const tab = (id, label, accent) => (
    <button
      onClick={() => onMode(id)}
      className={`px-3 py-1 font-semibold border-b-2 ${mode === id ? `border-${accent} text-trace` : 'border-transparent text-trace/60'}`}
    >
      {label}
    </button>
  )
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-bezel border-t border-grid/50">
      <span className="text-trace/70 font-bold text-sm">S2 · SKILLSTAT-style</span>
      <div className="flex items-center gap-2">
        {tab('learn', 'LEARN', 'learn')}
        {tab('game', 'GAME', 'game')}
      </div>
      <div className="flex items-center gap-3">
        <button aria-label="Stats" onClick={onOpenStats} className="text-trace/80 hover:text-trace">📊</button>
        <button aria-label="Options" onClick={onOpenOptions} className="text-trace/80 hover:text-trace">⚙</button>
        <button aria-label={muted ? 'Unmute' : 'Mute'} onClick={onToggleMute} className="text-trace/80 hover:text-trace">
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
