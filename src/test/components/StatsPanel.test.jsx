import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { StatsPanel } from '../../components/StatsPanel'

const stats = { diagnosis: { inferior: { correct: 3, total: 4 }, anterior: { correct: 1, total: 2 } } }

describe('StatsPanel', () => {
  it('shows per-diagnosis accuracy', () => {
    const { getByText } = render(<StatsPanel cumulativeStats={stats} onReset={() => {}} onClose={() => {}} />)
    expect(getByText(/Inferior/)).toBeInTheDocument()
    expect(getByText(/3\/4/)).toBeInTheDocument()
    expect(getByText(/75%/)).toBeInTheDocument()
  })
  it('reset fires', () => {
    const onReset = vi.fn()
    const { getByText } = render(<StatsPanel cumulativeStats={stats} onReset={onReset} onClose={() => {}} />)
    fireEvent.click(getByText(/Reset all stats/i))
    expect(onReset).toHaveBeenCalled()
  })
  it('shows a dash for diagnoses with no attempts', () => {
    const { getAllByText } = render(<StatsPanel cumulativeStats={{ diagnosis: {} }} onReset={() => {}} onClose={() => {}} />)
    expect(getAllByText('—').length).toBeGreaterThan(0)
  })
})
