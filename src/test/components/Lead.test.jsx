import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Lead } from '../../components/Lead'
import { beatWidthPx } from '../../waveform/beat'

// Fixed cell width so column phase offsets are computable in jsdom (where
// real layout measurement always yields 0).
const CELL_W = 192
vi.mock('../../hooks/useContainerWidth', () => ({
  useContainerWidth: () => [() => {}, CELL_W],
}))

const c = { diagnosis: 'inferior', bpm: 68 }

describe('Lead', () => {
  it('renders the lead label', () => {
    const { getByText } = render(<Lead caseObj={c} lead="II" animated height={80} />)
    expect(getByText('II')).toBeInTheDocument()
  })
  it('renders two path copies for seamless scroll', () => {
    const { container } = render(<Lead caseObj={c} lead="II" animated height={80} />)
    expect(container.querySelectorAll('path').length).toBe(2)
  })
  it('pauses animation when not animated', () => {
    const { container } = render(<Lead caseObj={c} lead="II" animated={false} height={80} />)
    expect(container.querySelector('.ecg-track').classList.contains('ecg-paused')).toBe(true)
  })
  it('renders an empty cell when caseObj is null', () => {
    const { container, getByText } = render(<Lead caseObj={null} lead="V1" animated height={80} />)
    expect(getByText('V1')).toBeInTheDocument()
    expect(container.querySelectorAll('path').length).toBe(0)
  })
  it('applies no phase shift in column 0 (aligned with the rhythm strip)', () => {
    const { container } = render(<Lead caseObj={c} lead="I" animated col={0} height={80} />)
    const ml = container.querySelector('.ecg-track').style.marginLeft
    expect(ml === '' || ml === '0px' || ml === '-0px').toBe(true)
  })
  it('shifts columns left by (column x-offset mod beat width) so R waves align across columns', () => {
    const col = 2
    const expected = (col * CELL_W) % beatWidthPx(c.bpm)
    const { container } = render(<Lead caseObj={c} lead="aVL" animated col={col} height={80} />)
    const track = container.querySelector('.ecg-track')
    expect(parseFloat(track.style.marginLeft)).toBeCloseTo(-expected, 2)
    // The tile must still overflow the cell after being pulled left.
    const svgW = parseFloat(track.querySelector('svg').style.width)
    expect(svgW).toBeGreaterThanOrEqual(CELL_W + expected)
  })
})
