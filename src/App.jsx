import { useState, useMemo } from 'react'
import ecgData from './data/ecgs.json'
import { shuffle } from './utils/shuffle'
import { useSession } from './hooks/useSession'
import { Header } from './components/Header'
import { PracticeScreen } from './components/PracticeScreen'
import { StatsScreen } from './components/StatsScreen'

export default function App() {
  const [view, setView] = useState('practice')
  const session = useSession()
  const shuffledECGs = useMemo(() => shuffle(ecgData), [])

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <Header
        sessionProgress={session.sessionProgress}
        onStatsClick={() => setView(v => (v === 'stats' ? 'practice' : 'stats'))}
      />
      {view === 'practice' ? (
        <PracticeScreen
          ecgs={shuffledECGs}
          session={session}
          onSessionComplete={() => setView('stats')}
        />
      ) : (
        <StatsScreen
          cumulativeStats={session.cumulativeStats}
          onReset={session.resetStats}
          onBack={() => setView('practice')}
        />
      )}
    </div>
  )
}
