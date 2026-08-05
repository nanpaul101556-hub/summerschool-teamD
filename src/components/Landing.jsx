/** 첫 화면 — 대상지 주소 하나. 여기서 시작한다. */

import { useState } from 'react'

import { SAMPLE, resolveSite } from '../data/search'
import { useLang } from '../i18n'
import { hasKey } from '../lib/vworld'
import Arrow from './Arrow'

export default function Landing({ onFound }) {
  const { t, lang, setLang, langs } = useLang()
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const go = async (address) => {
    if (!address.trim() || busy) return
    setBusy(true)
    setErr(null)
    try {
      onFound(await resolveSite(address))
    } catch (e) {
      setErr(e.message === '주소를 찾지 못했습니다' ? t('landing.notFound') : e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="lang-float">
        {langs.map((l) => (
          <button
            key={l.key}
            type="button"
            className={lang === l.key ? 'on' : ''}
            onClick={() => setLang(l.key)}
            aria-pressed={lang === l.key}
            title={l.label}
          >
            {l.short}
          </button>
        ))}
      </div>

      <div className="center">
        <img
          className="marks"
          src="/logo-partners.png"
          alt="상명대학교 · Università degli Studi G. d'Annunzio"
          width={383}
          height={96}
        />
        <div className="brand">{t('app.brand')}</div>
        <h1 className="q">{t('landing.title')}</h1>

        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault()
            go(q)
          }}
        >
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              if (err) setErr(null)
            }}
            placeholder={t('landing.ph')}
            aria-label={t('landing.aria')}
            disabled={busy}
            autoFocus
          />
          <button type="submit" className="go" disabled={!q.trim() || busy} aria-label={t('landing.go')}>
            <Arrow />
          </button>
        </form>

        {busy ? (
          <p className="hint">{t('landing.searching')}</p>
        ) : err ? (
          <p className="miss">{err}</p>
        ) : (
          <p className="hint">
            {t('landing.curated')} ·{' '}
            <button type="button" onClick={() => go(SAMPLE.query)}>
              {SAMPLE.label}
            </button>
          </p>
        )}

        {!hasKey && <p className="miss">{t('landing.noKey')}</p>}
      </div>

      <div className="foot">
        <span className="no">01</span>
        <span className="meta">2026 KR–IT GSC Summer School · Team D</span>
      </div>
    </div>
  )
}
