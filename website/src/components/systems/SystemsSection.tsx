import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type TouchEvent } from 'react'
import { flushSync } from 'react-dom'
import { SYSTEMS } from '../../data/systems'
import { useLang, useSystems } from '../../i18n/LangContext'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { SystemPanel } from './SystemPanel'
import { SystemNav } from './SystemNav'

const N = SYSTEMS.length
/**
 * Coda del pin dopo l'ultimo sistema (in viewport): senza, il Nervoso coincide con la fine del pin
 * e basta poco per scivolare via. Con mezza viewport di coda serve una spinta di ~¼ di schermo per uscire
 * (tra un sistema e l'altro ne serve ~½): trattiene senza sembrare bloccata.
 */
const HOLD = 0.5
const PIN_STEPS = N - 1 + HOLD
/** Punti di snap (progress): i 4 sistemi + la fine del pin, cioè l'uscita verso la CTA. */
const SNAP_POINTS = [...SYSTEMS.map((_, i) => i / PIN_STEPS), 1]
const nearestSnap = (v: number) =>
  SNAP_POINTS.reduce((best, p) => (Math.abs(p - v) < Math.abs(best - v) ? p : best), SNAP_POINTS[0])

export interface SystemsHandle {
  /** Ingresso dal tile dello screen 2: elemento condiviso tile → portale. */
  enterFrom: (index: number, iconEl: HTMLElement) => void
}

type ChangeMode = 'wipe' | 'instant'

interface ViewTransitionDoc {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> }
}

/**
 * Screen 3–6: sezione pinnata con i 4 pannelli sovrapposti. Ogni 100vh di scroll si passa al sistema
 * successivo, rivelato da un cerchio che parte dall'icona della nav ("wipe di colore").
 */
