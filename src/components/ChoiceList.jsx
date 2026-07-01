export function ChoiceList({ options, selected, onSelect, correctId }) {
  return (
    <ul className="flex flex-col gap-1 p-3">
      {options.map(opt => {
        const isCorrect = correctId === opt.id
        const isWrong = correctId !== null && selected === opt.id && !isCorrect
        const isSelectedPreReveal = selected === opt.id && correctId === null

        let cls =
          'w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none '
        if (isCorrect) cls += 'bg-green-600 text-white'
        else if (isWrong) cls += 'bg-red-600 text-white'
        else if (isSelectedPreReveal) cls += 'bg-blue-600 text-white'
        else cls += 'bg-gray-700 text-gray-200 hover:bg-gray-600'

        return (
          <li key={opt.id}>
            <button
              className={cls}
              onClick={() => correctId === null && onSelect(opt.id)}
              disabled={correctId !== null}
            >
              {opt.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
