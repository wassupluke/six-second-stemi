import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { GameControls } from '../../components/GameControls'
import { TitleBar } from '../../components/TitleBar'

describe('TitleBar', () => {
  it('shows heart rate when bpm present', () => {
    const { getByText } = render(<TitleBar bpm={68} />)
    expect(getByText('68')).toBeInTheDocument()
    expect(getByText(/HEART RATE/i)).toBeInTheDocument()
  })
  it('omits heart rate when no bpm', () => {
    const { queryByText } = render(<TitleBar bpm={null} />)
    expect(queryByText(/HEART RATE/i)).toBeNull()
  })
})

describe('GameControls', () => {
  const base = { phase: 'playing', timerRemaining: 125, chancesLeft: 2, maxChances: 3,
    counters: { cases: 3, correct: 2, attempts: 4 }, onReset: () => {} }
  it('formats the timer as mm:ss', () => {
    const { getByText } = render(<GameControls {...base} />)
    expect(getByText('02:05')).toBeInTheDocument()
  })
  it('shows counters with correct percentage', () => {
    const { getByText } = render(<GameControls {...base} />)
    expect(getByText(/Correct: 2 \(67%\)/)).toBeInTheDocument()
  })
  it('shows attempts accuracy percentage', () => {
    const { getByText } = render(<GameControls {...base} />)
    expect(getByText(/Attempts: 4 \(50%\)/)).toBeInTheDocument()
  })
  it('shows chances remaining while playing', () => {
    const { getByText } = render(<GameControls {...base} />)
    expect(getByText(/2 Chances Remaining/)).toBeInTheDocument()
  })
  it('hides the chances hint until below the difficulty max', () => {
    const { queryByText } = render(<GameControls {...base} chancesLeft={3} maxChances={3} />)
    expect(queryByText(/Chance/)).toBeNull()
  })
  it('reset fires', () => {
    const onReset = vi.fn()
    const { getByText } = render(<GameControls {...base} onReset={onReset} />)
    fireEvent.click(getByText(/Reset/i))
    expect(onReset).toHaveBeenCalled()
  })
})
