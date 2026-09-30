import type { SVGProps } from 'react'
import type { SystemId } from '../../data/systems'

/** Contorno del virus: 8 lobi arrotondati, r(θ) = 7 + 1.9·cos(8θ). */
const VIRUS_PATH = (() => {
  const pts: string[] = []
  const steps = 96
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const r = 7 + 1.9 * Math.cos(8 * t)
    pts.push(`${(12 + r * Math.cos(t)).toFixed(2)} ${(12 + r * Math.sin(t)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
})()

const SHAPES: Record<SystemId, JSX.Element> = {
  circ: (
    <>
      <path d="M12 2.8C11.2 3.9 5.6 10.6 5.6 15.1a6.4 6.4 0 0 0 12.8 0C18.4 10.6 12.8 3.9 12 2.8Z" />
      <path d="M8.9 15.4a3.1 3.1 0 0 0 3.1 3.1" />
    </>
  ),
  dig: (
    <>
      <path d="M12 2.6 20.4 7.3v9.4L12 21.4l-8.4-4.7V7.3Z" />
      <path d="M3.6 7.3 12 12l8.4-4.7M12 12v9.4" />
    </>
  ),
  imm: (
    <>
      <path d={VIRUS_PATH} />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  ner: (
    <>
      <rect x="2.6" y="5.4" width="18.8" height="13.2" rx="1.6" />
      <path d="m3.2 6.2 8.8 7.2 8.8-7.2M3.2 17.9l7.1-5.9M20.8 17.9l-7.1-5.9" />
    </>
  ),
}

interface Props extends SVGProps<SVGSVGElement> {
  system: SystemId
  size?: number | string
  strokeWidth?: number
}

/** Simbolo della risorsa di un sistema (goccia, cubo, virus, busta), colore da `currentColor`. */
export function SystemIcon({ system, size = 24, strokeWidth = 1.7, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {SHAPES[system]}
    </svg>
  )
}
