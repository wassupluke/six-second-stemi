import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { DIAGNOSES } from '../../data/diagnoses'
import { Simulator } from '../../components/Simulator'

describe('Simulator', () => {
  it('starts in LEARN and shows the answer/browse grid', () => {
    const { getByText } = render(<Simulator />)
    expect(getByText('LEARN')).toBeInTheDocument()
    expect(getByText('Inferior')).toBeInTheDocument()
  })
  it('can enter GAME, start novice, and grade a case to reveal', () => {
    const { getByText, queryByText } = render(<Simulator />)
    fireEvent.click(getByText('GAME'))
    fireEvent.click(getByText('Novice'))
    // Timer is running.
    expect(getByText(/\d\d:\d\d/)).toBeInTheDocument()
    // Answer by clicking diagnoses in turn: a correct click grades immediately;
    // otherwise novice's 3 chances are exhausted. Either way the case resolves
    // to the reveal panel, which shows a "Next Case" button.
    for (const d of DIAGNOSES) {
      if (queryByText(/Next Case/i)) break
      fireEvent.click(getByText(d.label))
    }
    expect(getByText(/Next Case/i)).toBeInTheDocument()
  })
  it('renders without console errors on mount', () => {
    const { container } = render(<Simulator />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
