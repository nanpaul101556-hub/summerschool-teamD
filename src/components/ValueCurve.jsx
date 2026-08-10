/**
 * 05 맨 앞 — 가치는 준공 때가 가장 높다.
 *
 * 곡선을 2026 = 100 으로 그렸더니 「지금이 최고점」이라고 말하고 있었다.
 * 생애주기에서 값은 준공 때 100 이고 그 뒤로는 쓴 만큼 줄어든다.
 *
 * 가중치를 얹어 한 줄로 합치지 않는다. 층마다 수명이 다르고 교체 주기도 다른데
 * 그걸 하나로 누르려면 층별 가치 비중을 우리가 정해야 한다. 그 순간 지어낸 값이
 * 하나 생긴다. 그래서 세 층을 따로 그린다.
 *
 *   구조  1989 + 50년, 교체 없음   → 준공부터 단조 하강, 2039 에 0
 *   설비  15년 주기                → 1989 · 2004 · 2019 · 2034
 *   내장   6년 주기                → 1989 … 2019 · 2025 · 2031
 *
 * 구조선이 이 화면의 주인공이다. 한 번도 리셋되지 않으므로 「준공 때가 가장 높다」가
 * 그림 그대로 보인다. 그리고 그 선이 0 에 닿는 2039 년이 존치냐 재건축이냐가
 * 갈리는 해다 — 우리 판정은 그 전에 용도로 대응하자는 것이다.
 *
 * 회계상 내용연수(법인세법 시행규칙 별표5, 철근콘크리트조 기준 40년)는 점선으로
 * 함께 둔다. 회계로는 2029 년에 이미 다 상각되는데 물리로는 13년이 남는다.
 */

import { BUILT } from '../data/timeline'
import { ACCOUNTING, LAYER_LINES, NOW, residual } from '../lib/clocks'
import { useLang } from '../i18n'

const W = 720
const H = 280
const PAD = { l: 38, r: 20, t: 30, b: 42 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b

const X0 = BUILT
const X1 = 2045

const sx = (y) => PAD.l + (PW * (y - X0)) / (X1 - X0)
const sy = (v) => PAD.t + PH * (1 - v)
const path = (pts) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.y).toFixed(1)},${sy(p.v).toFixed(1)}`).join(' ')

const TICKS = [1989, 2000, 2010, 2020, 2030, 2040]

export default function ValueCurve() {
  const { t, tx } = useLang()

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
            <text x={PAD.l - 6} y={sy(v) + 3} className="vc-ax" textAnchor="end">
              {v * 100}
            </text>
          </g>
        ))}

        {/* 지금 */}
        <line x1={sx(NOW)} y1={PAD.t} x2={sx(NOW)} y2={PAD.t + PH} className="vc-now" />
        <text x={sx(NOW)} y={PAD.t - 10} className="vc-nowt" textAnchor="middle">
          {t('vc.now', { y: NOW })}
        </text>

        {/* 회계 내용연수 — 참조 */}
        <path d={path(ACCOUNTING)} className="vc-acc" />

        {/* 층별 잔존 수명 */}
        {LAYER_LINES.map((l) => (
          <path key={l.id} d={path(l.pts)} className={`vc-l ${l.id}`} />
        ))}

        {/* 지금 시점의 층별 값 */}
        {LAYER_LINES.map((l) => (
          <circle key={l.id} cx={sx(NOW)} cy={sy(residual(l.id, NOW))} r="3.6"
            className={`vc-d ${l.id}`} />
        ))}

        <line x1={PAD.l} y1={PAD.t + PH} x2={W - PAD.r} y2={PAD.t + PH} className="vc-base" />
        {TICKS.map((y) => (
          <text key={y} x={sx(y)} y={PAD.t + PH + 16} className="vc-ax" textAnchor="middle">{y}</text>
        ))}
      </svg>

      <figcaption className="vc-k">
        {LAYER_LINES.map((l) => (
          <span key={l.id} className={l.id}>
            {tx(l.label)}
            <b className="num">{Math.round(residual(l.id, NOW) * 100)}%</b>
          </span>
        ))}
        <span className="acc">{t('vc.acc')}</span>
      </figcaption>

      <p className="vc-n">{t('vc.note', { built: BUILT, now: NOW })}</p>
    </figure>
  )
}
