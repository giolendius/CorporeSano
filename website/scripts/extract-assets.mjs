// Ritaglia gli asset del sito dalla locandina e dai fogli dei sistemi.
// Uso: npm run assets  (output in public/img, generato e gitignorato: gira da solo prima di build/dev)
//      --if-missing: non fa nulla se gli asset sono già stati generati (usato da `predev`)
import sharp from 'sharp'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const src = (f) => path.join(root, 'src', 'assets', f)
const out = (f) => path.join(root, 'public', 'img', f)
// Ultimo file scritto dallo script: se c'è, la generazione precedente è andata a buon fine.
const LAST_OUTPUT = out('ornament-ner-bottom.png')

if (process.argv.includes('--if-missing') && existsSync(LAST_OUTPUT)) {
  console.log('Asset già presenti in public/img (npm run assets per rigenerarli)')
  process.exit(0)
}

const COVER = src('cover.png') // 1054 × 1490
const SHEETS = {
  circ: src('1 (1).png'), // 1748 × 1240
  dig: src('2 (1).png'),
  imm: src('3 (1).png'),
  ner: src('4 (1).png'),
}

/** Ritaglio + ridimensionamento in più larghezze e formati. */
async function responsive(input, name, region, widths, formats = ['avif', 'webp']) {
  for (const w of widths) {
    for (const fmt of formats) {
      const img = sharp(input).extract(region).resize({ width: w, withoutEnlargement: true })
      const file = out(`${name}-${w}.${fmt}`)
      if (fmt === 'avif') await img.avif({ quality: 55 }).toFile(file)
      else if (fmt === 'webp') await img.webp({ quality: 78 }).toFile(file)
      else await img.png().toFile(file)
    }
  }
}

// ---------- Locandina ----------
const HERO = { left: 0, top: 400, width: 1054, height: 1090 }
const POSTER = { left: 0, top: 0, width: 1054, height: 1490 }
// Margine attorno alle lettere, così la maschera radiale sfuma solo il fondo.
const LOGO = { left: 150, top: 20, width: 760, height: 390 }

const PORTRAITS = {
  circ: { left: 110, top: 580, width: 420, height: 420 },
  dig: { left: 620, top: 680, width: 420, height: 420 },
  imm: { left: 330, top: 820, width: 440, height: 440 },
  ner: { left: 360, top: 440, width: 420, height: 420 },
}

const VIRUSES = {
  bl: { left: 0, top: 980, width: 330, height: 510 },
  tr: { left: 860, top: 0, width: 194, height: 330 },
  br: { left: 780, top: 1150, width: 274, height: 340 },
}

// ---------- Ornamenti dai fogli ----------
// `clear`: rettangoli (relativi al ritaglio) da svuotare perché contengono testo del foglio.
const ORNAMENTS = {
  // L'ECG in alto del Circolatorio è un SVG inline (si ridisegna con stroke-dashoffset).
  circ: {
    bottom: { region: { left: 265, top: 995, width: 370, height: 205 } },
  },
  dig: {
    top: {
      region: { left: 0, top: 0, width: 490, height: 490 },
      clear: [{ x: 175, y: 250, w: 315, h: 240 }],
    },
    bottom: {
      region: { left: 0, top: 870, width: 520, height: 370 },
      clear: [
        { x: 185, y: 0, w: 335, h: 175 },
        { x: 250, y: 175, w: 270, h: 70 },
      ],
    },
  },
  imm: {
    top: {
      region: { left: 0, top: 0, width: 520, height: 400 },
      clear: [
        { x: 165, y: 110, w: 355, h: 190 },
        { x: 130, y: 300, w: 390, h: 100 },
      ],
    },
    bottom: {
      region: { left: 0, top: 820, width: 580, height: 420 },
      clear: [
        { x: 110, y: 0, w: 470, h: 120 },
        { x: 195, y: 120, w: 385, h: 190 },
      ],
    },
  },
  ner: {
    top: {
      region: { left: 0, top: 0, width: 590, height: 500 },
      clear: [{ x: 175, y: 255, w: 415, h: 245 }],
    },
    bottom: {
      region: { left: 0, top: 760, width: 610, height: 480 },
      clear: [
        { x: 185, y: 40, w: 425, h: 215 },
        { x: 540, y: 270, w: 70, h: 145 },
      ],
    },
  },
}

/** Converte un ritaglio su fondo bianco in una maschera: bianco → trasparente, tratto → opaco. */
async function ornamentMask(input, { region, clear = [] }, file) {
  const { data, info } = await sharp(input)
    .extract(region)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const rgba = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 3]
    const g = data[i * 3 + 1]
    const b = data[i * 3 + 2]
    const ink = 255 - Math.min(r, g, b)
    const a = ink < 24 ? 0 : Math.min(255, Math.round(ink * 1.4))
    rgba[i * 4] = 255
    rgba[i * 4 + 1] = 255
    rgba[i * 4 + 2] = 255
    rgba[i * 4 + 3] = a
  }
  for (const c of clear) {
    for (let y = c.y; y < Math.min(height, c.y + c.h); y++) {
      for (let x = c.x; x < Math.min(width, c.x + c.w); x++) rgba[(y * width + x) * 4 + 3] = 0
    }
  }
  await sharp(rgba, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(file)
}

await mkdir(out(''), { recursive: true })

await responsive(COVER, 'hero-characters', HERO, [390, 780, 1054])
await responsive(COVER, 'poster', POSTER, [780, 1054])
await responsive(COVER, 'logo', LOGO, [460, 760], ['webp', 'png'])
for (const [id, region] of Object.entries(PORTRAITS)) {
  await responsive(COVER, `portrait-${id}`, region, [236, 472], ['avif', 'webp'])
}
for (const [id, region] of Object.entries(VIRUSES)) {
  await responsive(COVER, `virus-${id}`, region, [Math.min(region.width, 300)], ['webp'])
}
for (const [id, parts] of Object.entries(ORNAMENTS)) {
  for (const [pos, spec] of Object.entries(parts)) {
    await ornamentMask(SHEETS[id], spec, out(`ornament-${id}-${pos}.png`))
  }
}

console.log('Asset generati in public/img')
