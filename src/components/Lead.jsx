import { useState } from 'react'
import { synthLead } from '../waveform/synth'

export function Lead({ caseObj, lead, animated, durationSec = 6, height = 80 }) {
  const [hovered, setHovered] = useState(false)
  const baselineY = height / 2
  const tile = caseObj ? synthLead(caseObj, lead, { baselineY, beats: 4 }) : null
  const paused = !animated || hovered

  return (
    <div
      className="relative overflow-hidden border-r border-b border-grid/40"
      style={{ height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="absolute top-0.5 left-1 z-10 text-[10px] font-semibold text-trace/80 select-none">
        {lead}
      </span>
      {tile && (
        <div className={`ecg-track ${paused ? 'ecg-paused' : ''}`} style={{ animationDuration: `${durationSec}s` }}>
          {[0, 1].map(i => (
            <svg
              key={i}
              width={tile.width}
              height={height}
              viewBox={`0 0 ${tile.width} ${height}`}
              preserveAspectRatio="none"
              className="h-full"
              style={{ flex: '0 0 50%' }}
            >
              <path d={tile.d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-trace" />
            </svg>
          ))}
        </div>
      )}
    </div>
  )
}
