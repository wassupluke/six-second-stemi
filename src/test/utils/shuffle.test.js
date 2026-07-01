import { shuffle } from '../../utils/shuffle'

test('returns array of same length', () => {
  expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5)
})

test('returns array with same elements', () => {
  expect(shuffle([1, 2, 3, 4, 5]).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
})

test('does not mutate original array', () => {
  const arr = [1, 2, 3]
  shuffle(arr)
  expect(arr).toEqual([1, 2, 3])
})
