import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { AnswerGrid } from '../../components/AnswerGrid'

describe('AnswerGrid', () => {
  it('renders all 8 diagnosis labels', () => {
    const { getByText } = render(<AnswerGrid mode="game" onPick={() => {}} />)
    for (const label of ['No STEMI','Anterior','Anteroseptal','Anterolateral','Lateral','Inferior','Posterior','RV']) {
      expect(getByText(label)).toBeInTheDocument()
    }
  })
  it('calls onPick with the id', () => {
    const onPick = vi.fn()
    const { getByText } = render(<AnswerGrid mode="game" onPick={onPick} />)
    fireEvent.click(getByText('Inferior'))
    expect(onPick).toHaveBeenCalledWith('inferior')
  })
  it('marks the selected wrong answer red and the correct answer green after answering', () => {
    const { getByText } = render(
      <AnswerGrid mode="game" disabled result={{ correct: false, selected: 'anterior' }} correctId="inferior" onPick={() => {}} />
    )
    expect(getByText('Anterior').className).toMatch(/red/)
    expect(getByText('Inferior').className).toMatch(/green/)
  })
  it('disables buttons when disabled', () => {
    const onPick = vi.fn()
    const { getByText } = render(<AnswerGrid mode="game" disabled onPick={onPick} />)
    fireEvent.click(getByText('Lateral'))
    expect(onPick).not.toHaveBeenCalled()
  })
})
