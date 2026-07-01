import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../../components/Header'

test('renders app title', () => {
  render(<Header sessionProgress={{ answered: 0, correct: 0 }} onStatsClick={() => {}} />)
  expect(screen.getByText('Six-Second STEMI')).toBeInTheDocument()
})

test('shows session score when answered > 0', () => {
  render(<Header sessionProgress={{ answered: 5, correct: 3 }} onStatsClick={() => {}} />)
  expect(screen.getByText('3/5')).toBeInTheDocument()
})

test('hides session score when answered is 0', () => {
  render(<Header sessionProgress={{ answered: 0, correct: 0 }} onStatsClick={() => {}} />)
  expect(screen.queryByText('0/0')).not.toBeInTheDocument()
})

test('renders Stats button', () => {
  render(<Header sessionProgress={{ answered: 0, correct: 0 }} onStatsClick={() => {}} />)
  expect(screen.getByText('Stats')).toBeInTheDocument()
})

test('calls onStatsClick when Stats button clicked', () => {
  const onStatsClick = vi.fn()
  render(<Header sessionProgress={{ answered: 0, correct: 0 }} onStatsClick={onStatsClick} />)
  fireEvent.click(screen.getByText('Stats'))
  expect(onStatsClick).toHaveBeenCalled()
})
