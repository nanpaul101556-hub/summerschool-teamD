/**
 * 04 · 모델링 — 고른 대안을 그대로 Rhino 로 보낸다.
 * 상태는 실제 응답으로만 바뀐다. 연결이 없으면 없다고 표시한다.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { SITE } from '../data/site'
import { computeMassing } from '../lib/massing'
import { buildOptions } from '../lib/options'
import {
  BRIDGE, buildModel, command, exportModel, health, massingScript, mb,
} from '../lib/rhino'
import AppFrame from './AppFrame'

const STATE = {
  idle: { tone: '', text: '확인 전' },
  checking: { tone: 'wait', text: '확인 중' },
  ready: { tone: 'on', text: '연결됨' },
  noRhino: { tone: 'wait', text: '브리지만 실행 중 · Rhino 응답 없음' },
  down: { tone: 'off', text: '브리지 미실행' },
}

export default function RhinoView({ site, picked, onStep, onReset, onNext }) {
  const [status, setStatus] = useState('idle')
  const [busy, setBusy] = useState(false)
  const [building, setBuilding] = useState(false)
  const [log, setLog] = useState([])
  /** { plan, model, v } — 두 이미지는 같은 모델에서 나온다 */
  const [shot, setShot] = useState(null)
  const [file, setFile] = useState(null)
  /** 대안을 고르고 넘어오면 그때 모델링을 실시한다 */
  const [auto, setAuto] = useState(true)

  const alive = useRef(true)
  const probed = useRef(false)

  // 03 에서 고른 대안이 그대로 모델링 입력이 된다
  const options = buildOptions(SITE.plannedArea)
  const option = options.find((o) => o.key === picked) ?? options[options.length - 1]
  const calc = option.calc
  // 2D 와 3D 가 같은 파라미터를 본다
  const mass = computeMassing(option, SITE.plannedArea)

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

  const brief = (v) => {
    const s = typeof v === 'string' ? v : JSON.stringify(v)
    return s.length > 240 ? `${s.slice(0, 240)}…` : s
  }

  /** 모델링을 실시한다 — 생성·평면·투시가 한 호출에서 끝난다. */
  const build = useCallback(async () => {
    setBuilding(true)
    setBusy(true)
    push(`▶ ${option.key}안 모델링 실시`)
    try {
      const r = await buildModel(massingScript(mass, option.key))
      if (!alive.current) return
      push(brief(r.output.trim().split('\n')[0] ?? '완료'))
      setShot({ plan: r.plan.href, model: r.model.href, v: Date.now() })
    } catch (err) {
      if (!alive.current) return
      push(err.message, true)
      setStatus('down')
    } finally {
      if (alive.current) {
        setBuilding(false)
        setBusy(false)
      }
    }
  }, [mass, option.key, push])

  /**
   * 대안이 바뀌면 모델을 다시 세운다.
   * 스크립트가 이전 MASS_<key>_* 를 지우고 시작하므로 겹쳐 쌓이지 않는다.
   */
  const builtFor = useRef(null)
  useEffect(() => {
    if (!auto || status !== 'ready') return
    if (builtFor.current === option.key) return
    builtFor.current = option.key
    build()
  }, [auto, status, option.key, build])

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
        <h3 className="lab">매싱</h3>
        <div className="kv">
          <div><span className="k">그리드</span><span className="v num">{mass.gx}×{mass.gy} bay</span></div>
          <div><span className="k">구조 스팬</span><span className="v num">{mass.span.toFixed(1)} m</span></div>
          <div><span className="k">층고 · 층수</span><span className="v num">{mass.height.toFixed(1)} m · {mass.floors}</span></div>
          <div><span className="k">채우는 베이</span><span className="v num">{mass.enclosed} / {mass.gx * mass.gy}</span></div>
          <div>
            <span className="k">비워 둔 프레임<em className="kn">여유</em></span>
            <span className="v num">{mass.spareBays} bay</span>
          </div>
          <div><span className="k">바닥하중</span><span className="v num">{calc.spec.load} kg/m²</span></div>
        </div>
        <p className="note">
          골조는 그리드 전체에 세우고 외피는 {mass.enclosed}개 베이에만 칩니다.
          비워 둔 {mass.spareBays}개 베이가 전환할 때 쓸 자리입니다 — Folie N6 처럼
          골조가 외피보다 큽니다. 1층은 슬래브를 두지 않아 열린 채로 둡니다.
        </p>
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
          <button type="button" disabled={!connected || busy} onClick={build}>
            다시 만들기
          </button>
          <button
            type="button"
            className={auto ? 'on' : ''}
            onClick={() => setAuto((v) => !v)}
          >
            자동 생성 {auto ? '켜짐' : '꺼짐'}
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
      <div className="split">
        {/* 평면 — Rhino 가 Top 와이어프레임으로 그린다 */}
        <div className="pane">
          <div className="pane-h">
            <span>평면도</span>
            <span className="pane-m num">
              {mass.gx}×{mass.gy} bay · 스팬 {mass.span.toFixed(1)} m
            </span>
          </div>
          <div className="pane-b shot">
            {shot?.plan ? (
              <img src={`${shot.plan}?v=${shot.v}`} alt="Rhino 평면도" />
            ) : (
              <div className="ph">
                <div className="t">{building ? '도면 생성 중' : '도면 없음'}</div>
                <div className="s">모델링을 실시하면 Rhino가 평면을 그립니다</div>
              </div>
            )}
          </div>
        </div>

        {/* 투시 — 같은 모델에서 나온다 */}
        <div className="pane">
          <div className="pane-h">
            <span>모델</span>
            <span className="pane-m">{connected ? 'Rhino 연결됨' : '연결 없음'}</span>
          </div>
          <div className="pane-b shot">
            {shot?.model ? (
              <img src={`${shot.model}?v=${shot.v}`} alt="Rhino 투시도" />
            ) : (
              <div className="ph">
                <div className="t">{building ? '모델링 중' : '모델 없음'}</div>
                <div className="s">{option.key}안 사양으로 Rhino에서 생성합니다</div>
              </div>
            )}
          </div>
        </div>

        {building && (
          <div className="building" role="status">
            <span className="bar" />
            {option.key}안 모델링 중 — Rhino에서 생성하고 도면을 뽑습니다
          </div>
        )}
      </div>
    </AppFrame>
  )
}
