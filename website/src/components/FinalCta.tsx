import { useLang } from '../i18n/LangContext'
import { Picture } from './Picture'

const INSTAGRAM_URL = 'https://www.instagram.com/great.gallo.games/'

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Sezione finale: il fondo torna al plasma rosso, link al profilo Instagram. */
export function FinalCta() {
  const { t } = useLang()
  return (
    // Un solo schermo come gli altri: spaziature e locandina scalano con l'altezza (svh).
    <section className="final-cta flex min-h-[100svh] flex-col px-6" aria-labelledby="cta-title">
      <div className="final-cta__inner relative mx-auto flex w-full max-w-[460px] flex-1 flex-col items-center justify-center text-center">
        <p className="text-[15px] font-extrabold text-brace">{t.cta.kicker}</p>
        <h2 id="cta-title" className="mt-2 font-cinzel text-[clamp(26px,4.2svh,34px)] font-bold leading-[1.08] text-osso">
          {t.cta.title}
        </h2>
        <p className="final-cta__text text-osso-2">{t.cta.text}</p>

        <div className="poster-frame">
          <Picture
            name="poster"
            widths={[780, 1054]}
            sizes="min(78vw, 320px)"
            alt={t.cta.posterAlt}
            width={1054}
            height={1490}
            className="block h-full w-full object-cover"
          />
        </div>

        <div className="final-cta__actions flex w-full flex-col items-center gap-2">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="cta-btn cta-btn--social">
            <InstagramIcon />
            {t.cta.instagram}
          </a>
          <span className="text-[14px] text-osso-2">@great.gallo.games</span>
        </div>
      </div>

      <footer className="relative pb-[max(14px,env(safe-area-inset-bottom))] pt-2 text-center text-[13px] text-osso-2 opacity-70">
        © {new Date().getFullYear()} In Corpore Sano
      </footer>
    </section>
  )
}
