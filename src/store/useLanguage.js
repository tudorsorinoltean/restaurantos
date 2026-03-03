// src/store/useLanguage.js
import { useState } from 'react'
import { translations } from '../utils/translations'

// Store global simplu fără Zustand — suficient pentru i18n
let globalLang = 'ro'
const listeners = new Set()

export function setLanguage(lang) {
  globalLang = lang
  listeners.forEach(fn => fn(lang))
}

export function useLanguage() {
  const [lang, setLang] = useState(globalLang)

  // Înregistrează listener la mount
  useState(() => {
    listeners.add(setLang)
    return () => listeners.delete(setLang)
  })

  const t = (key) => translations[lang][key] || key

  return { lang, setLanguage, t }
}