import type { SystemDef } from '../../data/systems'
import { SystemIcon } from '../icons/SystemIcon'

/** Box Riserva, stessa forma dei fogli: gettoni pieni o vuoti (vuoti al 22%). */
export function Reserve({ system }: { system: SystemDef }) {
  const { filled, total } = system.reserve
  return (
    <div className="reserve" aria-label={`Riserva: ${filled} su ${total} ${system.resource}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span className="reserve__label">RISERVA</span>
          <SystemIcon system={system.id} size={24} className="text-sys-light" />
        </span>
        <span className="text-[14px] text-osso-2">{system.resource}</span>
      </div>
      <div className="mt-3 flex gap-[clamp(6px,2.6vw,14px)]" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`token ${i < filled ? '' : 'is-empty'}`}>
            <SystemIcon system={system.id} size={26} strokeWidth={2} />
          </span>
        ))}
      </div>
    </div>
  )
}
