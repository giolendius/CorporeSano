export type SystemId = 'circ' | 'dig' | 'imm' | 'ner'

/** Parte strutturale di un sistema, uguale in tutte le lingue. */
export interface SystemBase {
  id: SystemId
  reserve: { filled: number; total: number }
}

/** Testi di un sistema in una lingua (vedi src/i18n/strings.ts). */
export interface SystemText {
  /** Script sopra il nome: "Apparato"/"Sistema", "System". */
  prefix: string
  /** Nome nel bastone del titolo. */
  name: string
  /** Nome completo per aria-label e alt: "Apparato Circolatorio", "Circulatory System". */
  fullName: string
  resource: string
  headline: string
  description: string
}

export type SystemDef = SystemBase & SystemText

export const SYSTEMS: readonly SystemBase[] = [
  { id: 'circ', reserve: { filled: 4, total: 7 } },
  { id: 'dig', reserve: { filled: 4, total: 7 } },
  { id: 'imm', reserve: { filled: 4, total: 7 } },
  { id: 'ner', reserve: { filled: 4, total: 7 } },
]

/** `--sys-light` di ogni sistema, per il canvas (che non legge le variabili CSS a ogni frame). */
export const SYSTEM_COLORS: Record<SystemId, string> = {
  circ: '#F67D71',
  dig: '#B1DA8B',
  imm: '#81C2F3',
  ner: '#B4B4B4',
}
