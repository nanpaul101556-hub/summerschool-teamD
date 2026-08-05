/**
 * 03 · Rhino 연결 — 역산한 사양을 그대로 모델로 보낸다.
 * 상태는 실제 응답으로만 바뀐다. 연결이 없으면 없다고 표시한다.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { PHASES, USES } from '../data/requirements'
import { backCalculate } from '../lib/adaptability'
import { BRIDGE, command, health, supportScript } from '../lib/rhino'

const USE_KEYS = PHASES.map((p) => p.use)

const STATE = {
  idle: { tone: '', text: '확인 전' },
  checking: { tone: 'wait', text: '확인 중' },
  ready: { tone: 'on', text: '연결됨' },
  noRhino: { tone: 'wait', text: '브리지만 실행 중 · Rhino 응답 없음' },
  down: { tone: 'off', text: '브리지 미실행' },
}

export default function RhinoView({ onBack }) {
  const [status, setStatus] = useState('idle')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState([])
  const alive = useRef(true)

  const calc = backCalculate(USES, USE_KEYS)

  const push = useCallback((msg, err = false) => {
    const t = new Date().toLocaleTimeString('ko-KR', { hour12: false })
    setLog((prev) => [...prev.slice(-60), { t, msg, err }])
  }, [])

  const probe = useCallback(async () => {
    setStatus('checking')
    try {
      const h = await health()
      if (!alive.current) return
      setStatus(h.rhino ? 'ready' : 'noRhino')
      push(h.rhino ? 'Rhino 연결 확인' : '브리지는 살아 있으나 Rhino(:1999) 무응답')
    } catch (err) {
      if (!alive.current) return
      setStatus('down')
      push(err.message, true)
    }
  }, [push])

  useEffect(() => {
    alive.current = true
    probe()
    return () => {
      alive.current = false
    }
  }, [probe])

  /** 로그 한 줄이 화면을 덮지 않도록 자른다. */
  const brief = (v) => {
    const s = typeof v === 'string' ? v : JSON.stringify(v)
    return s.length > 240 ? `${s.slice(0, 240)}…` : s
  }

  const run = async (label, type, params) => {
    setBusy(true)
    push(`▶ ${label}`)
    try {
      const res = await command(type, params)
      // rhinomcp 는 실패해도 HTTP 200 으로 status:'error' 를 돌려준다
      if (res?.status === 'error') push(res.message ?? '알 수 없는 오류', true)
      else push(brief(res?.result ?? res))
    } catch (err) {
      push(err.message, true)
      setStatus('down')
    } finally {
      setBusy(false)
    }
  }

  const s = STATE[status]
  const connected = status === 'ready'

  return (
    <div className="page">
      <header className="head">
        <div>
          <h1>Rhino 연결</h1>
          <div className="addr">역산한 사양을 모델로 보냅니다</div>
        </div>
        <button type="button" className="back" onClick={onBack}>
          대상지로
        </button>
      </header>

      <div className="conn">
        <span className={`dot ${s.tone}`} />
        <span className="st">{s.text}</span>
        <span className="ep num">{BRIDGE} → 127.0.0.1:1999</span>
      </div>

      <div className="work">
        <section>
          <h2 className="lab">전송할 사양</h2>
          <div className="kv">
            <div>
              <span className="k">구조 스팬</span>
              <span className="v num">{calc.spec.span.toFixed(1)} m</span>
            </div>
            <div>
              <span className="k">바닥하중</span>
              <span className="v num">{calc.spec.load} kg/m²</span>
            </div>
            <div>
              <span className="k">층고</span>
              <span className="v num">{calc.spec.height.toFixed(1)} m</span>
            </div>
            <div>
              <span className="k">전력 인입</span>
              <span className="v num">{calc.spec.power} %</span>
            </div>
          </div>
          <p className="note">
            {USE_KEYS.length}개 용도의 요구 성능 중 각 항목의 최댓값입니다. 첫 용도
            대비 스팬 +{calc.premium.span} m · 하중 +{calc.premium.load} kg/m²가 「여유」이고,
            그것이 용도 전환을 가능하게 하는 물리적 실체입니다.
            {calc.estimated && ' 현재 값은 모두 통상값 추정치입니다.'}
          </p>

          <div className="act">
            <button type="button" onClick={probe} disabled={busy}>
              연결 확인
            </button>
            <button
              type="button"
              disabled={!connected || busy}
              onClick={() => run('문서 요약', 'get_document_summary')}
            >
              문서 요약
            </button>
            <button
              type="button"
              disabled={!connected || busy}
              onClick={() =>
                run('Support 생성', 'execute_rhinoscript_python_code', {
                  code: supportScript(calc.spec),
                })
              }
            >
              Support 생성
            </button>
          </div>
        </section>

        <div className="rail">
          <section>
            <h2 className="lab">기록</h2>
            <div className="log">
              {log.length === 0 ? (
                <div className="empty">아직 없음</div>
              ) : (
                log.map((l, i) => (
                  <div key={i}>
                    <span className="tm">{l.t}</span>
                    <span className={l.err ? 'er' : ''}>{l.msg}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {status === 'down' && (
            <section>
              <h2 className="lab">브리지 실행</h2>
              <p className="note" style={{ marginTop: 0 }}>
                브라우저는 TCP 소켓을 열 수 없어 중계가 필요합니다. 터미널에서
                아래를 실행한 뒤 Rhino에서 <b>mcpstart</b>를 켜 주십시오.
              </p>
              <div className="log">
                <div>node bridge/rhino-bridge.mjs</div>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="foot">
        <span className="no">03</span>
        <span className="meta">rhinomcp · 헤더 없는 JSON over TCP</span>
      </div>
    </div>
  )
}
