import { diagnosisById } from '../data/diagnoses'

function Badges({ leads }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {leads.map(l => (
        <span key={l} className="px-1.5 py-0.5 text-[11px] rounded bg-trace/15 text-trace">{l}</span>
      ))}
    </div>
  )
}

export function ScreenOverlay({ variant, caseObj, result, onStart, onNext, onPrev, onNextLearn }) {
  if (variant === 'intro') {
    return (
      <Card>
        <h2 className="text-xl font-bold text-trace">Explore. Review. Play.</h2>
        <p className="text-trace/80 text-sm mt-1">Identify the STEMI territory shown, or call No STEMI.</p>
        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 rounded bg-game text-white font-semibold" onClick={() => onStart('novice')}>Novice</button>
          <button className="px-4 py-2 rounded bg-game/80 text-white font-semibold" onClick={() => onStart('practitioner')}>Practitioner</button>
        </div>
      </Card>
    )
  }
  if (variant === 'reveal' && caseObj) {
    const label = diagnosisById(caseObj.diagnosis)?.label ?? caseObj.diagnosis
    const name = caseObj.mimic ? `${label} (${caseObj.mimic})` : `${label} STEMI`
    return (
      <Card>
        <h2 className="text-lg font-bold text-trace">
          {result?.correct ? '✓ ' : '✗ Incorrect — '}{name}
        </h2>
        {caseObj.culprit && caseObj.culprit !== '-' && (
          <p className="text-sm text-trace/80 mt-1">Culprit: {caseObj.culprit}</p>
        )}
        <p className="text-trace/85 text-sm mt-2">{caseObj.explanation}</p>
        {caseObj.leads_affected?.length > 0 && <Badges leads={caseObj.leads_affected} />}
        <div className="flex justify-end mt-3">
          <button className="px-4 py-2 rounded bg-game text-white font-semibold" onClick={onNext}>Next Case →</button>
        </div>
      </Card>
    )
  }
  if (variant === 'learn' && caseObj) {
    const label = diagnosisById(caseObj.diagnosis)?.label ?? caseObj.diagnosis
    return (
      <Card>
        <div className="flex items-center justify-between">
          <button className="px-3 py-1 rounded bg-trace/10 text-trace" onClick={onPrev}>‹ Prev</button>
          <h2 className="text-lg font-bold text-trace">{label}</h2>
          <button className="px-3 py-1 rounded bg-trace/10 text-trace" onClick={onNextLearn}>Next ›</button>
        </div>
        <p className="text-trace/85 text-sm mt-2">{caseObj.explanation}</p>
        {caseObj.leads_affected?.length > 0 && <Badges leads={caseObj.leads_affected} />}
      </Card>
    )
  }
  if (variant === 'gameover') {
    return (
      <Card>
        <h2 className="text-xl font-bold text-trace">Game over</h2>
        <p className="text-trace/85 text-sm mt-1">
          {result ? `Correct ${result.correct}/${result.cases} (${result.cases ? Math.round(100*result.correct/result.cases) : 0}%)` : ''}
        </p>
        <div className="flex justify-end mt-3">
          <button className="px-4 py-2 rounded bg-game text-white font-semibold" onClick={onNext}>Play again</button>
        </div>
      </Card>
    )
  }
  return null
}

function Card({ children }) {
  return (
    <div className="absolute inset-x-0 bottom-0 m-3 p-4 rounded-lg bg-bezel/95 backdrop-blur border border-grid/50">
      {children}
    </div>
  )
}
