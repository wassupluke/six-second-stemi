import { GameControls } from './GameControls'
import { LearnControls } from './LearnControls'

export function ControlBar({ mode, game }) {
  if (mode === 'game' && game.phase !== 'idle') {
    return (
      <GameControls
        phase={game.phase}
        timerRemaining={game.timerRemaining}
        chancesLeft={game.chancesLeft}
        maxChances={game.maxChances}
        counters={game.counters}
        onReset={game.reset}
      />
    )
  }
  return <LearnControls />
}
