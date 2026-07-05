export function OptionsModal({ options, setOption, onClose }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[26rem] max-w-[92%] p-5 rounded-lg bg-bezel border border-grid/60 text-trace" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Options</h2>
          <button aria-label="Close options" onClick={onClose} className="text-trace/70">✕</button>
        </div>

        <fieldset className="mb-4">
          <legend className="text-sm text-trace/80 mb-1">Game Time Period (minutes)</legend>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8].map(m => (
              <button
                key={m}
                onClick={() => setOption('gameMinutes', m)}
                className={`w-8 h-8 rounded ${options.gameMinutes === m ? 'bg-game text-white' : 'bg-trace/10'}`}
              >{m}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="text-sm text-trace/80 mb-1">Rhythm Display</legend>
          <label className="mr-4 inline-flex items-center gap-1">
            <input type="radio" name="display" checked={options.display === 'dynamic'} onChange={() => setOption('display', 'dynamic')} />
            <span>Dynamic ECG</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input type="radio" name="display" checked={options.display === 'static'} onChange={() => setOption('display', 'static')} aria-label="Static ECG" />
            <span>Static ECG</span>
          </label>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="text-sm text-trace/80 mb-1">Grid Display</legend>
          <label className="mr-4 inline-flex items-center gap-1">
            <input type="radio" name="grid" checked={options.grid} onChange={() => setOption('grid', true)} aria-label="Grid On" />
            <span>On</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input type="radio" name="grid" checked={!options.grid} onChange={() => setOption('grid', false)} aria-label="Grid Off" />
            <span>Off</span>
          </label>
        </fieldset>

        <fieldset>
          <legend className="text-sm text-trace/80 mb-1">Sound Volume</legend>
          <input
            type="range" min="0" max="1" step="0.1" value={options.volume} aria-label="Sound Volume"
            onChange={e => setOption('volume', Number(e.target.value))}
          />
        </fieldset>
      </div>
    </div>
  )
}
