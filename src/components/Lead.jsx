import { useState } from 'react'
import { synthLead } from '../waveform/synth'
import { PAPER_SPEED_PX_PER_SEC } from '../waveform/beat'

// Tall internal coordinate box: real QRS amplitudes need far more than the
// ~70px display height. The SVG viewBox uses this height and is scaled down
// to fit the cell via preserveAspectRatio="none", so nothing clips. Horizontal
// scale stays 1:1 (viewBox width === element px width) so beat spacing reflects
// the heart rate rather than being stretched to the cell width.
const COORD_H = 220

export function Lead({ caseObj, lead, animated, minWidthPx = 820, height = 80 }) {
  const [hovered, setHovered] = useState(false)
  const baselineY = COORD_H / 2
  const tile = caseObj ? synthLead(caseObj, lead, { baselineY, minWidthPx }) : null
  const paused = !animated || hovered

  // One tile scrolls past in tile.width / paper-speed seconds → constant real
  // paper speed for every lead and every heart rate, so all tracks stay in sync.
  const durationSec = tile ? tile.width / PAPER_SPEED_PX_PER_SEC : 0

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
              viewBox={`0 0 ${tile.width} ${COORD_H}`}
              preserveAspectRatio="none"
              style={{ flex: 'none', width: `${tile.width}px`, height: '100%' }}
            >
              <path
                d={tile.d}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                className="text-trace"
              />
            </svg>
          ))}
        </div>
      )}
    </div>
  )
}
