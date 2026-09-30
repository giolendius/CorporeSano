import { useLang } from '../../i18n/LangContext'
import { AsymmetryBadge } from './AsymmetryBadge'
import { CoopBadge } from './CoopBadge'
import { Dilemma } from './Dilemma'
import { PillarCard } from './PillarCard'

interface Props {
  onSelectSystem: (index: number, iconEl: HTMLElement) => void
}

/**
 * Contenuto dello screen 2. Scorre nel flusso normale sopra la stage pinnata (margine negativo):
 * kicker e headline (`.reveal-line`) li accende Dive a progress 0.85, card e frase arrivano con lo scroll.
 */
export function Summary({ onSelectSystem }: Props) {
  const { t } = useLang()
  const s = t.summary
  return (
    <section id="il-gioco" className="summary" aria-labelledby="summary-title">
      <div className="mx-auto max-w-[460px]">
        <p className="reveal-line text-[15px] font-extrabold text-brace">{s.kicker}</p>
        <h2 id="summary-title" className="mt-2 font-cinzel text-[32px] font-bold leading-[1.08] text-osso">
          <span className="reveal-line block">{s.headline[0]}</span>
          <span className="reveal-line block">{s.headline[1]}</span>
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          <PillarCard badge={<CoopBadge />} title={s.coop.title} text={s.coop.text} />
          <PillarCard badge={<AsymmetryBadge onSelect={onSelectSystem} />} title={s.asym.title} text={s.asym.text} />
        </div>

        <Dilemma />
      </div>
    </section>
  )
}
