/**
 * 근거 계보 캔버스 — 그래스호퍼처럼 좌에서 우로 흐르는 노드 그래프.
 *
 * 색으로 강조하지 않는다(Deck Minimal). 평소에는 전부 회색이고,
 * 노드를 고르면 그 계보만 검게 살아난다. 무엇이 무엇을 낳았는지가
 * 색이 아니라 명도 대비로 드러난다.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { COLS, EDGES, KINDS, NODES, lineage } from '../data/provenance'
import { useLang } from '../i18n'

const COL_W = 236
const ROW_H = 84
const NODE_W = 190
const NODE_H = 62
const PAD = 40
const HEAD = 34

const ROWS = Math.max(...NODES.map((n) => n.row)) + 1
const W = COLS.length * COL_W + PAD * 2 - (COL_W - NODE_W)
const H = ROWS * ROW_H + PAD * 2 + HEAD

const px = (n) => PAD + n.col * COL_W
const py = (n) => PAD + HEAD + n.row * ROW_H

const ZOOM = { min: 0.4, max: 2.2 }
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/** 출력 포트(오른쪽 가운데) → 입력 포트(왼쪽 가운데) 사이의 수평 베지어 */
function wire(a, b) {
  const x1 = px(a) + NODE_W
  const y1 = py(a) + NODE_H / 2
  const x2 = px(b)
  const y2 = py(b) + NODE_H / 2
  const d = Math.max(28, (x2 - x1) * 0.45)
  return `M${x1},${y1} C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`
}

export default function NodeGraph({ picked, onPick }) {
  const { t, tx } = useLang()
  const wrap = useRef(null)
  const drag = useRef(null)
  const [view, setView] = useState({ x: 0, y: 0, z: 1 })

  /** 처음에는 전체가 보이도록 맞춘다 */
  const fit = useCallback(() => {
    const el = wrap.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const z = clamp(Math.min(width / W, height / H), ZOOM.min, 1)
    setView({ x: (width - W * z) / 2, y: (height - H * z) / 2, z })
  }, [])

  useLayoutEffect(() => {
    fit()
    const el = wrap.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fit])

  // 캔버스 위에서는 휠이 확대다. 패시브 리스너로는 막을 수 없어 직접 붙인다.
  useEffect(() => {
    const el = wrap.current
    if (!el) return undefined
    const onWheel = (e) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const mx = e.clientX - r.left
      const my = e.clientY - r.top
      setView((v) => {
        const z = clamp(v.z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), ZOOM.min, ZOOM.max)
        const k = z / v.z
        return { z, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const down = (e) => {
    if (e.target.closest('.gh-node')) return
    drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    setView((v) => ({ ...v, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }))
  }
  const up = () => {
    drag.current = null
  }

  const { nodes: lit, edges: litE } = lineage(picked)
  const dim = Boolean(picked)

  return (
    <div className="gh">
      <div
        ref={wrap}
        className={`gh-canvas ${drag.current ? 'grab' : ''}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div
          className="gh-world"
          style={{
            width: W,
            height: H,
            transform: `translate(${view.x}px,${view.y}px) scale(${view.z})`,
          }}
        >
          <svg className="gh-wires" width={W} height={H} aria-hidden="true">
            {EDGES.map((e, i) => {
              const a = NODES.find((n) => n.id === e.a)
              const b = NODES.find((n) => n.id === e.b)
              if (!a || !b) return null
              const on = dim && litE.has(i)
              return (
                <path
                  key={`${e.a}-${e.b}-${e.rel ?? ''}`}
                  d={wire(a, b)}
                  className={`w ${e.rel ?? 'flow'} ${on ? 'on' : ''} ${dim && !on ? 'off' : ''}`}
                />
              )
            })}
          </svg>

          {COLS.map((c) => (
            <div key={c.col} className="gh-col" style={{ left: PAD + c.col * COL_W }}>
              <span className="num">{String(c.col + 1).padStart(2, '0')}</span>
              {t(c.key)}
            </div>
          ))}

          {NODES.map((n) => {
            const on = dim && lit.has(n.id)
            const self = n.id === picked
            return (
              <button
                key={n.id}
                type="button"
                className={[
                  'gh-node',
                  `k-${n.kind}`,
                  n.ok === false ? 'null' : '',
                  self ? 'self' : '',
                  on ? 'on' : '',
                  dim && !on ? 'off' : '',
                ].filter(Boolean).join(' ')}
                style={{ left: px(n), top: py(n), width: NODE_W, height: NODE_H }}
                onClick={() => onPick(self ? null : n.id)}
                aria-pressed={self}
              >
                <span className="gh-port in" aria-hidden="true" />
                <span className="gh-port out" aria-hidden="true" />
                <span className={`gh-l ${KINDS[n.kind].mono ? 'mono' : ''}`}>{tx(n.label)}</span>
                {n.meta && <span className="gh-m num">{tx(n.meta)}</span>}
                {n.ok === false && <span className="gh-x" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="gh-tools">
        <button type="button" onClick={fit}>{t('prov.fit')}</button>
        <button
          type="button"
          onClick={() => setView((v) => ({ ...v, z: clamp(v.z / 1.2, ZOOM.min, ZOOM.max) }))}
          aria-label="zoom out"
        >
          −
        </button>
        <span className="num">{Math.round(view.z * 100)}%</span>
        <button
          type="button"
          onClick={() => setView((v) => ({ ...v, z: clamp(v.z * 1.2, ZOOM.min, ZOOM.max) }))}
          aria-label="zoom in"
        >
          +
        </button>
        {picked && (
          <button type="button" className="clr" onClick={() => onPick(null)}>
            {t('prov.clear')}
          </button>
        )}
      </div>

      <div className="gh-key">
        <span className="lg flow">{t('prov.rel.flow')}</span>
        <span className="lg retry">{t('prov.rel.retry')}</span>
        <span className="lg back">{t('prov.rel.back')}</span>
        <span className="lg against">{t('prov.rel.against')}</span>
      </div>
    </div>
  )
}
