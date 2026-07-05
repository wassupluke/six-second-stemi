import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { BottomBar } from '../../components/BottomBar'
import { OptionsModal } from '../../components/OptionsModal'

describe('BottomBar', () => {
  it('switches modes', () => {
    const onMode = vi.fn()
    const { getByText } = render(<BottomBar mode="learn" onMode={onMode} onOpenOptions={() => {}} muted={false} onToggleMute={() => {}} />)
    fireEvent.click(getByText('GAME'))
    expect(onMode).toHaveBeenCalledWith('game')
  })
  it('opens options', () => {
    const onOpen = vi.fn()
    const { getByLabelText } = render(<BottomBar mode="learn" onMode={() => {}} onOpenOptions={onOpen} muted={false} onToggleMute={() => {}} />)
    fireEvent.click(getByLabelText(/options/i))
    expect(onOpen).toHaveBeenCalled()
  })
})

describe('OptionsModal', () => {
  const options = { gameMinutes: 5, display: 'dynamic', grid: true, volume: 0.6, muted: false }
  it('toggles static display', () => {
    const setOption = vi.fn()
    const { getByLabelText } = render(<OptionsModal options={options} setOption={setOption} onClose={() => {}} />)
    fireEvent.click(getByLabelText('Static ECG'))
    expect(setOption).toHaveBeenCalledWith('display', 'static')
  })
  it('toggles grid off', () => {
    const setOption = vi.fn()
    const { getByLabelText } = render(<OptionsModal options={options} setOption={setOption} onClose={() => {}} />)
    fireEvent.click(getByLabelText('Grid Off'))
    expect(setOption).toHaveBeenCalledWith('grid', false)
  })
})