export const SystemsSection = forwardRef<SystemsHandle>(function SystemsSection(_props, ref) {
  const stage = useRef<HTMLDivElement>(null)
  const panels = useRef<(HTMLDivElement | null)[]>([])
  const portals = useRef<(HTMLDivElement | null)[]>([])
  const navButtons = useRef<(HTMLButtonElement | null)[]>([])
  const trigger = useRef<ScrollTrigger | null>(null)
  const running = useRef<gsap.core.Timeline | null>(null)

  const { t } = useLang()
  const systems = useSystems()
  const [active, setActive] = useState(0)
  const activeRef = useRef(0) // ultimo indice richiesto (anche prima del render)
  const shownRef = useRef(0) // indice effettivamente a video
  const modeRef = useRef<ChangeMode>('wipe')

  const change = (index: number, mode: ChangeMode = 'wipe') => {
    if (index === activeRef.current) return
    activeRef.current = index
    modeRef.current = mode
    setActive(index)
  }

  /** Porta lo scroll alla posizione del sistema: la stage è pinnata, quindi il salto non si vede. */
  const jumpTo = (index: number) => {
    const st = trigger.current
    if (!st) return
    window.scrollTo(0, st.start + ((st.end - st.start) * index) / PIN_STEPS)
    ScrollTrigger.update()
  }

  const goTo = (index: number) => {
    const i = Math.max(0, Math.min(N - 1, index))
    change(i)
    jumpTo(i)
  }

  // ---------- Pin + scroll → indice ----------
  useGSAP(
    () => {
      trigger.current = ScrollTrigger.create({
        trigger: stage.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * PIN_STEPS}`,
        pin: true,
        invalidateOnRefresh: true,
        snap: { snapTo: nearestSnap, duration: { min: 0.2, max: 0.5 }, delay: 0.05, ease: 'power1.inOut' },
        // Durante la coda resta il Nervoso.
        onUpdate: (self) => change(Math.min(N - 1, Math.round(self.progress * PIN_STEPS))),
        onEnter: () => {
          if (prefersReducedMotion()) return
          const panel = panels.current[shownRef.current]
          if (panel) contentIntro(gsap.timeline(), panel, null, shownRef.current, 0)
        },
      })
      return () => {
        trigger.current = null
      }
    },
    { scope: stage },
  )

  // Stato iniziale: solo il primo pannello visibile.
  useLayoutEffect(() => {
    panels.current.forEach((p, i) => {
      if (!p) return
      p.style.visibility = i === 0 ? 'visible' : 'hidden'
      p.style.zIndex = i === 0 ? '2' : '0'
    })
  }, [])

  // ---------- Cambio di sistema ----------
  useLayoutEffect(() => {
    const next = active
    const prev = shownRef.current
    if (next === prev) return
    shownRef.current = next

    running.current?.progress(1).kill()

    const els = panels.current
    const panel = els[next]
    const prevPanel = els[prev]
    if (!panel) return

    els.forEach((p, i) => {
      if (!p) return
      p.style.visibility = i === next || i === prev ? 'visible' : 'hidden'
      p.style.zIndex = i === next ? '2' : i === prev ? '1' : '0'
    })

    const hidePrev = () => {
      if (prevPanel && shownRef.current !== prev) prevPanel.style.visibility = 'hidden'
      gsap.set(panel, { clearProps: 'clipPath,opacity' })
    }
    const tl = gsap.timeline({ onComplete: hidePrev })
    running.current = tl

    if (modeRef.current === 'instant') {
      // La View Transition (o il FLIP) fa già il lavoro visivo: stato finale subito, poi solo i gettoni.
      const q = gsap.utils.selector(panel)
      gsap.set(q('.orbit-sym, .portal-pop'), { scale: 1 })
      gsap.set(q('.sys-title'), { x: 0, opacity: 1 })
      hidePrev()
      if (!prefersReducedMotion()) fillReserve(tl, panel, next, 0.35)
      return
    }

    if (prefersReducedMotion()) {
      tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' })
      return
    }

    const { x, y } = originOf(next)
    tl.fromTo(
      panel,
      { clipPath: `circle(0% at ${x}px ${y}px)` },
      { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.6, ease: 'wipe' },
      0,
    )
    contentIntro(tl, panel, prevPanel, next, 0)
  }, [active])

  /** Centro dell'icona della nav del sistema, relativo alla stage: origine del cerchio. */
  const originOf = (index: number) => {
    const btn = navButtons.current[index]
    const st = stage.current
    if (!btn || !st) return { x: window.innerWidth / 2, y: window.innerHeight }
    const b = btn.getBoundingClientRect()
    const s = st.getBoundingClientRect()
    return { x: b.left + b.width / 2 - s.left, y: b.top + b.height / 2 - s.top }
  }

  // ---------- Ingresso dal tile (screen 2 → sistema) ----------
  useImperativeHandle(ref, () => ({
    enterFrom(index, iconEl) {
      const apply = () => {
        flushSync(() => change(index, 'instant'))
        jumpTo(index)
      }
      const doc = document as unknown as ViewTransitionDoc
      const reduced = prefersReducedMotion()

      if (doc.startViewTransition) {
        // Con reduced motion niente elemento condiviso: resta il crossfade di root (200ms via CSS).
        if (!reduced) iconEl.style.setProperty('view-transition-name', 'portal')
        const vt = doc.startViewTransition(() => {
          iconEl.style.removeProperty('view-transition-name')
          apply()
          if (!reduced) portals.current[index]?.style.setProperty('view-transition-name', 'portal')
        })
        vt.finished.finally(() => portals.current[index]?.style.removeProperty('view-transition-name'))
        return
      }

      if (reduced) {
        apply()
        return
      }
      flipFallback(index, iconEl, apply)
    },
  }))

  /** Fallback FLIP: un cerchio fantasma vola dal tile al portale mentre il fondo fa crossfade. */
  const flipFallback = (index: number, iconEl: HTMLElement, apply: () => void) => {
    const from = iconEl.getBoundingClientRect()
    apply()
    const portal = portals.current[index]
    const panel = panels.current[index]
    if (!portal || !panel) return
    const to = portal.getBoundingClientRect()

    const ghost = document.createElement('div')
    ghost.className = 'flip-ghost'
    ghost.dataset.system = SYSTEMS[index].id
    Object.assign(ghost.style, {
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
    })
    document.body.appendChild(ghost)

    gsap.set(portal, { opacity: 0 })
    gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none', clearProps: 'opacity' })
    gsap.to(ghost, {
      left: to.left,
      top: to.top,
      width: to.width,
      height: to.height,
      duration: 0.5,
      ease: 'wipe',
      onComplete: () => {
        gsap.to(portal, { opacity: 1, duration: 0.15, clearProps: 'opacity' })
        gsap.to(ghost, { opacity: 0, duration: 0.2, onComplete: () => ghost.remove() })
      },
    })
  }

  // ---------- Swipe orizzontale ----------
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current
    touch.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) goTo(activeRef.current + (dx < 0 ? 1 : -1))
  }

  return (
    <section id="sistemi" aria-label={t.systems.sectionLabel}>
      <div ref={stage} className="systems-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {systems.map((s, i) => (
          <SystemPanel
            key={s.id}
            ref={(el) => (panels.current[i] = el)}
            portalRef={(el) => (portals.current[i] = el)}
            system={s}
            index={i}
            active={i === active}
          />
        ))}
        <SystemNav active={active} onSelect={goTo} buttonRefs={navButtons} />
      </div>
    </section>
  )
})

/**
 * Sequenza dopo il wipe: titolo da destra, portale con overshoot, simboli dell'orbita
 * (vecchi che collassano, nuovi con stagger), gettoni della Riserva.
 */
function contentIntro(
  tl: gsap.core.Timeline,
  panel: HTMLElement,
  prevPanel: HTMLElement | null | undefined,
  index: number,
  at: number,
) {
  const q = gsap.utils.selector(panel)
  if (prevPanel) {
    tl.to(prevPanel.querySelectorAll('.orbit-sym'), { scale: 0, duration: 0.25, stagger: 0.03, ease: 'power2.in' }, at)
  }
  tl.fromTo(q('.sys-title'), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, at + 0.15)
    .fromTo(q('.portal-pop'), { scale: 0.8 }, { scale: 1, duration: 0.7, ease: 'back.out(2.2)' }, at + 0.1)
    .fromTo(q('.orbit-sym'), { scale: 0 }, { scale: 1, duration: 0.45, stagger: 0.07, ease: 'back.out(2)' }, at + 0.3)
  fillReserve(tl, panel, index, at + 0.4)
}

/** Gettoni: nel Digerente cadono nel box come dadi, negli altri si riempiono uno alla volta. */
function fillReserve(tl: gsap.core.Timeline, panel: HTMLElement, index: number, at: number) {
  const q = gsap.utils.selector(panel)
  if (SYSTEMS[index].id === 'dig') {
    tl.fromTo(
      q('.token'),
      { y: -30, opacity: 0 },
      {
        y: 0,
        opacity: (_i: number, el: Element) => (el.classList.contains('is-empty') ? 0.22 : 1),
        duration: 0.6,
        stagger: 0.06,
        ease: 'bounce.out',
      },
      at,
    )
  } else {
    tl.fromTo(q('.token:not(.is-empty)'), { opacity: 0.22 }, { opacity: 1, duration: 0.25, stagger: 0.12 }, at)
  }
}
