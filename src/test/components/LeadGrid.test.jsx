import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LeadGrid } from '../../components/LeadGrid'
import { RhythmStrip } from '../../components/RhythmStrip'
import { LEADS } from '../../data/templates'

const c = { diagnosis: 'anterior', bpm: 80 }

describe('LeadGrid', () => {
  it('renders all 12 lead labels', () => {
    const { getAllByText, getByText } = render(<LeadGrid caseObj={c} animated />)
    for (const l of LEADS) {
      // "II" also appears in the rhythm strip elsewhere; within the grid each appears once.
      expect(getByText(l)).toBeInTheDocument()
    }
    expect(getAllByText('V4').length).toBe(1)
  })
})

describe('RhythmStrip', () => {
  it('labels itself as lead II', () => {
    const { getByText } = render(<RhythmStrip caseObj={c} animated />)
    expect(getByText('II')).toBeInTheDocument()
  })
})
