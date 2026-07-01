import { render, screen, fireEvent } from '@testing-library/react'
import { AnswerPanel } from '../../components/AnswerPanel'
import { vi } from 'vitest'

test('renders Territory and Vessel headings', () => {
  render(<AnswerPanel selectedTerritory={null} selectedVessel={null} onSelect={() => {}} />)
  expect(screen.getByText('Territory')).toBeInTheDocument()
  expect(screen.getByText('Vessel')).toBeInTheDocument()
})

test('renders all 7 territory options', () => {
  render(<AnswerPanel selectedTerritory={null} selectedVessel={null} onSelect={() => {}} />)
  expect(screen.getByText('Inferior')).toBeInTheDocument()
  expect(screen.getByText('Anterior')).toBeInTheDocument()
  expect(screen.getByText('Anterolateral')).toBeInTheDocument()
})

test('renders all 5 vessel options', () => {
  render(<AnswerPanel selectedTerritory={null} selectedVessel={null} onSelect={() => {}} />)
  expect(screen.getByText('RCA')).toBeInTheDocument()
  expect(screen.getByText('LAD (proximal)')).toBeInTheDocument()
  expect(screen.getByText('LCx')).toBeInTheDocument()
})

test('calls onSelect with (territory, id) when territory option clicked', () => {
  const onSelect = vi.fn()
  render(<AnswerPanel selectedTerritory={null} selectedVessel={null} onSelect={onSelect} />)
  fireEvent.click(screen.getByText('Inferior'))
  expect(onSelect).toHaveBeenCalledWith('territory', 'inferior')
})

test('calls onSelect with (vessel, id) when vessel option clicked', () => {
  const onSelect = vi.fn()
  render(<AnswerPanel selectedTerritory={null} selectedVessel={null} onSelect={onSelect} />)
  fireEvent.click(screen.getByText('RCA'))
  expect(onSelect).toHaveBeenCalledWith('vessel', 'RCA')
})
