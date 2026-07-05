import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Lead } from '../../components/Lead'

const c = { diagnosis: 'inferior', bpm: 68 }

describe('Lead', () => {
  it('renders the lead label', () => {
    const { getByText } = render(<Lead caseObj={c} lead="II" animated height={80} />)
    expect(getByText('II')).toBeInTheDocument()
  })
  it('renders two path copies for seamless scroll', () => {
    const { container } = render(<Lead caseObj={c} lead="II" animated height={80} />)
    expect(container.querySelectorAll('path').length).toBe(2)
  })
  it('pauses animation when not animated', () => {
    const { container } = render(<Lead caseObj={c} lead="II" animated={false} height={80} />)
    expect(container.querySelector('.ecg-track').classList.contains('ecg-paused')).toBe(true)
  })
  it('renders an empty cell when caseObj is null', () => {
    const { container, getByText } = render(<Lead caseObj={null} lead="V1" animated height={80} />)
    expect(getByText('V1')).toBeInTheDocument()
    expect(container.querySelectorAll('path').length).toBe(0)
  })
})
