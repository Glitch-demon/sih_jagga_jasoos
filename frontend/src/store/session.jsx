import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { translate } from '../data/i18n.js'

const SessionContext = createContext(null)

const EMPTY = {
  lang: 'en',
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
  const [state, setState] = useState(EMPTY)

  const patch = useCallback((next) => setState((s) => ({ ...s, ...next })), [])
  const reset = useCallback(() => setState(EMPTY), [])

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
