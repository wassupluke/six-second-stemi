import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeScreen } from '../../components/PracticeScreen'

const mockECGs = [
  {
    id: 'ecg-001',
    image: '/ecgs/ecg-001.jpg',
    territory: 'inferior',
    vessel: 'RCA',
    leads_affected: ['II', 'III', 'aVF'],
    explanation: 'Inferior STEMI.',
    difficulty: 'classic',
  },
  {
    id: 'ecg-002',
    image: '/ecgs/ecg-002.jpg',
    territory: 'anterior',
    vessel: 'LAD',
    leads_affected: ['V1', 'V2', 'V3', 'V4'],
    explanation: 'Anterior STEMI.',
    difficulty: 'classic',
  },
]

const makeSession = (overrides = {}) => ({
  sessionProgress: { answered: 0, correct: 0 },
  cumulativeStats: { territory: {}, vessel: {} },
  gradeAnswer: vi.fn(),
  resetStats: vi.fn(),
  ...overrides,
})

beforeEach(() => { vi.clearAllMocks() })

test('renders ECG image', () => {
  render(<PracticeScreen ecgs={mockECGs} session={makeSession()} onSessionComplete={() => {}} />)
  expect(screen.getByRole('img')).toBeInTheDocument()
})

test('shows AnswerPanel with Territory and Vessel headings initially', () => {
  render(<PracticeScreen ecgs={mockECGs} session={makeSession()} onSessionComplete={() => {}} />)
  expect(screen.getByText('Territory')).toBeInTheDocument()
  expect(screen.getByText('Vessel')).toBeInTheDocument()
})

test('auto-reveals when both territory and vessel selected', () => {
  render(<PracticeScreen ecgs={mockECGs} session={makeSession()} onSessionComplete={() => {}} />)
  fireEvent.click(screen.getByText('Inferior'))
  fireEvent.click(screen.getByText('RCA'))
  expect(screen.getByText('Next ECG →')).toBeInTheDocument()
})

test('calls session.gradeAnswer with current ecg and selections on reveal', () => {
  const session = makeSession()
  render(<PracticeScreen ecgs={mockECGs} session={session} onSessionComplete={() => {}} />)
  fireEvent.click(screen.getByText('Inferior'))
  fireEvent.click(screen.getByText('RCA'))
  expect(session.gradeAnswer).toHaveBeenCalledWith(
    expect.objectContaining({ territory: 'inferior', vessel: 'RCA' }),
    'inferior',
    'RCA'
  )
})

test('shows AnswerPanel again after Next ECG clicked', () => {
  render(<PracticeScreen ecgs={mockECGs} session={makeSession()} onSessionComplete={() => {}} />)
  fireEvent.click(screen.getByText('Inferior'))
  fireEvent.click(screen.getByText('RCA'))
  fireEvent.click(screen.getByText('Next ECG →'))
  expect(screen.getByText('Territory')).toBeInTheDocument()
})

test('calls onSessionComplete when last ECG answered and Next clicked', () => {
  const onSessionComplete = vi.fn()
  render(
    <PracticeScreen ecgs={[mockECGs[0]]} session={makeSession()} onSessionComplete={onSessionComplete} />
  )
  fireEvent.click(screen.getByText('Inferior'))
  fireEvent.click(screen.getByText('RCA'))
  fireEvent.click(screen.getByText('Next ECG →'))
  expect(onSessionComplete).toHaveBeenCalled()
})
