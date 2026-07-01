import { render, screen, fireEvent } from '@testing-library/react'
import { StatsScreen } from '../../components/StatsScreen'

const stats = {
  territory: {
    inferior: { correct: 3, total: 4 },
    anterior: { correct: 2, total: 5 },
  },
  vessel: {
    RCA: { correct: 3, total: 4 },
    LAD: { correct: 2, total: 5 },
  },
}

test('shows empty state when no attempts yet', () => {
  render(<StatsScreen cumulativeStats={{ territory: {}, vessel: {} }} onReset={() => {}} onBack={() => {}} />)
  expect(screen.getByText('No attempts yet.')).toBeInTheDocument()
})

test('shows territory row with accuracy', () => {
  render(<StatsScreen cumulativeStats={stats} onReset={() => {}} onBack={() => {}} />)
  expect(screen.getByText('Inferior')).toBeInTheDocument()
  const rows = screen.getAllByText('75%')
  expect(rows.length).toBeGreaterThanOrEqual(1)
})

test('shows vessel row with accuracy', () => {
  render(<StatsScreen cumulativeStats={stats} onReset={() => {}} onBack={() => {}} />)
  expect(screen.getByText('RCA')).toBeInTheDocument()
  const rows = screen.getAllByText('75%')
  expect(rows.length).toBeGreaterThanOrEqual(1)
})

test('shows 40% accuracy for anterior (2/5)', () => {
  render(<StatsScreen cumulativeStats={stats} onReset={() => {}} onBack={() => {}} />)
  expect(screen.getByText('Anterior')).toBeInTheDocument()
  const rows = screen.getAllByText('40%')
  expect(rows.length).toBeGreaterThanOrEqual(1)
})

test('calls onReset when Reset all stats clicked', () => {
  const onReset = vi.fn()
  render(<StatsScreen cumulativeStats={stats} onReset={onReset} onBack={() => {}} />)
  fireEvent.click(screen.getByText('Reset all stats'))
  expect(onReset).toHaveBeenCalled()
})

test('calls onBack when Back to Practice clicked', () => {
  const onBack = vi.fn()
  render(<StatsScreen cumulativeStats={stats} onReset={() => {}} onBack={onBack} />)
  fireEvent.click(screen.getByText('← Back to Practice'))
  expect(onBack).toHaveBeenCalled()
})
