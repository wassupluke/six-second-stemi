import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ChoiceList } from '../../components/ChoiceList'

const options = [
  { id: 'inferior', label: 'Inferior' },
  { id: 'anterior', label: 'Anterior' },
]

test('renders all options', () => {
  render(<ChoiceList options={options} selected={null} onSelect={() => {}} correctId={null} />)
  expect(screen.getByText('Inferior')).toBeInTheDocument()
  expect(screen.getByText('Anterior')).toBeInTheDocument()
})

test('calls onSelect with id when option clicked', () => {
  const onSelect = vi.fn()
  render(<ChoiceList options={options} selected={null} onSelect={onSelect} correctId={null} />)
  fireEvent.click(screen.getByText('Inferior'))
  expect(onSelect).toHaveBeenCalledWith('inferior')
})

test('does not call onSelect when revealed (correctId set)', () => {
  const onSelect = vi.fn()
  render(<ChoiceList options={options} selected="inferior" onSelect={onSelect} correctId="inferior" />)
  fireEvent.click(screen.getByText('Anterior'))
  expect(onSelect).not.toHaveBeenCalled()
})

test('applies selected highlight class pre-reveal', () => {
  render(<ChoiceList options={options} selected="inferior" onSelect={() => {}} correctId={null} />)
  expect(screen.getByText('Inferior').closest('button')).toHaveClass('bg-blue-600')
})

test('shows correct option in green after reveal', () => {
  render(<ChoiceList options={options} selected="anterior" onSelect={() => {}} correctId="inferior" />)
  expect(screen.getByText('Inferior').closest('button')).toHaveClass('bg-green-600')
})

test('shows wrong selection in red after reveal', () => {
  render(<ChoiceList options={options} selected="anterior" onSelect={() => {}} correctId="inferior" />)
  expect(screen.getByText('Anterior').closest('button')).toHaveClass('bg-red-600')
})

test('unselected options stay neutral after reveal', () => {
  const threeOptions = [
    ...options, // existing options
    { id: 'lateral', label: 'Lateral' },
  ]
  render(<ChoiceList options={threeOptions} selected="anterior" onSelect={() => {}} correctId="inferior" />)
  const neutral = screen.getByRole('button', { name: 'Lateral' })
  expect(neutral).not.toHaveClass('bg-green-600')
  expect(neutral).not.toHaveClass('bg-red-600')
})
