import type { CSSProperties, MutableRefObject } from 'react'
import { useLang, useSystems } from '../../i18n/LangContext'
import { SystemIcon } from '../icons/SystemIcon'

interface Props {
  active: number
  onSelect: (index: number) => void
  buttonRefs: MutableRefObject<(HTMLButtonElement | null)[]>
}

/** Nav a pill con i 4 simboli: la pill scivola con translateX e prende il colore del sistema attivo. */
export function SystemNav({ active, onSelect, buttonRefs }: Props) {
  const { t } = useLang()
  const systems = useSystems()
  return (
    <nav className="sys-nav" data-system={systems[active].id} aria-label={t.systems.navLabel}>
      <span className="sys-nav__pill" style={{ '--i': active } as CSSProperties} aria-hidden="true" />
      {systems.map((s, i) => (
        <button
          key={s.id}
          ref={(el) => (buttonRefs.current[i] = el)}
          type="button"
          data-system={s.id}
          className={`sys-nav__btn ${i === active ? 'is-active' : ''}`}
          onClick={() => onSelect(i)}
          aria-label={s.fullName}
          aria-current={i === active ? 'true' : undefined}
        >
          <SystemIcon system={s.id} size={26} />
        </button>
      ))}
    </nav>
  )
}
