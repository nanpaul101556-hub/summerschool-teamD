/**
 * 언어 전환.
 *
 * t(key, vars) 는 {name} 자리를 vars 로 채운다.
 * 키가 없으면 키 자체를 돌려준다 — 빈칸이 나오면 못 찾지만 키가 보이면 찾는다.
 *
 * 데이터 쪽 문구(용도명·전제·근거 등)는 사전에 넣지 않고 data 파일이
 * ko/it 두 벌을 들고 있다. tx(obj) 로 현재 언어를 꺼낸다.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { DICT, LANGS } from './dict'

const KEY = 'gsc.lang'
const Ctx = createContext(null)

function initial() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(KEY)
    if (saved && DICT[saved]) return saved
  }
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('it')) return 'it'
  return 'ko'
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initial)

  const setLang = useCallback((next) => {
    if (!DICT[next]) return
    setLangState(next)
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, next)
    if (typeof document !== 'undefined') document.documentElement.lang = next
  }, [])

  const value = useMemo(() => {
    const table = DICT[lang] ?? DICT.ko

    const t = (key, vars) => {
      const raw = table[key] ?? DICT.ko[key] ?? key
      if (!vars) return raw
      return raw.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m))
    }

    /** 데이터가 들고 있는 { ko, it } 에서 현재 언어를 꺼낸다. */
    const tx = (obj) => {
      if (obj == null) return ''
      if (typeof obj === 'string') return obj
      return obj[lang] ?? obj.ko ?? ''
    }

    return { lang, setLang, t, tx, langs: LANGS }
  }, [lang, setLang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLang() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLang 은 LangProvider 안에서만 쓸 수 있습니다')
  return v
}
