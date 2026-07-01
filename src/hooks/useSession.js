import { useState, useCallback } from 'react'

const STORAGE_KEY = 'stemi-cumulative-stats'
const emptyStats = () => ({ territory: {}, vessel: {} })

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : emptyStats()
  } catch {
    return emptyStats()
  }
}

function addAccuracy(acc, key, isCorrect) {
  const prev = acc[key] ?? { correct: 0, total: 0 }
  return { ...acc, [key]: { correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 } }
}

export function useSession() {
  const [cumulativeStats, setCumulativeStats] = useState(readStorage)
  const [sessionProgress, setSessionProgress] = useState({ answered: 0, correct: 0 })

  const gradeAnswer = useCallback((ecg, selectedTerritory, selectedVessel) => {
    const tCorrect = selectedTerritory === ecg.territory
    const vCorrect = selectedVessel === ecg.vessel
    const bothCorrect = tCorrect && vCorrect

    setSessionProgress(prev => ({
      answered: prev.answered + 1,
      correct: prev.correct + (bothCorrect ? 1 : 0),
    }))

    setCumulativeStats(prev => {
      const next = {
        territory: addAccuracy(prev.territory, ecg.territory, tCorrect),
        vessel: addAccuracy(prev.vessel, ecg.vessel, vCorrect),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const resetStats = useCallback(() => {
    const empty = emptyStats()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty))
    setCumulativeStats(empty)
  }, [])

  return { sessionProgress, cumulativeStats, gradeAnswer, resetStats }
}
