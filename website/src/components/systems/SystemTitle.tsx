import { useEffect, useState } from 'react'
import type { SystemDef, SystemId } from '../../data/systems'
import { useLang } from '../../i18n/LangContext'

/** Altezza del bastone rispetto a una larghezza di 240px, misurata sui fogli (nomi italiani). */
const BLOCK_H: Record<SystemId, number> = { circ: 64, dig: 89, imm: 70, ner: 104 }
const BLOCK_W = 240
/** Nei fogli il bastone è allungato in verticale di circa 2× rispetto ad Anton: stessa resa per le altre lingue. */
const STRETCH_Y = 2

const blockHeight = (id: SystemId, useSheet: boolean, box: Box) =>
  useSheet
    ? BLOCK_H[id]
    : Math.round(Math.min(104, Math.max(56, (BLOCK_W * (box.ascent + box.descent) * STRETCH_Y) / box.width)))

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
  const { lang } = useLang()
  const text = system.name.toUpperCase()
  const [box, setBox] = useState<Box>(() => measure(text))

  useEffect(() => {
    let alive = true
    setBox(measure(text))
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
        style={{ aspectRatio: `${BLOCK_W} / ${blockHeight(system.id, lang === 'it', box)}` }}
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
        {system.fullName}
      </span>
    </h2>
  )
}
