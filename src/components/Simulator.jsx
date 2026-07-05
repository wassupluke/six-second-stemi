import { useState, useMemo, useEffect } from 'react'
import { useOptions } from '../hooks/useOptions'
import { useSession } from '../hooks/useSession'
import { useGame } from '../hooks/useGame'
import { CASES } from '../data/cases'
import { DIAGNOSIS_IDS } from '../data/diagnoses'
import { TitleBar } from './TitleBar'
import { EcgScreen } from './EcgScreen'
import { ScreenOverlay } from './ScreenOverlay'
import { ControlBar } from './ControlBar'
import { AnswerGrid } from './AnswerGrid'
import { BottomBar } from './BottomBar'
import { OptionsModal } from './OptionsModal'
import { StatsPanel } from './StatsPanel'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// One representative case per diagnosis, in the diagnosis order, for LEARN.
function learnCases() {
  return DIAGNOSIS_IDS.map(id => CASES.find(c => c.diagnosis === id)).filter(Boolean)
}

export function Simulator() {
  const [mode, setMode] = useState('learn')
  const [modal, setModal] = useState(null) // 'options' | 'stats' | null
  const [learnIndex, setLearnIndex] = useState(0)
  const { options, setOption } = useOptions()
  const session = useSession()
  const game = useGame({ gameMinutes: options.gameMinutes, onGrade: session.gradeAnswer })

  const learn = useMemo(learnCases, [])
  const reduced = prefersReducedMotion()
  const animated = options.display === 'dynamic' && !reduced

  // Switching to LEARN resets the game so its timer stops.
  useEffect(() => { if (mode === 'learn' && game.phase !== 'idle') game.reset() }, [mode]) // eslint-disable-line

  const learnCase = learn[learnIndex] ?? null
  const shownCase = mode === 'game' ? game.currentCase : learnCase
  const overlayVariant =
    mode === 'learn' ? 'learn'
    : game.phase === 'idle' ? 'intro'
    : game.phase === 'answered' ? 'reveal'
    : game.phase === 'gameover' ? 'gameover'
    : null

  const overlay = overlayVariant && (
    <ScreenOverlay
      variant={overlayVariant}
      caseObj={overlayVariant === 'gameover' ? null : shownCase}
      result={overlayVariant === 'gameover' ? { ...game.counters } : game.lastResult}
      onStart={game.start}
      onNext={overlayVariant === 'gameover' ? game.reset : game.next}
      onPrev={() => setLearnIndex(i => (i - 1 + learn.length) % learn.length)}
      onNextLearn={() => setLearnIndex(i => (i + 1) % learn.length)}
    />
  )

  const answerDisabled = mode === 'game' && game.phase !== 'playing'

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col rounded-lg overflow-hidden shadow-2xl">
      <TitleBar bpm={shownCase?.bpm ?? null} />
      <EcgScreen caseObj={shownCase} animated={animated} grid={options.grid} overlay={overlay} />
      <ControlBar mode={mode} game={game} />
      <AnswerGrid
        mode={mode}
        selected={mode === 'learn' ? learnCase?.diagnosis : undefined}
        result={mode === 'game' ? game.lastResult : null}
        correctId={mode === 'game' ? shownCase?.diagnosis : undefined}
        disabled={answerDisabled}
        onPick={id => {
          if (mode === 'game') game.answer(id)
          else setLearnIndex(learn.findIndex(c => c.diagnosis === id))
        }}
      />
      <BottomBar
        mode={mode}
        onMode={setMode}
        onOpenStats={() => setModal('stats')}
        onOpenOptions={() => setModal('options')}
        muted={options.muted}
        onToggleMute={() => setOption('muted', !options.muted)}
      />
      {modal === 'options' && <OptionsModal options={options} setOption={setOption} onClose={() => setModal(null)} />}
      {modal === 'stats' && (
        <StatsPanel cumulativeStats={session.cumulativeStats} onReset={session.resetStats} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
