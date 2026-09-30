import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

/** cubic-bezier(.7,0,.2,1) della spec, usato dal wipe di colore. */
CustomEase.create('wipe', '.7,0,.2,1')

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'
export const REDUCED = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () => window.matchMedia(REDUCED).matches

export { gsap, ScrollTrigger, useGSAP }
