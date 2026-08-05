/** 첫 화면 — 대상지 입력 하나. 여기서 시작한다. */

import { useState } from 'react'

import { CATALOG, findSite } from '../data/search'
import Arrow from './Arrow'

export default function Landing({ onFound }) {
  const [q, setQ] = useState('')
  const [miss, setMiss] = useState(false)

  const change = (v) => {
    setQ(v)
    if (miss) setMiss(false)
  }

  const submit = (e) => {
    e.preventDefault()
    const hit = findSite(q)
    if (hit) onFound(hit)
    else setMiss(true)
  }

  const sample = CATALOG[0]

  return (
    <div className="page">
      <div className="center">
        <div className="brand">적응형 건축 사전판정</div>
        <h1 className="q">대상지를 입력하십시오</h1>

        <form className="field" onSubmit={submit}>
          <input
            value={q}
            onChange={(e) => change(e.target.value)}
            placeholder="예 · 중계문화공원"
            aria-label="대상지"
            autoFocus
          />
          <button type="submit" className="go" disabled={!q.trim()} aria-label="이동">
            <Arrow />
          </button>
        </form>

        {miss ? (
          <p className="miss">
            「{q}」의 자료가 없습니다. 현재 판정 가능한 대상지는{' '}
            <b>{CATALOG.length}곳</b>입니다.
          </p>
        ) : (
          <p className="hint">
            자료 확보 대상지 ·{' '}
            <button type="button" onClick={() => onFound(sample)}>
              {sample.name}
            </button>
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
