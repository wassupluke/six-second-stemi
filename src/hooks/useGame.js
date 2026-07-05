import { useState, useRef, useEffect, useCallback } from 'react'
import { getDeck } from '../data/cases'
import { shuffle } from '../utils/shuffle'

const CHANCES = { novice: 3, practitioner: 1 }

export function useGame({ gameMinutes, onGrade }) {
  const [phase, setPhase] = useState('idle')
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [chancesLeft, setChancesLeft] = useState(0)
  const [maxChances, setMaxChances] = useState(0)
  const [timerRemaining, setTimerRemaining] = useState(gameMinutes * 60)
  const [counters, setCounters] = useState({ cases: 0, correct: 0, attempts: 0 })
  const [lastResult, setLastResult] = useState(null)
  const difficultyRef = useRef('novice')

  const currentCase = phase === 'idle' || phase === 'gameover' ? null : (deck[index] ?? null)

  // 1 Hz countdown while playing (freezes on 'answered'). The updater stays
  // pure; the gameover transition is handled by the effect below.
  useEffect(() => {
    if (phase !== 'playing') return undefined
    const id = setInterval(() => {
      setTimerRemaining(t => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  // End the game when the clock runs out.
  useEffect(() => {
    if (phase === 'playing' && timerRemaining === 0) setPhase('gameover')
  }, [phase, timerRemaining])

  const start = useCallback((difficulty) => {
    difficultyRef.current = difficulty
    setDeck(shuffle(getDeck(difficulty)))
    setIndex(0)
    setChancesLeft(CHANCES[difficulty] ?? 3)
    setMaxChances(CHANCES[difficulty] ?? 3)
    setTimerRemaining(gameMinutes * 60)
    setCounters({ cases: 0, correct: 0, attempts: 0 })
    setLastResult(null)
    setPhase('playing')
  }, [gameMinutes])

  const answer = useCallback((diagnosisId) => {
    if (phase !== 'playing') return
    const c = deck[index]
    if (!c) return
    const correct = diagnosisId === c.diagnosis
    if (correct) {
      setCounters(p => ({ cases: p.cases + 1, correct: p.correct + 1, attempts: p.attempts + 1 }))
      setLastResult({ correct: true, selected: diagnosisId })
      onGrade(c, diagnosisId)
      setPhase('answered')
      return
    }
    const remaining = chancesLeft - 1
    setChancesLeft(remaining)
    setCounters(p => ({ ...p, attempts: p.attempts + 1 }))
    if (remaining <= 0) {
      setCounters(p => ({ ...p, cases: p.cases + 1 }))
      setLastResult({ correct: false, selected: diagnosisId })
      onGrade(c, diagnosisId)
      setPhase('answered')
    }
  }, [phase, deck, index, chancesLeft, onGrade])

  const next = useCallback(() => {
    const ni = index + 1
    if (ni >= deck.length) { setPhase('gameover'); return }
    setIndex(ni)
    setChancesLeft(CHANCES[difficultyRef.current] ?? 3)
    setLastResult(null)
    setPhase('playing')
  }, [index, deck.length])

  const reset = useCallback(() => {
    setPhase('idle')
    setLastResult(null)
    setTimerRemaining(gameMinutes * 60)
  }, [gameMinutes])

  return { phase, currentCase, chancesLeft, maxChances, timerRemaining, counters, lastResult, start, answer, next, reset }
}
