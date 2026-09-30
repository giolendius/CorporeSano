import { useLang } from '../i18n/LangContext'
import { LANGS, type Lang } from '../i18n/strings'

function Flag({ lang }: { lang: Lang }) {
  if (lang === 'it') {
    return (
      <svg viewBox="0 0 3 2" aria-hidden="true">
        <rect width="1" height="2" fill="#009246" />
        <rect x="1" width="1" height="2" fill="#fff" />
        <rect x="2" width="1" height="2" fill="#ce2b37" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 60 40" aria-hidden="true">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" strokeWidth="3" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="7" />
    </svg>
  )
}

/** Bandierine in alto a sinistra, quasi trasparenti per non rompere l'immersione; si accendono al passaggio. */
export function LangSwitch() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-switch" role="group" aria-label={t.langSwitch.label}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className={`lang-switch__btn ${l === lang ? 'is-active' : ''}`}
          aria-pressed={l === lang}
          aria-label={t.langSwitch.names[l]}
          title={t.langSwitch.names[l]}
          onClick={() => setLang(l)}
        >
          <span className="lang-switch__flag">
            <Flag lang={l} />
          </span>
        </button>
      ))}
    </div>
  )
}
