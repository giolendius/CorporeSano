export type SystemId = 'circ' | 'dig' | 'imm' | 'ner'

export interface SystemDef {
  id: SystemId
  /** Script sopra il nome: "Apparato" o "Sistema". */
  prefix: string
  name: string
  /** Nome breve usato nei tile e nella nav. */
  short: string
  resource: string
  headline: string
  description: string
  reserve: { filled: number; total: number }
}

export const SYSTEMS: readonly SystemDef[] = [
  {
    id: 'circ',
    prefix: 'Apparato',
    name: 'Circolatorio',
    short: 'Circolatorio',
    resource: 'Ossigeno',
    headline: 'Il motore del corpo',
    description: "Spinge l'ossigeno ovunque e muove le barchette del sangue.",
    reserve: { filled: 4, total: 7 },
  },
  {
    id: 'dig',
    prefix: 'Apparato',
    name: 'Digerente',
    short: 'Digerente',
    resource: 'Nutrienti',
    headline: "La fabbrica dell'energia",
    description: 'Scompone il cibo e assorbe i nutrienti per tutta la squadra.',
    reserve: { filled: 4, total: 7 },
  },
  {
    id: 'imm',
    prefix: 'Sistema',
    name: 'Immunitario',
    short: 'Immunitario',
    resource: 'Virus sconfitti',
    headline: 'La prima linea',
    description: 'Combatte le infiammazioni e crea anticorpi dove serve.',
    reserve: { filled: 4, total: 7 },
  },
  {
    id: 'ner',
    prefix: 'Sistema',
    name: 'Nervoso',
    short: 'Nervoso',
    // Soft hyphen: nei tile stretti va a capo come "Neuro-trasmettitori".
    resource: 'Neuro­trasmettitori',
    headline: 'La regia di tutto',
    description: 'Coordina le azioni e decide cosa mangia il corpo.',
    reserve: { filled: 4, total: 7 },
  },
]

/** Contenuti segnaposto (da sostituire, vedi spec). */
export const GAME_FACTS = [
  { value: '2–4', label: 'giocatori' },
  { value: "60'", label: 'durata' },
  { value: '10+', label: 'età' },
] as const
