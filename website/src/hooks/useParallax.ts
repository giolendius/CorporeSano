import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from '../lib/gsap'

const TILT_MAX = 8 // px, deviceorientation / mouse
const SCROLL_K = 0.12 // quota dello scroll che diventa spostamento differenziale

/**
 * Parallax dei layer `[data-depth]` dentro `root`: solo `translate3d`, aggiornato in un unico rAF.
 * Il fattore (0.3 / 0.6 / 0.8 / 1.2) moltiplica sia lo scroll sia il tilt del telefono (o del mouse).
 * Va applicato ai wrapper esterni: le trasformazioni GSAP stanno sugli elementi interni.
 */
export function useParallax(root: RefObject<HTMLElement>, range: () => number) {
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return

    const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-depth]')).map((node) => ({
      node,
      depth: Number(node.dataset.depth) || 0,
    }))

    let tiltX = 0
    let tiltY = 0
    let raf = 0
    let last = ''

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const scroll = Math.min(Math.max(window.scrollY, 0), range())
      const key = `${scroll}|${tiltX.toFixed(2)}|${tiltY.toFixed(2)}`
      if (key === last) return
      last = key
      for (const { node, depth } of layers) {
        const x = tiltX * TILT_MAX * depth
        const y = -scroll * SCROLL_K * depth + tiltY * TILT_MAX * depth
        node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      }
    }

    const clamp = (v: number) => Math.max(-1, Math.min(1, v))
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      tiltX = clamp(e.gamma / 30)
      tiltY = clamp((e.beta - 45) / 30)
    }
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      tiltX = clamp((e.clientX / window.innerWidth) * 2 - 1)
      tiltY = clamp((e.clientY / window.innerHeight) * 2 - 1)
    }

    window.addEventListener('deviceorientation', onOrientation)
    window.addEventListener('pointermove', onPointer, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onOrientation)
      window.removeEventListener('pointermove', onPointer)
      layers.forEach(({ node }) => (node.style.transform = ''))
    }
  }, [root, range])
}
