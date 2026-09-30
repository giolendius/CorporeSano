import { useEffect, useState } from 'react'
import type { SystemDef, SystemId } from '../../data/systems'

/** Altezza del bastone rispetto a una larghezza di 240px, misurata sui fogli. */
const BLOCK_H: Record<SystemId, number> = { circ: 64, dig: 89, imm: 70, ner: 104 }

interface Box {
  left: number
  width: number
  ascent: number
  descent: number
  advance: number
}

const FONT = '100px Anton, Impact, sans-serif'

function measure(text: string): Box {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return { left: 0, width: text.length * 45, ascent: 88, descent: 0, advance: text.length * 45 }
  ctx.font = FONT
  const m = ctx.measureText(text)
  return {
    left: m.actualBoundingBoxLeft,
    width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    ascent: m.actualBoundingBoxAscent,
    descent: m.actualBoundingBoxDescent,
    advance: m.width,
  }
}

/**
 * Nome del sistema come testo live: bastone Anton stirato nel box dei fogli (ultra-condensato)
 * + script "Apparato/Sistema". Il viewBox coincide con i bordi reali dei glifi, così il testo
 * riempie esattamente il box indipendentemente dalle metriche del font.
 */
export function SystemTitle({ system }: { system: SystemDef }) {
  const text = system.name.toUpperCase()
  const [box, setBox] = useState<Box>(() => measure(text))

  useEffect(() => {
    let alive = true
    document.fonts?.load(FONT, text).then(() => alive && setBox(measure(text)))
    return () => {
      alive = false
    }
  }, [text])

  return (
    <h2 className="sys-title">
      <span className="sys-title__script" aria-hidden="true">
        {system.prefix}
      </span>
      <svg
        className="sys-title__block"
        viewBox={`${-box.left} ${-box.ascent} ${box.width} ${box.ascent + box.descent}`}
        preserveAspectRatio="none"
        style={{ aspectRatio: `240 / ${BLOCK_H[system.id]}` }}
        aria-hidden="true"
      >
        <text
          x="0"
          y="0"
          fontFamily="Anton, Impact, sans-serif"
          fontSize="100"
          textLength={box.advance}
          lengthAdjust="spacingAndGlyphs"
        >
          {text}
        </text>
      </svg>
      <span className="sr-only">
        {system.prefix} {system.name}
      </span>
    </h2>
  )
}
