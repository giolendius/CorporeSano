import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

/**
 * Barra di avanzamento dell'intera pagina (5px a destra, brace → arteria).
 * Compare dallo screen 2 in poi; nella sezione sistemi lascia il posto alla nav.
 */
export function ProgressBar() {
  const bar = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const setScale = gsap.quickSetter(fill.current, 'scaleY')
    const systems = document.getElementById('sistemi')
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        setScale(self.progress)
        const y = window.scrollY
        const vh = window.innerHeight
        const sysTop = systems ? systems.getBoundingClientRect().top + y : Infinity
        const sysBottom = systems ? sysTop + systems.offsetHeight : Infinity
        const visible = y > vh * 0.6 && !(y >= sysTop - vh * 0.3 && y < sysBottom - vh * 0.4)
        bar.current?.classList.toggle('is-visible', visible)
      },
    })
  })

  return (
    <div ref={bar} className="progress" aria-hidden="true">
      <div ref={fill} className="progress__fill" />
    </div>
  )
}
