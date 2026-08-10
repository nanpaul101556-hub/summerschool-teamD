/**
 * 05 축 A — 물리 수명. 준공에서 내려오다가, 손대면 그만큼 되돌아간다.
 *
 * 굵은 선 하나가 이 화면의 주인공이다. 준공 1989 년에 100 에서 출발해 층이 닳는
 * 만큼 내려오고, 주기가 돌아와 갈아 끼울 때마다 그만큼 되돌아간다. 지금(2026)에서
 * 두 갈래로 갈린다 — 손대지 않으면 계속 내려가고, 판정대로 손대면 두 번 반등한다.
 *
 * 새것이 100 이 천장이다. 고치면 100 으로 되돌아갈 뿐 그 위로 못 올라간다.
 * 「재개발하면 값이 오른다」는 자산 가치 얘기이고 맞는 말이지만, 그건 감정평가가
 * 필요한 다른 축이다 (METHOD-lcc-v2 §2).
 *
 * 곡선은 2039 에서 끝난다. 구조 수명이 닿는 해다. 대수선이 그 수명을 얼마나
 * 되돌리는지는 우리가 정할 값이 아니므로 반등을 그리지 않고 결정 지점으로 둔다.
 *
 * 세 층은 옅게 깔아 둔다 — 굵은 선이 왜 그 해에 꺾이는지가 거기서 읽힌다.
 * 회계 내용연수(40년)는 점선으로 함께 둔다. 회계로는 2029 년에 이미 다 상각되는데
 * 물리로는 2039 년까지 남는다.
 */

import { BUILT } from '../data/timeline'
import {
  ACCOUNTING, COMPOSITE, COMPOSITE_END, COMPOSITE_END_V, COMPOSITE_PAST,
  HORIZONS, HORIZON_END, LAYER_LINES, MEET_YEARS, NOW, residual, span,
} from '../lib/clocks'
import { useLang } from '../i18n'

const W = 760
const H = 300
const PAD = { l: 38, r: 26, t: 44, b: 42 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b

const X0 = BUILT
const X1 = HORIZON_END

const sx = (y) => PAD.l + (PW * (y - X0)) / (X1 - X0)
const sy = (v) => PAD.t + PH * (1 - v)
const path = (pts) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.y).toFixed(1)},${sy(p.v).toFixed(1)}`).join(' ')

const TICKS = [1989, 2000, 2010, 2020, 2030, 2039]

/** 반등이 서는 해 — 구조(2039)는 반등이 아니라 곡선의 끝이다 */
const LIFTS = MEET_YEARS.filter((m) => m.layer !== 'str')

const pc = (v) => Math.round(v * 100)

export default function ValueCurve() {
  const { t, tx } = useLang()

  const none = COMPOSITE.find((c) => c.key === 'none')
  const plan = COMPOSITE.find((c) => c.key === 'plan')
  const nowV = COMPOSITE_PAST.at(-1).v

  return (
    <figure className="vc">
      <figcaption className="vc-h">
        <b>{t('vc.title')}</b>
        <span>{t('vc.sub', { built: BUILT })}</span>
      </figcaption>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('vc.title')}>
        {[1, 0.5, 0].map((v) => (
          <g key={v}>
            <line x1={PAD.l} y1={sy(v)} x2={W - PAD.r} y2={sy(v)} className="vc-g" />
            <text x={PAD.l - 6} y={sy(v) + 3} className="vc-ax" textAnchor="end">{pc(v)}</text>
          </g>
        ))}

        {/* 층별 — 굵은 선이 왜 꺾이는지의 근거 */}
        {LAYER_LINES.map((l) => (
          <path key={l.id} d={path(l.pts)} className={`vc-l ${l.id}`} />
        ))}
        <path d={path(ACCOUNTING)} className="vc-acc" />

        {/* 손댄 해 */}
        {LIFTS.map((m) => (
          <g key={m.id}>
            <line x1={sx(m.a)} y1={PAD.t} x2={sx(m.a)} y2={PAD.t + PH} className="vc-w" />
            <text x={sx(m.a)} y={PAD.t - 24} className="vc-wy" textAnchor="middle">{span(m)}</text>
            <text x={sx(m.a)} y={PAD.t - 12} className="vc-wl" textAnchor="middle">
              {tx(m.label)}
            </text>
          </g>
        ))}

        {/* 지금 */}
        <line x1={sx(NOW)} y1={PAD.t} x2={sx(NOW)} y2={PAD.t + PH} className="vc-now" />
        <text x={sx(NOW)} y={PAD.t - 24} className="vc-nowt" textAnchor="middle">
          {t('vc.now', { y: NOW })}
        </text>

        {/* 합성 — 지나온 구간, 그리고 두 갈래 */}
        <path d={path(COMPOSITE_PAST)} className="vc-c past" />
        <path d={path(none.pts)} className="vc-c none" />
        <path d={path(plan.pts)} className="vc-c plan" />

        <circle cx={sx(NOW)} cy={sy(nowV)} r="4" className="vc-cd" />
        {LIFTS.map((m) => {
          const after = plan.pts.filter((p) => p.y === m.a).at(-1)
          return <circle key={m.id} cx={sx(m.a)} cy={sy(after.v)} r="3.4" className="vc-cd" />
        })}

        <text x={sx(COMPOSITE_END) + 5} y={sy(COMPOSITE_END_V.plan) + 4} className="vc-endp">
          {pc(COMPOSITE_END_V.plan)}
        </text>
        <text x={sx(COMPOSITE_END) + 5} y={sy(COMPOSITE_END_V.none) + 4} className="vc-endn">
          {pc(COMPOSITE_END_V.none)}
        </text>

        {/* 분석 지평 — LCC 는 지금부터 앞을 본다 */}
        {HORIZONS.map((h) => (
          <g key={h.id}>
            <line x1={sx(h.year)} y1={PAD.t + PH} x2={sx(h.year)} y2={PAD.t + PH + 6}
              className="vc-hz" />
            <text x={sx(h.year)} y={PAD.t + PH + 30} className="vc-hzt" textAnchor="middle">
              +{h.n}{t('tm.yrUnit')}
            </text>
          </g>
        ))}

        <line x1={PAD.l} y1={PAD.t + PH} x2={W - PAD.r} y2={PAD.t + PH} className="vc-base" />
        {TICKS.map((y) => (
          <text key={y} x={sx(y)} y={PAD.t + PH + 16} className="vc-ax" textAnchor="middle">{y}</text>
        ))}
      </svg>

      <figcaption className="vc-k">
        <span className="plan">{t('vc.kPlan', { n: pc(COMPOSITE_END_V.plan), y: COMPOSITE_END })}</span>
        <span className="none">{t('vc.kNone', { n: pc(COMPOSITE_END_V.none) })}</span>
        {LAYER_LINES.map((l) => (
          <span key={l.id} className={l.id}>
            {tx(l.label)}
            <em className="cyc">{tx(l.cycle)}</em>
            <b className="num">{pc(residual(l.id, NOW))}%</b>
          </span>
        ))}
        <span className="acc">{t('vc.acc')}</span>
      </figcaption>

      <p className="vc-n">{t('vc.note', { built: BUILT, now: NOW, end: COMPOSITE_END })}</p>
    </figure>
  )
}
