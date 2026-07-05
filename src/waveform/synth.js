export function pointsToPath(points) {
  if (points.length === 0) return ''
  const round = n => Math.round(n * 100) / 100
  const [x0, y0] = points[0]
  let d = `M${round(x0)},${round(y0)}`
  for (let i = 1; i < points.length; i++) {
    d += ` L${round(points[i][0])},${round(points[i][1])}`
  }
  return d
}
