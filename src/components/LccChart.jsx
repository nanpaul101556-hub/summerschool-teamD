/**
 * 이용 곡선 — 손대지 않으면 이용이 계속 빠진다.
 *
 * 전에는 2015~2026 실측 승하차를 앞에 붙여 그렸다. 그 구간에 코로나 급락이
 * 그대로 들어 있어 「이 건물의 값이 2021년에 63까지 떨어졌다」로 읽혔다.
 * 그건 건물이 아니라 전염병이 만든 골이다. 그래서 뺐다.
 *
 * 이름도 「값」에서 「이용 수준」으로 되돌렸다. y축은 정류장 승하차 지수이지
 * 물리 성능이 아니다. 물리 성능은 이렇게 출렁이지 않는다 — 그만큼 떨어지려면
 * 화재가 나거나 무너져야 한다. 그쪽은 LifeLeft 의 층별 잔존 수명이 맡는다.
 *
 * 지금(2026)을 100 으로 두고 앞만 그린다.
 *   손대지 않으면   해마다 1.15%씩 (2015~2019 실측 추세)
 *   겹치는 해에 손대면   그때마다 반등한다
 *
 * 세로선은 lib/clocks.js 가 뽑은 겹침이다. 우리가 고른 해가 아니다.
 */

import { END, START, money, projectAll } from '../lib/lcc'
import { MEET_YEARS, span } from '../lib/clocks'
import { useLang } from '../i18n'

const K = (ko, it) => ({ ko, it })

const W = 720
const H = 250
const PAD = { l: 34, r: 18, t: 26, b: 40 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b

const Y0 = 55
const Y1 = 105

const sx = (y) => PAD.l + (PW * (y - START)) / (END - START)
const sy = (v) => PAD.t + PH * (1 - (v - Y0) / (Y1 - Y0))
const path = (pts) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.y).toFixed(1)},${sy(p.v).toFixed(1)}`).join(' ')

const TICKS = [2030, 2035, 2040, 2045]

export default function LccChart() {
  const { t, tx } = useLang()
  const scs = projectAll()
  const plan = scs.find((s) => s.key === 'plan')
  const none = scs.find((s) => s.key === 'none')

  return (
    <figure className="lcx">
      <figcaption className="lcx-h">
        <b>{t('lcx.title')}</b>
        <span>{t('lcx.sub')}</span>
      </figcaption>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('lcx.title')}>
        {[100, 80, 60].map((v) => (
          <g key={v}>
            <line x1={PAD.l} y1={sy(v)} x2={W - PAD.r} y2={sy(v)} className="lcx-g" />
            <text x={PAD.l - 6} y={sy(v) + 3} className="lcx-ax" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* 겹치는 해 — 여기서 손댄다 */}
        {MEET_YEARS.map((m) => (
          <g key={m.id}>
            <line x1={sx(m.a)} y1={PAD.t} x2={sx(m.a)} y2={PAD.t + PH} className="lcx-w" />
            <text x={sx(m.a)} y={PAD.t - 9} className="lcx-wy" textAnchor="middle">
              {span(m)}
            </text>
          </g>
        ))}

        <path d={path(none.pts)} className="lcx-none" />
        <path d={path(plan.pts)} className="lcx-plan" />

        {plan.works.map((w) => {
          const pt = plan.pts.find((p) => p.y === w.year)
          return pt ? <circle key={w.year} cx={sx(w.year)} cy={sy(pt.v)} r="3.6" className="lcx-d" /> : null
        })}

        <line x1={PAD.l} y1={PAD.t + PH} x2={W - PAD.r} y2={PAD.t + PH} className="lcx-base" />
        {TICKS.map((y) => (
          <text key={y} x={sx(y)} y={PAD.t + PH + 16} className="lcx-ax" textAnchor="middle">{y}</text>
        ))}
      </svg>

      <figcaption className="lcx-k">
        <span className="p">{t('lcx.plan', { n: plan.mean.toFixed(1) })}</span>
        <span className="n">{t('lcx.none', { n: none.mean.toFixed(1) })}</span>
        <em>{tx(K(
          `누적 공사비 약 ${money(plan.total)}억 · 감쇠 −1.15%/년은 2015~2019 실측 추세`,
          `Costo cumulato ~${money(plan.total)}00 mln · decadimento −1,15%/anno dal trend 2015–2019`,
        ))}</em>
      </figcaption>
    </figure>
  )
}
