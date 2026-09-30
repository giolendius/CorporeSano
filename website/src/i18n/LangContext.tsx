import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SYSTEMS, type SystemDef } from '../data/systems'
import { ScrollTrigger } from '../lib/gsap'
import { LANGS, STRINGS, type Lang, type Strings } from './strings'

const STORAGE_KEY = 'ics-lang'

/** Scelta salvata dalla bandierina, altrimenti la lingua del browser: italiano se it-*, inglese negli altri casi. */
function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && (LANGS as readonly string[]).includes(saved)) return saved as Lang
  } catch {
    // localStorage non disponibile (es. modalità privata restrittiva)
  }
  const preferred = navigator.languages?.[0] ?? navigator.language ?? ''
  return preferred.toLowerCase().startsWith('it') ? 'it' : 'en'
}

interface LangValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Strings
}

const LangContext = createContext<LangValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignora
    }
  }

  // <html lang>, titolo e description seguono la lingua; i testi cambiano altezza, quindi ricalcola i trigger.
  useEffect(() => {
    const t = STRINGS[lang]
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(raf)
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t: STRINGS[lang] }), [lang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang va usato dentro <LangProvider>')
  return ctx
}

/** I 4 sistemi con i testi nella lingua corrente. */
export function useSystems(): SystemDef[] {
  const { t } = useLang()
  return useMemo(() => SYSTEMS.map((s) => ({ ...s, ...t.systems.items[s.id] })), [t])
}
