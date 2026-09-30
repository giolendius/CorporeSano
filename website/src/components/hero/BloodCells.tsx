import type { CSSProperties } from 'react'

interface Cell {
  x: number // % left
  y: number // % top
  size: number // px
  blur: number
  op: number
  dur: number
  delay: number
  dx: number
  dy: number
}

/** Pseudo-random deterministico: stessa disposizione a ogni render. */
function makeCells(count: number, seed: number): Cell[] {
  let s = seed
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  return Array.from({ length: count }, () => {
    const size = 14 + rnd() * 34
    return {
      x: rnd() * 100,
      y: rnd() * 100,
      size,
      blur: size > 36 ? 3 + rnd() * 3 : rnd() * 1.5,
      op: 0.55 + rnd() * 0.4,
      dur: 7 + rnd() * 8,
      delay: -rnd() * 10,
      dx: (rnd() - 0.5) * 50,
      dy: -10 - rnd() * 40,
    }
  })
}

/** Globuli rossi generati in CSS: si muovono, quindi non vengono dall'immagine. */
export function BloodCells({ count = 12, seed = 7 }: { count?: number; seed?: number }) {
  const cells = makeCells(count, seed)
  return (
    <>
      {cells.map((c, i) => (
        <span
          key={i}
          className="rbc"
          style={
            {
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.size,
              height: c.size * 0.92,
              '--blur': `${c.blur.toFixed(1)}px`,
              '--op': c.op.toFixed(2),
              '--dur': `${c.dur.toFixed(1)}s`,
              '--delay': `${c.delay.toFixed(1)}s`,
              '--dx': `${c.dx.toFixed(0)}px`,
              '--dy': `${c.dy.toFixed(0)}px`,
            } as CSSProperties
          }
        />
      ))}
    </>
  )
}
