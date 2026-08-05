/**
 * 04 · 모델링 — 고른 대안을 그대로 Rhino 로 보낸다.
 * 상태는 실제 응답으로만 바뀐다. 연결이 없으면 없다고 표시한다.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { SITE } from '../data/site'
import { buildOptions } from '../lib/options'
import {
  BRIDGE, captureView, command, exportModel, health, mb, supportScript,
} from '../lib/rhino'
import AppFrame from './AppFrame'

const STATE = {
  idle: { tone: '', text: '확인 전' },
  checking: { tone: 'wait', text: '확인 중' },
  ready: { tone: 'on', text: '연결됨' },
  noRhino: { tone: 'wait', text: '브리지만 실행 중 · Rhino 응답 없음' },
  down: { tone: 'off', text: '브리지 미실행' },
}

/** 캡처+전송에 시간이 걸려 이보다 짧게 잡아도 빨라지지 않는다. */
const REFRESH_MS = 2000

export default function RhinoView({ site, picked, onStep, onReset, onNext }) {
  const [status, setStatus] = useState('idle')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState([])
  const [shot, setShot] = useState(null)
  const [live, setLive] = useState(false)
  const [file, setFile] = useState(null)

  const alive = useRef(true)
  const probed = useRef(false)

  // 03 에서 고른 대안이 그대로 모델링 입력이 된다
  const options = buildOptions(SITE.plannedArea)
  const option = options.find((o) => o.key === picked) ?? options[options.length - 1]
  const calc = option.calc

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
    // StrictMode 가 effect 를 두 번 실행해도 기록이 겹치지 않게 한 번만 확인한다
    if (!probed.current) {
      probed.current = true
      probe()
    }
    return () => {
      alive.current = false
    }
  }, [probe])

  /** 자동 갱신 중에는 기록을 남기지 않는다 — 로그가 도배된다. */
  const grab = useCallback(
    async (quiet = false) => {
      try {
        const r = await captureView()
        if (!alive.current) return true
        setShot({ href: r.href, bytes: r.bytes, v: Date.now() })
        if (!quiet) push(`뷰 캡처 ${mb(r.bytes)}`)
        return true
      } catch (err) {
        if (!alive.current) return false
        push(err.message, true)
        return false
      }
    },
    [push],
  )

  /** 이전 캡처가 끝난 뒤 다음을 건다 — 겹치면 Rhino 가 밀린다. */
  useEffect(() => {
    if (!live) return undefined
    let stop = false
    let timer

    const loop = async () => {
      const ok = await grab(true)
      if (stop) return
      if (!ok) {
        setLive(false)
        return
      }
      timer = setTimeout(loop, REFRESH_MS)
    }
    loop()

    return () => {
      stop = true
      clearTimeout(timer)
    }
  }, [live, grab])

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

  const save3dm = async () => {
    setBusy(true)
    push('▶ 3dm 저장')
    try {
      const r = await exportModel()
      setFile(r)
      push(`저장 완료 ${mb(r.bytes)}`)
    } catch (err) {
      push(err.message, true)
    } finally {
      setBusy(false)
    }
  }

  const s = STATE[status]
  const connected = status === 'ready'

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 04</div>
        <h2>대안 {option.key} 모델링</h2>
        <p>{option.label} · {option.labels.join(' · ')}</p>
      </div>

      <section>
        <div className="conn">
          <span className={`dot ${s.tone}`} />
          <span className="st">{s.text}</span>
        </div>
        <div className="ep num">{BRIDGE} → 127.0.0.1:1999</div>
      </section>

      <section>
        <h3 className="lab">전송할 사양</h3>
        <div className="kv">
          <div><span className="k">구조 스팬</span><span className="v num">{calc.spec.span.toFixed(1)} m</span></div>
          <div><span className="k">바닥하중</span><span className="v num">{calc.spec.load} kg/m²</span></div>
          <div><span className="k">층고</span><span className="v num">{calc.spec.height.toFixed(1)} m</span></div>
          <div><span className="k">전력 인입</span><span className="v num">{calc.spec.power} %</span></div>
        </div>
        <p className="note">
          대안 {option.key}가 받아내는 {option.absorbs}개 용도의 최댓값입니다.
          {option.absorbs > 1 && (
            <> 첫 용도 대비 스팬 +{calc.premium.span} m · 하중 +{calc.premium.load} kg/m²가
            「여유」이고, 그것이 용도 전환을 가능하게 하는 물리적 실체입니다.</>
          )}
          {calc.estimated && ' 현재 값은 모두 통상값 추정치입니다.'}
        </p>

        <div className="act">
          <button type="button" onClick={probe} disabled={busy}>연결 확인</button>
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
              run(`대안 ${option.key} Support 생성`, 'execute_rhinoscript_python_code', {
                code: supportScript(calc.spec, 3, `SUPPORT_${option.key}`),
              })
            }
          >
            Support 생성
          </button>
        </div>
      </section>

      <section>
        <h3 className="lab">내려받기</h3>
        <div className="act">
          <button type="button" disabled={!connected || busy} onClick={save3dm}>
            3dm 만들기
          </button>
          {file && (
            <a className="dl" href={file.href} download="model.3dm">
              내려받기 · {mb(file.bytes)}
            </a>
          )}
        </div>
      </section>

      <section>
        <h3 className="lab">기록</h3>
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
          <h3 className="lab">브리지 실행</h3>
          <p className="note" style={{ marginTop: 0 }}>
            브라우저는 TCP 소켓을 열 수 없어 중계가 필요합니다. 터미널에서 아래를
            실행한 뒤 Rhino에서 <b>mcpstart</b>를 켜 주십시오.
          </p>
          <div className="log">
            <div>node bridge/rhino-bridge.mjs</div>
          </div>
        </section>
      )}
    </>
  )

  return (
    <AppFrame
      stage="rhino"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      next={{ label: '시간 변화', onClick: onNext }}
    >
      <div className="shot">
        {shot ? (
          <img src={`${shot.href}?v=${shot.v}`} alt="Rhino 활성 뷰포트" />
        ) : (
          <div className="ph">
            <div className="t">캡처 없음</div>
            <div className="s">활성 뷰포트를 이미지로 가져옵니다</div>
          </div>
        )}
        {live && <span className="livetag">LIVE</span>}

        <div className="shot-act">
          <button type="button" disabled={!connected || busy} onClick={() => grab()}>
            뷰 가져오기
          </button>
          <button type="button" disabled={!connected} onClick={() => setLive((v) => !v)}>
            {live ? '자동 갱신 중지' : `자동 갱신 ${REFRESH_MS / 1000}초`}
          </button>
        </div>
      </div>
    </AppFrame>
  )
}
