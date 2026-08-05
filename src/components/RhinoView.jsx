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
import { useLang } from '../i18n'
import AppFrame from './AppFrame'

const STATE = {
  idle: { tone: '', key: 'rh.state.idle' },
  checking: { tone: 'wait', key: 'rh.state.checking' },
  ready: { tone: 'on', key: 'rh.state.ready' },
  noRhino: { tone: 'wait', key: 'rh.state.noRhino' },
  down: { tone: 'off', key: 'rh.state.down' },
}

export default function RhinoView({ site, picked, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
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
    push(`▶ ${option.key} · ${t('rh.modeling')}`)
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
        <h2>{t('rh.title', { key: option.key })}</h2>
        <p>{tx(option.label)} · {option.labels.map(tx).join(' · ')}</p>
      </div>

      <section>
        <div className="conn">
          <span className={`dot ${s.tone}`} />
          <span className="st">{t(s.key)}</span>
        </div>
        <div className="ep num">{BRIDGE} → 127.0.0.1:1999</div>
      </section>

      <section>
        <h3 className="lab">{t('rh.massing')}</h3>
        <div className="kv">
          <div><span className="k">{t('rh.grid')}</span><span className="v num">{mass.gx}×{mass.gy} bay</span></div>
          <div><span className="k">{t('opt.span')}</span><span className="v num">{mass.span.toFixed(1)} m</span></div>
          <div><span className="k">{t('rh.floors')}</span><span className="v num">{mass.height.toFixed(1)} m · {mass.floors}</span></div>
          <div><span className="k">{t('rh.filled')}</span><span className="v num">{mass.enclosed} / {mass.gx * mass.gy}</span></div>
          <div>
            <span className="k">{t('rh.spare')}<em className="kn">{t('rh.spareTag')}</em></span>
            <span className="v num">{mass.spareBays} bay</span>
          </div>
          <div><span className="k">{t('opt.load')}</span><span className="v num">{calc.spec.load} kg/m²</span></div>
        </div>
        <p className="note">{t('rh.massNote', { n: mass.enclosed, s: mass.spareBays })}</p>

        <div className="act">
          <button type="button" onClick={probe} disabled={busy}>{t('rh.recheck')}</button>
          <button
            type="button"
            disabled={!connected || busy}
            onClick={() => run(t('rh.model'), 'get_document_summary')}
          >{t('rh.model')}</button>
          <button type="button" disabled={!connected || busy} onClick={build}>{t('rh.rebuild')}</button>
          <button
            type="button"
            className={auto ? 'on' : ''}
            onClick={() => setAuto((v) => !v)}
          >
            {t('rh.auto')} {t(auto ? 'rh.on' : 'rh.off')}
          </button>
        </div>
      </section>

      <section>
        <h3 className="lab">{t('rh.download')}</h3>
        <div className="act">
          <button type="button" disabled={!connected || busy} onClick={save3dm}>{t('rh.make3dm')}</button>
          {file && (
            <a className="dl" href={file.href} download="model.3dm">
              {t('rh.get3dm', { size: mb(file.bytes) })}
            </a>
          )}
        </div>
      </section>

      <section>
        <h3 className="lab">{t('rh.log')}</h3>
        <div className="log">
          {log.length === 0 ? (
            <div className="empty">{t('rh.empty')}</div>
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
          <h3 className="lab">{t('rh.bridgeTitle')}</h3>
          <p className="note" style={{ marginTop: 0 }}>{t('rh.bridgeNote')}</p>
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
      next={{ label: t('step.future'), onClick: onNext }}
    >
      <div className="split">
        {/* 평면 — Rhino 가 Top 와이어프레임으로 그린다 */}
        <div className="pane">
          <div className="pane-h">
            <span>{t('rh.plan')}</span>
            <span className="pane-m num">
              {mass.gx}×{mass.gy} bay · 스팬 {mass.span.toFixed(1)} m
            </span>
          </div>
          <div className="pane-b shot">
            {shot?.plan ? (
              <img src={`${shot.plan}?v=${shot.v}`} alt={t('rh.plan')} />
            ) : (
              <div className="ph">
                <div className="t">{t(building ? 'rh.planning' : 'rh.noPlan')}</div>
                <div className="s">{t('rh.planHint')}</div>
              </div>
            )}
          </div>
        </div>

        {/* 투시 — 같은 모델에서 나온다 */}
        <div className="pane">
          <div className="pane-h">
            <span>{t('rh.model')}</span>
            <span className="pane-m">{t(connected ? 'rh.connected' : 'rh.disconnected')}</span>
          </div>
          <div className="pane-b shot">
            {shot?.model ? (
              <img src={`${shot.model}?v=${shot.v}`} alt={t('rh.model')} />
            ) : (
              <div className="ph">
                <div className="t">{t(building ? 'rh.modeling' : 'rh.noModel')}</div>
                <div className="s">{t('rh.modelHint', { key: option.key })}</div>
              </div>
            )}
          </div>
        </div>

        {building && (
          <div className="building" role="status">
            <span className="bar" />
            {t('rh.building', { key: option.key })}
          </div>
        )}
      </div>
    </AppFrame>
  )
}
