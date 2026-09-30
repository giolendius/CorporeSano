import { Picture } from './Picture'

/** Sezione finale: il fondo torna al plasma rosso. Link segnaposto. */
export function FinalCta() {
  return (
    <section className="final-cta px-6 pb-10 pt-24" aria-labelledby="cta-title">
      <div className="relative mx-auto flex max-w-[460px] flex-col items-center text-center">
        <p className="text-[15px] font-extrabold text-brace">Unisciti alla squadra</p>
        <h2 id="cta-title" className="mt-3 font-cinzel text-[34px] font-bold leading-[1.08] text-osso">
          Il corpo ha bisogno di te.
        </h2>
        <p className="mt-4 text-osso-2">
          Quattro sistemi, una sola partita. Collaborate, gestite le risorse e respingete l'infezione prima che sia
          troppo tardi.
        </p>

        <div className="poster-frame mt-8 w-[min(78vw,320px)]">
          <Picture
            name="poster"
            widths={[780, 1054]}
            sizes="min(78vw, 320px)"
            alt="La locandina di In Corpore Sano"
            width={1054}
            height={1490}
            className="block h-auto w-full"
          />
        </div>

        <div className="mt-10 flex w-full flex-col items-center gap-4">
          <a href="#" className="cta-btn cta-btn--compact">
            Gioca su Board Game Arena
          </a>
          <a href="#" className="btn-ghost">
            Resta aggiornato
          </a>
        </div>
      </div>

      <footer className="relative mt-20 text-center text-[13px] text-osso-2 opacity-70">
        © {new Date().getFullYear()} In Corpore Sano
      </footer>
    </section>
  )
}
