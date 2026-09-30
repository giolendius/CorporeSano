import { useRef, useState } from 'react'
import type { SystemDef } from '../../data/systems'
import { SystemIcon } from '../icons/SystemIcon'
import { prefersReducedMotion } from '../../lib/gsap'

interface Props {
  system: SystemDef
  onSelect: (iconEl: HTMLElement) => void
}

const BEAT_MS = 300

/** Tile dello screen 2. Al tap: glow doppio + battito del simbolo, poi la transizione verso il sistema. */
export function SystemTile({ system, onSelect }: Props) {
  const iconRef = useRef<HTMLSpanElement>(null)
  const [tapped, setTapped] = useState(false)

  const handleClick = () => {
    if (tapped || !iconRef.current) return
    const icon = iconRef.current
    if (prefersReducedMotion()) {
      onSelect(icon)
      return
    }
    setTapped(true)
    window.setTimeout(() => {
      onSelect(icon)
      setTapped(false)
    }, BEAT_MS)
  }

  return (
    <button
      type="button"
      data-system={system.id}
      className={`sys-tile ${tapped ? 'is-tapped' : ''}`}
      onClick={handleClick}
      aria-label={`${system.prefix} ${system.name}: scopri il sistema`}
    >
      <span ref={iconRef} className="sys-tile__icon">
        <SystemIcon system={system.id} size={28} />
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] font-extrabold leading-tight text-sys-light">{system.short}</span>
        <span className="block text-[13px] leading-snug text-osso-2 [hyphens:manual]">{system.resource}</span>
      </span>
    </button>
  )
}
