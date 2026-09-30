import type { CSSProperties } from 'react'
import type { SystemId } from '../../data/systems'
import { SystemIcon } from '../icons/SystemIcon'

/** Posizione (angolo in gradi) e dimensione dei simboli sull'orbita. */
const SLOTS = [
  { a: -90, s: 16 },
  { a: -32, s: 20 },
  { a: 14, s: 14 },
  { a: 52, s: 26 },
  { a: 126, s: 16 },
  { a: 196, s: 22 },
] as const

/** Nell'Immunitario è il virus colpito dall'onda d'urto. */
const TARGET = 3

const CUBE_FACES = ['rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)']

function Cube3D({ delay }: { delay: number }) {
  return (
    <div className="cube3d-wrap">
      <div className="cube3d" style={{ '--delay': `${delay}s` } as CSSProperties}>
        {CUBE_FACES.map((f) => (
          <i key={f} style={{ transform: `${f} translateZ(calc(var(--s) * 0.35))` }} />
        ))}
      </div>
    </div>
  )
}

function Sparks() {
  return (
    <>
      {Array.from({ length: 7 }, (_, k) => {
        const ang = (k / 7) * Math.PI * 2
        return (
          <span
            key={k}
            className="spark"
            style={{ '--dx': `${Math.cos(ang) * 22}px`, '--dy': `${Math.sin(ang) * 22}px` } as CSSProperties}
          />
        )
      })}
    </>
  )
}

/** Simboli che fluttuano sull'orbita tratteggiata. Varianti per sistema: cubi 3D, virus colpito, buste in flusso. */
export function Orbit({ system }: { system: SystemId }) {
  return (
    <div className={`orbit-items ${system === 'ner' ? 'orbit-items--flow' : ''}`} aria-hidden="true">
      {SLOTS.map((slot, i) => {
        const isTarget = system === 'imm' && i === TARGET
        return (
          <div key={i} className="orbit-item" style={{ '--a': `${slot.a}deg` } as CSSProperties}>
            <div className="orbit-counter">
              <div className="orbit-float" style={{ '--s': `${slot.s}px`, '--delay': `${-i * 0.7}s` } as CSSProperties}>
                <div className={`orbit-sym ${isTarget ? 'is-target' : ''}`}>
                  <div className="orbit-hit">
                    {system === 'dig' ? (
                      <Cube3D delay={-i * 1.3} />
                    ) : (
                      <SystemIcon system={system} size="100%" strokeWidth={1.8} />
                    )}
                  </div>
                  {isTarget && <Sparks />}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
