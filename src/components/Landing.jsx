/** 첫 화면 — 대상지 주소 하나. 여기서 시작한다. */

import { useState } from 'react'

import { SAMPLE, resolveSite } from '../data/search'
import { hasKey } from '../lib/vworld'
import Arrow from './Arrow'

export default function Landing({ onFound }) {
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
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="center">
        <img
          className="marks"
          src="/logo-partners.png"
          alt="상명대학교 · Università degli Studi G. d'Annunzio"
          width={383}
          height={96}
        />
        <div className="brand">적응형 건축 사전판정</div>
        <h1 className="q">대상지를 입력하십시오</h1>

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
            placeholder="도로명 또는 지번 주소"
            aria-label="대상지 주소"
            disabled={busy}
            autoFocus
          />
          <button type="submit" className="go" disabled={!q.trim() || busy} aria-label="이동">
            <Arrow />
          </button>
        </form>

        {busy ? (
          <p className="hint">찾는 중…</p>
        ) : err ? (
          <p className="miss">{err}</p>
        ) : (
          <p className="hint">
            자료가 정리된 대상지 ·{' '}
            <button type="button" onClick={() => go(SAMPLE.query)}>
              {SAMPLE.label}
            </button>
          </p>
        )}

        {!hasKey && (
          <p className="miss">
            V-World 인증키가 없어 주소를 찾을 수 없습니다. .env 의 VITE_VWORLD_KEY 를 확인하십시오.
          </p>
        )}
      </div>

      <div className="foot">
        <span className="no">01</span>
        <span className="meta">2026 KR–IT GSC Summer School · Team D</span>
      </div>
    </div>
  )
}
