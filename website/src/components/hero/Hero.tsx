import { img } from '../../lib/img'
import { Picture } from '../Picture'
import { BloodCells } from './BloodCells'

interface Props {
  onDiscover: () => void
}

/**
 * Layer dello screen 1, dal basso verso l'alto (spec §Screen 1).
 * I wrapper `.layer[data-depth]` ricevono il parallax; gli elementi interni le animazioni GSAP.
 */
export function Hero({ onDiscover }: Props) {
  return (
    <>
      <div className="layer" data-depth="0.3">
        <div className="hero-bg" />
      </div>

      <div className="layer" data-depth="0.6">
        <div className="hero-chars">
          <div className="hero-enter-chars h-full">
            <Picture
              name="hero-characters"
              widths={[390, 780, 1054]}
              sizes="(min-width: 900px) 560px, 150vw"
              alt="Cuore, cervello, globulo bianco e intestino pronti a combattere"
              priority
            />
          </div>
        </div>
      </div>

      <div className="layer" data-depth="0.8">
        <div className="hero-cells absolute inset-0">
          <BloodCells count={11} seed={11} />
        </div>
      </div>

      <div className="vignette" />

      <div className="layer" data-depth="1.2" aria-hidden="true">
        <div className="hero-viruses absolute inset-0">
          <img className="virus-fg" src={img('virus-tr-194.webp')} alt="" style={{ left: -44, top: '17%', width: 118 }} />
          <img className="virus-fg" src={img('virus-br-274.webp')} alt="" style={{ right: -48, top: '43%', width: 130 }} />
          <img className="virus-fg" src={img('virus-bl-300.webp')} alt="" style={{ left: -80, bottom: '6%', width: 190 }} />
        </div>
      </div>

      <div className="hero-logo">
        <div className="hero-enter-logo">
          <picture>
            <source
              type="image/webp"
              srcSet={`${img('logo-460.webp')} 460w, ${img('logo-760.webp')} 760w`}
              sizes="min(100vw, 484px)"
            />
            <img src={img('logo-760.png')} alt="In Corpore Sano" width={760} height={390} />
          </picture>
        </div>
      </div>

      <svg className="hero-ecg" viewBox="0 0 300 40" fill="none" aria-hidden="true">
        <path
          d="M0 27H122l8 0 9-22 11 33 8-19 6 8H300"
          stroke="#FF4058"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
        />
      </svg>

      <div className="scrim" />

      <div className="hero-copy">
        <p className="hero-line text-[17px] leading-[1.45] text-osso">
          Il corpo è sotto attacco.
          <br />
          Scegli il tuo organo e combatti.
        </p>
        <button type="button" className="hero-cta cta-btn" onClick={onDiscover}>
          Scopri il gioco
        </button>
        <span className="hero-drop mt-2" aria-hidden="true" />
      </div>
    </>
  )
}
