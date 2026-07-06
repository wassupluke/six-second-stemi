import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { EcgScreen } from '../../components/EcgScreen'

const c = { diagnosis: 'anterior', bpm: 80 }

describe('EcgScreen', () => {
  it('carries the shared hover-freeze class so all tracks pause together', () => {
    // The .ecg-screen:hover rule in index.css pauses every .ecg-track at once;
    // per-lead pausing would permanently desync the hovered lead on resume.
    const { container } = render(<EcgScreen caseObj={c} animated grid overlay={null} />)
    expect(container.firstChild.classList.contains('ecg-screen')).toBe(true)
  })
  it('renders the 12-lead grid and the rhythm strip', () => {
    const { getAllByText } = render(<EcgScreen caseObj={c} animated grid overlay={null} />)
    expect(getAllByText('II').length).toBe(2) // grid cell + rhythm strip
  })
})
