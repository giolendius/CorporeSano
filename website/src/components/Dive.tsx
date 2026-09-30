import { useCallback, useRef } from 'react'
import { gsap, MOTION_OK, REDUCED, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useParallax } from '../hooks/useParallax'
import { Hero } from './hero/Hero'
import { Tunnel } from './summary/Tunnel'
import { Summary } from './summary/Summary'

interface Props {
  onSelectSystem: (index: number, iconEl: HTMLElement) => void
}

/**
 * Screen 1 → 2, "tuffo nel vaso": la stage è pinnata per 100vh e la timeline è legata allo scroll (scrub).
 * Se l'utente si ferma, l'effetto si ferma.
 */
export function Dive({ onSelectSystem }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)

  const parallaxRange = useCallback(() => window.innerHeight, [])
  useParallax(stage, parallaxRange)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()
      const pinEnd = () => `+=${window.innerHeight}`

      mm.add(MOTION_OK, () => {
        // Sequenza d'ingresso
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(q('.hero-bg'), { opacity: 0, duration: 0.8 })
          .from(q('.hero-enter-chars'), { y: 60, opacity: 0, duration: 1.1 }, 0.15)
          .from(q('.hero-cells, .hero-viruses'), { opacity: 0, duration: 1 }, 0.3)
          .from(q('.hero-enter-logo'), { y: -20, scale: 0.92, opacity: 0, duration: 0.9 }, 0.45)
          .fromTo(
            q('.hero-ecg path'),
            { strokeDasharray: 1, strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' },
            0.85,
          )
          .from(q('.hero-copy > *'), { y: 16, opacity: 0, stagger: 0.12, duration: 0.6 }, 1.1)

        // Tuffo (progress 0 → 1 della timeline = 100vh di scroll)
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage.current,
            start: 'top top',
            end: pinEnd,
            pin: true,
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        })
        trigger.current = tl.scrollTrigger ?? null

        tl.fromTo(q('.hero-chars'), { scale: 1 }, { scale: 2.6, duration: 1 }, 0)
          .fromTo(
            q('.hero-logo, .hero-ecg'),
            { y: 0, opacity: 1, filter: 'blur(0px)' },
            { y: -40, opacity: 0, filter: 'blur(8px)', duration: 0.3 },
            0,
          )
          .fromTo(q('.hero-copy'), { y: 0, opacity: 1 }, { y: 30, opacity: 0, duration: 0.25 }, 0)
          .fromTo(q('.hero-viruses'), { scale: 1, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.6 }, 0)
          .fromTo(
            q('.vignette'),
            { '--vig-w': '95%', '--vig-h': '80%' },
            { '--vig-w': '34%', '--vig-h': '26%', duration: 0.6 },
            0,
          )
          .fromTo(q('.tunnel-layer'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6)
          .fromTo(q('.tunnel__ring'), { scale: 0.3 }, { scale: 1, duration: 0.4, stagger: 0.05 }, 0.6)
          .fromTo(q('.tunnel__core'), { scale: 0.5 }, { scale: 1, duration: 0.4 }, 0.6)
          .fromTo(
            q('.reveal-line'),
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.05, stagger: 0.035 },
            0.7,
          )

        // I tile arrivano più in basso: si accendono quando entrano in vista.
        gsap.set(q('.reveal-tile'), { opacity: 0, y: 20 })
        ScrollTrigger.batch(q('.reveal-tile'), {
          start: 'top 94%',
          once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }),
        })

        return () => {
          trigger.current = null
        }
      })

      // Reduced motion: stessa struttura, ma crossfade da 200ms invece dello scrub.
      mm.add(REDUCED, () => {
        gsap.set(q('.tunnel-layer, .reveal-line'), { opacity: 0 })
        let inTunnel = false
        trigger.current = ScrollTrigger.create({
          trigger: stage.current,
          start: 'top top',
          end: pinEnd,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const on = self.progress > 0.5
            if (on === inTunnel) return
            inTunnel = on
            gsap.to(q('.tunnel-layer, .reveal-line'), { opacity: on ? 1 : 0, duration: 0.2 })
            gsap.to(q('.hero-logo, .hero-ecg, .hero-copy'), { opacity: on ? 0 : 1, duration: 0.2 })
          },
        })
        return () => {
          trigger.current = null
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  const discover = () => {
    const st = trigger.current
    if (!st) return
    const reduced = window.matchMedia(REDUCED).matches
    gsap.to(window, { scrollTo: st.end, duration: reduced ? 0 : 1.6, ease: 'power2.inOut' })
  }

  return (
    <div id="dive" ref={root}>
      <div ref={stage} className="dive-stage">
        <Hero onDiscover={discover} />
        <div className="layer tunnel-layer" style={{ opacity: 0 }}>
          <Tunnel />
        </div>
      </div>
      <Summary onSelectSystem={onSelectSystem} />
    </div>
  )
}
