import { useMemo } from 'react'
import { synthLead } from '../waveform/synth'
import { PAPER_SPEED_PX_PER_SEC } from '../waveform/beat'
import { useContainerWidth } from '../hooks/useContainerWidth'

// Tall internal coordinate box: real QRS amplitudes need far more than the
// ~70px display height. The SVG viewBox uses this height and is scaled down
// to fit the cell via preserveAspectRatio="none", so nothing clips. Horizontal
// scale stays 1:1 (viewBox width === element px width) so beat spacing reflects
// the heart rate rather than being stretched to the cell width.
const COORD_H = 220
const BASELINE_Y = COORD_H / 2

export function Lead({ caseObj, lead, animated, height = 80 }) {
  // The two-copy scroll is only seamless while tile width >= cell width, so
  // measure the rendered cell instead of guessing what the layout gives us.
  const [cellRef, cellWidth] = useContainerWidth()
  const tile = useMemo(
    () => (caseObj ? synthLead(caseObj, lead, { baselineY: BASELINE_Y, minWidthPx: cellWidth }) : null),
    [caseObj, lead, cellWidth]
  )

  // One tile scrolls past in tile.width / paper-speed seconds → constant real
  // paper speed for every lead and every heart rate, so all tracks stay in sync.
  const durationSec = tile ? tile.width / PAPER_SPEED_PX_PER_SEC : 0

  return (
    <div
      ref={cellRef}
      className="relative overflow-hidden border-r border-b border-grid/40"
      style={{ height }}
    >
      <span className="absolute top-0.5 left-1 z-10 text-[10px] font-semibold text-trace/80 select-none">
        {lead}
      </span>
      {tile && (
        <div className={`ecg-track ${animated ? '' : 'ecg-paused'}`} style={{ animationDuration: `${durationSec}s` }}>
          {[0, 1].map(i => (
            <svg
              key={i}
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
