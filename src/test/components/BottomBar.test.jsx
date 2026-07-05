import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { BottomBar } from '../../components/BottomBar'
import { OptionsModal } from '../../components/OptionsModal'

describe('BottomBar', () => {
  const noop = () => {}
  it('switches modes', () => {
    const onMode = vi.fn()
    const { getByText } = render(<BottomBar mode="learn" onMode={onMode} onOpenStats={noop} onOpenOptions={noop} muted={false} onToggleMute={noop} />)
    fireEvent.click(getByText('GAME'))
    expect(onMode).toHaveBeenCalledWith('game')
  })
  it('opens options', () => {
    const onOpen = vi.fn()
    const { getByLabelText } = render(<BottomBar mode="learn" onMode={noop} onOpenStats={noop} onOpenOptions={onOpen} muted={false} onToggleMute={noop} />)
    fireEvent.click(getByLabelText(/options/i))
    expect(onOpen).toHaveBeenCalled()
  })
  it('opens stats', () => {
    const onOpenStats = vi.fn()
    const { getByLabelText } = render(<BottomBar mode="learn" onMode={noop} onOpenStats={onOpenStats} onOpenOptions={noop} muted={false} onToggleMute={noop} />)
    fireEvent.click(getByLabelText(/stats/i))
    expect(onOpenStats).toHaveBeenCalled()
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
