import { GAME_FACTS, SYSTEMS } from '../../data/systems'
import { SystemTile } from './SystemTile'

interface Props {
  onSelectSystem: (index: number, iconEl: HTMLElement) => void
}

/**
 * Contenuto dello screen 2. Scorre nel flusso normale sopra la stage pinnata (margine negativo),
 * le righe `.reveal-line` vengono accese da Dive a progress 0.7.
 */
export function Summary({ onSelectSystem }: Props) {
  return (
    <section id="il-gioco" className="summary" aria-labelledby="summary-title">
      <div className="mx-auto max-w-[460px]">
        <p className="reveal-line text-[15px] font-extrabold text-brace">Il gioco</p>
        <h2 id="summary-title" className="mt-3 font-cinzel text-[34px] font-bold leading-[1.08] text-osso">
          <span className="reveal-line block">Sei dentro.</span>
          <span className="reveal-line block">Quattro sistemi,</span>
          <span className="reveal-line block">un solo corpo.</span>
        </h2>
        <p className="reveal-line mt-4 text-osso">
          Gioco cooperativo: ogni giocatore guida un sistema del corpo. Qui andrà la descrizione breve.
        </p>

        <ul className="mt-6 grid grid-cols-3 gap-2.5">
          {GAME_FACTS.map((f) => (
            <li key={f.label} className="reveal-line stat">
              <span className="block font-cinzel text-[22px] font-bold leading-tight text-osso">{f.value}</span>
              <span className="block text-[14px] text-osso-2">{f.label}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-5 grid grid-cols-2 gap-3" aria-label="I quattro sistemi">
          {SYSTEMS.map((s, i) => (
            <li key={s.id} className="reveal-tile">
              <SystemTile system={s} onSelect={(icon) => onSelectSystem(i, icon)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
