import type { CSSProperties } from 'react'

const RINGS = [
  { size: 300, border: 10, color: '#8E1A26' },
  { size: 540, border: 8, color: '#6B1320' },
  { size: 880, border: 6, color: '#4A0D15' },
] as const

/** Fondo dello screen 2: 3 anelli concentrici (scalati dallo scroll in Dive) attorno al centro brace. */
export function Tunnel() {
  return (
    <div className="tunnel" aria-hidden="true">
      {RINGS.map((r) => (
        <div
          key={r.size}
          className="tunnel__ring"
          style={{ width: r.size, borderWidth: r.border, borderColor: r.color }}
        />
      ))}
      <div className="tunnel__core" />
      <span className="rbc" style={{ left: '20%', top: '14%', width: 40, height: 38, '--blur': '4px', '--op': 0.8 } as CSSProperties} />
      <span className="rbc" style={{ left: '82%', top: '34%', width: 64, height: 60, '--blur': '6px', '--op': 0.75 } as CSSProperties} />
    </div>
  )
}
