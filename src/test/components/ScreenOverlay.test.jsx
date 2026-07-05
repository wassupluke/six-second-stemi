import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ScreenOverlay } from '../../components/ScreenOverlay'

const c = { diagnosis: 'inferior', culprit: 'RCA', leads_affected: ['II','III','aVF'],
  explanation: 'Inferior STEMI teaching text.' }

describe('ScreenOverlay', () => {
  it('intro offers both difficulties', () => {
    const onStart = vi.fn()
    const { getByText } = render(<ScreenOverlay variant="intro" onStart={onStart} />)
    fireEvent.click(getByText('Novice'))
    expect(onStart).toHaveBeenCalledWith('novice')
    fireEvent.click(getByText('Practitioner'))
    expect(onStart).toHaveBeenCalledWith('practitioner')
  })
  it('reveal shows verdict, culprit, explanation, lead badges, and Next', () => {
    const onNext = vi.fn()
    const { getByText, getByRole } = render(
      <ScreenOverlay variant="reveal" caseObj={c} result={{ correct: true, selected: 'inferior' }} onNext={onNext} />
    )
    expect(getByRole('heading', { name: /Inferior STEMI/i })).toBeInTheDocument()
    expect(getByText(/RCA/)).toBeInTheDocument()
    expect(getByText('Inferior STEMI teaching text.')).toBeInTheDocument()
    expect(getByText('III')).toBeInTheDocument()
    fireEvent.click(getByText(/Next Case/i))
    expect(onNext).toHaveBeenCalled()
  })
  it('reveal marks incorrect answers', () => {
    const { getByText } = render(
      <ScreenOverlay variant="reveal" caseObj={c} result={{ correct: false, selected: 'anterior' }} onNext={() => {}} />
    )
    expect(getByText(/Incorrect/i)).toBeInTheDocument()
  })
  it('reveal names the mimic for no-stemi cases', () => {
    const nc = { diagnosis: 'no-stemi', mimic: 'benign early repolarization', culprit: '-',
      leads_affected: [], explanation: 'BER teaching text.' }
    const { getByRole } = render(
      <ScreenOverlay variant="reveal" caseObj={nc} result={{ correct: true, selected: 'no-stemi' }} onNext={() => {}} />
    )
    expect(getByRole('heading', { name: /No STEMI \(benign early repolarization\)/i })).toBeInTheDocument()
  })
})
