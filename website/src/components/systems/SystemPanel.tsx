import { forwardRef, type CSSProperties } from 'react'
import { SYSTEMS, type SystemDef, type SystemId } from '../../data/systems'
import { img } from '../../lib/img'
import { Portal } from './Portal'
import { Reserve } from './Reserve'
import { SystemTitle } from './SystemTitle'

interface OrnamentDef {
  /** Dimensioni del ritaglio in px, per l'aspect ratio. */
  w: number
  h: number
  /** Larghezza a video. */
  width: string
  style: CSSProperties
}

/** Ornamenti d'angolo ritagliati dai fogli (maschere, colorate con --sys-light). */
const ORNAMENTS: Record<SystemId, { top?: OrnamentDef; bottom: OrnamentDef }> = {
  circ: {
    bottom: { w: 370, h: 205, width: 'min(50vw, 230px)', style: { bottom: 'calc(118px + 3svh)' } },
  },
  dig: {
    top: { w: 490, h: 490, width: 'min(44vw, 210px)', style: { top: 0 } },
    bottom: { w: 520, h: 370, width: 'min(50vw, 240px)', style: { bottom: 'calc(70px + 2svh)' } },
  },
  imm: {
    top: { w: 520, h: 400, width: 'min(50vw, 240px)', style: { top: 0 } },
    bottom: { w: 580, h: 420, width: 'min(54vw, 260px)', style: { bottom: 'calc(70px + 2svh)' } },
  },
  ner: {
    top: { w: 590, h: 500, width: 'min(50vw, 240px)', style: { top: 0 } },
    bottom: { w: 610, h: 480, width: 'min(54vw, 260px)', style: { bottom: 'calc(60px + 2svh)' } },
  },
}

function Ornament({ id, pos, def }: { id: SystemId; pos: 'top' | 'bottom'; def: OrnamentDef }) {
  return (
    <span
      className="ornament"
      aria-hidden="true"
      style={
        {
          ...def.style,
          width: def.width,
          aspectRatio: `${def.w} / ${def.h}`,
          '--img': `url(${img(`ornament-${id}-${pos}.png`)})`,
        } as CSSProperties
      }
    />
  )
}

/** ECG decorativo del Circolatorio: SVG vero, così si ridisegna con stroke-dashoffset. */
function CircEcg() {
  return (
    <svg className="sys-ecg" viewBox="0 0 300 120" fill="none" aria-hidden="true">
      <path
        d="M0 62h74M8 80h108l12-4 18-70 24 110 14-56 10 20h96"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  )
}

interface Props {
  system: SystemDef
  index: number
  active: boolean
  portalRef: (el: HTMLDivElement | null) => void
}

/** Template unico degli screen 3–6: tutti i colori arrivano da `data-system`. */
export const SystemPanel = forwardRef<HTMLDivElement, Props>(function SystemPanel(
  { system, index, active, portalRef },
  ref,
) {
  const orn = ORNAMENTS[system.id]
  const last = index === SYSTEMS.length - 1
  return (
    <article
      ref={ref}
      data-system={system.id}
      className={`sys-panel sys-bg ${active ? 'is-active' : ''}`}
      aria-hidden={!active}
      aria-label={`${system.prefix} ${system.name}`}
    >
      {system.id === 'circ' && <CircEcg />}
      {orn.top && <Ornament id={system.id} pos="top" def={orn.top} />}
      <Ornament id={system.id} pos="bottom" def={orn.bottom} />

      <div className="sys-panel__inner">
        <p className="sys-step">
          Sistema {index + 1} di {SYSTEMS.length}
        </p>
        <SystemTitle system={system} />
        <Portal ref={portalRef} system={system} />
        <div className="sys-copy">
          <h3>{system.headline}</h3>
          <p>{system.description}</p>
        </div>
        <Reserve system={system} />
        <p className="sys-hint">{last ? 'Scorri per continuare' : 'Scorri per il prossimo sistema'}</p>
      </div>
    </article>
  )
})
