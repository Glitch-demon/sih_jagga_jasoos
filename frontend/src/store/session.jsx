import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { translate } from '../data/i18n.js'

const SessionContext = createContext(null)

const DEFAULT_LANGUAGE = 'en'
const LANGUAGES = new Set(['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'ur'])

const EMPTY = {
  lang: DEFAULT_LANGUAGE,
  voice: true,
  largeText: false,
  patient: null, // { name, id, abha }
  symptoms: [], // [{ label, icon }]
  transcript: '',
  documents: [], // [{ title, meta, kind }]
  consultationSystem: null, // 'allopathy' | 'ayush'
  intakeAnswers: [], // [{ question, answer, section }]
  // Kept separate from the clinical summary until the patient confirms the
  // biological relationship that makes the history clinically relevant.
  familyHistory: [
    { condition: 'Type 2 diabetes', relation: 'Stepsister', biological: true },
  ],
  reviewAcknowledged: false,
  reviewedAt: null,
}

export function SessionProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const lang = window.sessionStorage.getItem('medikiosk-language')
      return LANGUAGES.has(lang) ? { ...EMPTY, lang } : EMPTY
    } catch {
      return EMPTY
    }
  })

  // Keep the language in the single session source of truth. Every route is
  // rendered beneath this provider, so a language choice never resets when
  // the user continues through the check-in flow.
  const patch = useCallback((next) => {
    if (next.lang && LANGUAGES.has(next.lang)) {
      try {
        window.sessionStorage.setItem('medikiosk-language', next.lang)
      } catch {
        // Storage may be unavailable in locked-down kiosk browsers.
      }
    }
    setState((s) => ({ ...s, ...next }))
  }, [])
  const reset = useCallback(() => {
    try {
      window.sessionStorage.removeItem('medikiosk-language')
    } catch {
      // Storage may be unavailable in locked-down kiosk browsers.
    }
    setState(EMPTY)
  }, [])

  const addSymptoms = useCallback((items) => {
    setState((s) => {
      const seen = new Set(s.symptoms.map((x) => x.label.toLowerCase()))
      const merged = [...s.symptoms]
      items.forEach((it) => {
        if (!seen.has(it.label.toLowerCase())) {
          seen.add(it.label.toLowerCase())
          merged.push(it)
        }
      })
      return { ...s, symptoms: merged }
    })
  }, [])

  const addDocument = useCallback(
    (doc) => setState((s) => ({ ...s, documents: [...s.documents, doc] })),
    []
  )

  const value = useMemo(
    () => ({
      ...state,
      patch,
      reset,
      addSymptoms,
      addDocument,
      t: (key) => translate(state.lang, key),
    }),
    [state, patch, reset, addSymptoms, addDocument]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>')
  return ctx
}
