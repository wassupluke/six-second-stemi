import { render, screen, fireEvent } from '@testing-library/react'
import { RevealPanel } from '../../components/RevealPanel'

const ecg = {
  territory: 'inferior',
  vessel: 'RCA',
  leads_affected: ['II', 'III', 'aVF'],
  explanation: 'Classic inferior STEMI.',
}

test('shows check mark when territory is correct', () => {
  render(<RevealPanel ecg={ecg} selectedTerritory="inferior" selectedVessel="RCA" onNext={() => {}} />)
  expect(screen.getByText('✓ Inferior')).toBeInTheDocument()
})

test('shows X mark when territory is wrong', () => {
  render(<RevealPanel ecg={ecg} selectedTerritory="anterior" selectedVessel="RCA" onNext={() => {}} />)
  expect(screen.getByText('✗ Anterior')).toBeInTheDocument()
})

test('shows correct territory when territory is wrong', () => {
  render(<RevealPanel ecg={ecg} selectedTerritory="anterior" selectedVessel="RCA" onNext={() => {}} />)
  expect(screen.getByText('Inferior')).toBeInTheDocument()
})

test('shows check mark when vessel is correct', () => {
  render(<RevealPanel ecg={ecg} selectedTerritory="inferior" selectedVessel="RCA" onNext={() => {}} />)
  expect(screen.getByText('✓ RCA')).toBeInTheDocument()
})

test('shows X mark when vessel is wrong', () => {
  render(<RevealPanel ecg={ecg} selectedTerritory="inferior" selectedVessel="LAD" onNext={() => {}} />)
  expect(screen.getByText('✗ LAD')).toBeInTheDocument()
})

test('shows explanation text', () => {
  render(<RevealPanel ecg={ecg} selectedTerritory="inferior" selectedVessel="RCA" onNext={() => {}} />)
  expect(screen.getByText('Classic inferior STEMI.')).toBeInTheDocument()
})

test('shows leads_affected badges', () => {
  render(<RevealPanel ecg={ecg} selectedTerritory="inferior" selectedVessel="RCA" onNext={() => {}} />)
  expect(screen.getByText('II')).toBeInTheDocument()
  expect(screen.getByText('III')).toBeInTheDocument()
  expect(screen.getByText('aVF')).toBeInTheDocument()
})

test('calls onNext when Next ECG button clicked', () => {
  const onNext = vi.fn()
  render(<RevealPanel ecg={ecg} selectedTerritory="inferior" selectedVessel="RCA" onNext={onNext} />)
  fireEvent.click(screen.getByText('Next ECG →'))
  expect(onNext).toHaveBeenCalled()
})
