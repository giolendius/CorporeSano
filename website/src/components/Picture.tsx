import type { ImgHTMLAttributes } from 'react'
import { img } from '../lib/img'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** Nome base in /public/img, es. "hero-characters" → hero-characters-390.avif … */
  name: string
  widths: readonly number[]
  sizes: string
  alt: string
  formats?: readonly ('avif' | 'webp')[]
  priority?: boolean
}

const srcSet = (name: string, widths: readonly number[], ext: string) =>
  widths.map((w) => `${img(`${name}-${w}.${ext}`)} ${w}w`).join(', ')

/** `<picture>` con AVIF/WebP in srcset, generati da scripts/extract-assets.mjs. */
export function Picture({ name, widths, sizes, alt, formats = ['avif', 'webp'], priority, ...imgProps }: Props) {
  const fallback = formats[formats.length - 1]
  return (
    <picture>
      {formats.map((f) => (
        <source key={f} type={`image/${f}`} srcSet={srcSet(name, widths, f)} sizes={sizes} />
      ))}
      <img
        src={img(`${name}-${widths[widths.length - 1]}.${fallback}`)}
        alt={alt}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        {...(priority ? { fetchpriority: 'high' } : {})}
        {...imgProps}
      />
    </picture>
  )
}
