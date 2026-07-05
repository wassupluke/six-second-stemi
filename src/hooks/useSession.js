import { useState, useCallback } from 'react'

const STORAGE_KEY = 'stemi-cumulative-stats'
const emptyStats = () => ({ diagnosis: {} })

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { diagnosis: {}, ...JSON.parse(raw) } : emptyStats()
  } catch {
    return emptyStats()
  }
}

function bump(bucket, key, isCorrect) {
  const prev = bucket[key] ?? { correct: 0, total: 0 }
  return { ...bucket, [key]: { correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 } }
}

export function useSession() {
  const [cumulativeStats, setCumulativeStats] = useState(readStorage)
  const [sessionProgress, setSessionProgress] = useState({ answered: 0, correct: 0 })

  const gradeAnswer = useCallback((caseObj, selectedDiagnosisId) => {
    const correct = selectedDiagnosisId === caseObj.diagnosis
    setSessionProgress(prev => ({
      answered: prev.answered + 1,
      correct: prev.correct + (correct ? 1 : 0),
    }))
    setCumulativeStats(prev => {
      const next = { diagnosis: bump(prev.diagnosis, caseObj.diagnosis, correct) }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
    return correct
  }, [])

  const resetStats = useCallback(() => {
    const empty = emptyStats()
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(empty)) } catch { /* ignore */ }
    setCumulativeStats(empty)
  }, [])

  return { sessionProgress, cumulativeStats, gradeAnswer, resetStats }
}
