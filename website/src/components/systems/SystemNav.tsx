import type { CSSProperties, MutableRefObject } from 'react'
import { SYSTEMS } from '../../data/systems'
import { SystemIcon } from '../icons/SystemIcon'

interface Props {
  active: number
  onSelect: (index: number) => void
  buttonRefs: MutableRefObject<(HTMLButtonElement | null)[]>
}

/** Nav a pill con i 4 simboli: la pill scivola con translateX e prende il colore del sistema attivo. */
export function SystemNav({ active, onSelect, buttonRefs }: Props) {
  return (
    <nav className="sys-nav" data-system={SYSTEMS[active].id} aria-label="Sistemi del corpo">
      <span className="sys-nav__pill" style={{ '--i': active } as CSSProperties} aria-hidden="true" />
      {SYSTEMS.map((s, i) => (
        <button
          key={s.id}
          ref={(el) => (buttonRefs.current[i] = el)}
          type="button"
          data-system={s.id}
          className={`sys-nav__btn ${i === active ? 'is-active' : ''}`}
          onClick={() => onSelect(i)}
          aria-label={`${s.prefix} ${s.name}`}
          aria-current={i === active ? 'true' : undefined}
        >
          <SystemIcon system={s.id} size={26} />
        </button>
      ))}
    </nav>
  )
}
