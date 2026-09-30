import { useLang, useSystems } from '../../i18n/LangContext'
import { SystemIcon } from '../icons/SystemIcon'

interface Props {
  onSelect: (index: number, iconEl: HTMLElement) => void
}

/**
 * Badge "Asimmetria": i 4 simboli, ognuno con una micro-animazione diversa.
 * Sono tappabili (area ≥ 44px) e il simbolo tappato diventa il portale del sistema.
 */
export function AsymmetryBadge({ onSelect }: Props) {
  const { t } = useLang()
  const systems = useSystems()
  return (
    <div className="badge asym">
      {systems.map((s, i) => (
        <button
          key={s.id}
          type="button"
          data-system={s.id}
          className="asym__btn"
          aria-label={t.summary.asym.discover(s.fullName)}
          onClick={(e) => {
            const icon = e.currentTarget.querySelector<HTMLElement>('.asym__sym')
            if (icon) onSelect(i, icon)
          }}
        >
          <span className={`asym__sym asym__sym--${s.id}`}>
            <SystemIcon system={s.id} size={22} strokeWidth={2} />
          </span>
        </button>
      ))}
    </div>
  )
}
