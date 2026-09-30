import type { SystemId, SystemText } from '../data/systems'

export type Lang = 'it' | 'en'
export const LANGS: readonly Lang[] = ['it', 'en']

type Tone = 'warm' | 'cold'

export interface Strings {
  meta: { title: string; description: string }
  langSwitch: { label: string; names: Record<Lang, string> }
  hero: { charactersAlt: string; lines: [string, string]; cta: string }
  summary: {
    kicker: string
    headline: [string, string]
    coop: { title: string; text: string }
    asym: { title: string; text: string; discover: (fullName: string) => string }
    /** Frase-dilemma a segmenti: caldo = egoismo, freddo = altruismo. */
    dilemma: { text: string; tone?: Tone }[]
  }
  systems: {
    sectionLabel: string
    navLabel: string
    step: (n: number, total: number) => string
    hintNext: string
    hintLast: string
    reserveLabel: string
    reserveAria: (filled: number, total: number, resource: string) => string
    portraitAlt: (fullName: string) => string
    items: Record<SystemId, SystemText>
  }
  cta: {
    kicker: string
    title: string
    text: string
    posterAlt: string
    instagram: string
  }
}

export const STRINGS: Record<Lang, Strings> = {
  it: {
    meta: {
      title: 'In Corpore Sano – Il gioco da tavolo cooperativo',
      description:
        'Il corpo è sotto attacco. Scegli il tuo organo e combatti: un gioco cooperativo in cui ogni giocatore guida un sistema del corpo.',
    },
    langSwitch: { label: 'Lingua', names: { it: 'Italiano', en: 'English' } },
    hero: {
      charactersAlt: 'Cuore, cervello, globulo bianco e intestino pronti a combattere',
      lines: ['Il corpo è sotto attacco.', 'Scegli il tuo organo e combatti.'],
      cta: 'Scopri il gioco',
    },
    summary: {
      kicker: 'Il gioco',
      headline: ['Quattro sistemi.', 'Un solo corpo.'],
      coop: { title: 'Cooperazione', text: 'Coordinati con gli altri per la sopravvivenza.' },
      asym: {
        title: 'Asimmetria',
        text: 'Ogni sistema è diverso e fa cose diverse.',
        discover: (n) => `Scopri: ${n}`,
      },
      dilemma: [
        { text: 'Ti svilupperai' },
        { text: 'a scapito degli altri', tone: 'warm' },
        { text: ', o saprai' },
        { text: 'cedere il passo', tone: 'cold' },
        { text: 'quando ce ne sarà più bisogno?' },
      ],
    },
    systems: {
      sectionLabel: 'I quattro sistemi',
      navLabel: 'Sistemi del corpo',
      step: (n, total) => `Sistema ${n} di ${total}`,
      hintNext: 'Scorri per il prossimo sistema',
      hintLast: 'Scorri per continuare',
      reserveLabel: 'RISERVA',
      reserveAria: (f, t, r) => `Riserva: ${f} su ${t} ${r}`,
      portraitAlt: (n) => `${n}: il personaggio`,
      items: {
        circ: {
          prefix: 'Apparato',
          name: 'Circolatorio',
          fullName: 'Apparato Circolatorio',
          resource: 'Ossigeno',
          headline: 'Il motore del corpo',
          description: "Spinge l'ossigeno ovunque e muove le barchette del sangue.",
        },
        dig: {
          prefix: 'Apparato',
          name: 'Digerente',
          fullName: 'Apparato Digerente',
          resource: 'Nutrienti',
          headline: "La fabbrica dell'energia",
          description: 'Scompone il cibo e assorbe i nutrienti per tutta la squadra.',
        },
        imm: {
          prefix: 'Sistema',
          name: 'Immunitario',
          fullName: 'Sistema Immunitario',
          resource: 'Virus sconfitti',
          headline: 'La prima linea',
          description: 'Combatte le infiammazioni e crea anticorpi dove serve.',
        },
        ner: {
          prefix: 'Sistema',
          name: 'Nervoso',
          fullName: 'Sistema Nervoso',
          // Soft hyphen: nei box stretti va a capo come "Neuro-trasmettitori".
          resource: 'Neuro­trasmettitori',
          headline: 'La regia di tutto',
          description: 'Coordina le azioni e decide cosa mangia il corpo.',
        },
      },
    },
    cta: {
      kicker: 'Unisciti alla squadra',
      title: 'Il corpo ha bisogno di te.',
      text: "Quattro sistemi, una sola partita. Collaborate, gestite le risorse e respingete l'infezione prima che sia troppo tardi.",
      posterAlt: 'La locandina di In Corpore Sano',
      instagram: 'Seguici su Instagram',
    },
  },

  en: {
    meta: {
      title: 'In Corpore Sano – The cooperative board game',
      description:
        'The body is under attack. Choose your organ and fight: a cooperative game where each player leads one of the body’s systems.',
    },
    langSwitch: { label: 'Language', names: { it: 'Italiano', en: 'English' } },
    hero: {
      charactersAlt: 'Heart, brain, white blood cell and intestine ready to fight',
      lines: ['The body is under attack.', 'Choose your organ and fight.'],
      cta: 'Discover the game',
    },
    summary: {
      kicker: 'The game',
      headline: ['Four systems.', 'One body.'],
      coop: { title: 'Cooperation', text: 'Coordinate with the others to survive.' },
      asym: {
        title: 'Asymmetry',
        text: 'Every system is different and does different things.',
        discover: (n) => `Discover: ${n}`,
      },
      dilemma: [
        { text: 'Will you grow' },
        { text: 'at the expense of others', tone: 'warm' },
        { text: ', or will you know how to' },
        { text: 'step aside', tone: 'cold' },
        { text: 'when it matters most?' },
      ],
    },
    systems: {
      sectionLabel: 'The four systems',
      navLabel: 'Body systems',
      step: (n, total) => `System ${n} of ${total}`,
      hintNext: 'Scroll for the next system',
      hintLast: 'Scroll to continue',
      reserveLabel: 'RESERVE',
      reserveAria: (f, t, r) => `Reserve: ${f} of ${t} ${r}`,
      portraitAlt: (n) => `${n}: the character`,
      items: {
        circ: {
          prefix: 'System',
          name: 'Circulatory',
          fullName: 'Circulatory System',
          resource: 'Oxygen',
          headline: 'The body’s engine',
          description: 'Pumps oxygen everywhere and moves the blood boats.',
        },
        dig: {
          prefix: 'System',
          name: 'Digestive',
          fullName: 'Digestive System',
          resource: 'Nutrients',
          headline: 'The energy factory',
          description: 'Breaks down food and absorbs nutrients for the whole team.',
        },
        imm: {
          prefix: 'System',
          name: 'Immune',
          fullName: 'Immune System',
          resource: 'Defeated viruses',
          headline: 'The front line',
          description: 'Fights inflammation and creates antibodies where they are needed.',
        },
        ner: {
          prefix: 'System',
          name: 'Nervous',
          fullName: 'Nervous System',
          resource: 'Neuro­transmitters',
          headline: 'The mastermind',
          description: 'Coordinates the actions and decides what the body eats.',
        },
      },
    },
    cta: {
      kicker: 'Join the team',
      title: 'The body needs you.',
      text: 'Four systems, one game. Cooperate, manage your resources and fight off the infection before it’s too late.',
      posterAlt: 'The In Corpore Sano poster',
      instagram: 'Follow us on Instagram',
    },
  },
}
