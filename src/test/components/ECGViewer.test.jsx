import { render, screen } from '@testing-library/react'
import { ECGViewer } from '../../components/ECGViewer'

const ecg = { image: '/ecgs/ecg-001.jpg', territory: 'inferior', vessel: 'RCA' }

test('renders image with correct src', () => {
  render(<ECGViewer ecg={ecg} />)
  expect(screen.getByRole('img')).toHaveAttribute('src', '/ecgs/ecg-001.jpg')
})

test('renders image with descriptive alt text', () => {
  render(<ECGViewer ecg={ecg} />)
  expect(screen.getByRole('img')).toHaveAttribute('alt', '12-lead ECG')
})
