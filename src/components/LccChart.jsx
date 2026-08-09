/**
 * 생애주기 곡선 — 이용은 떨어지고, 공사가 되돌리고, 다시 떨어진다.
 *
 * lib/lcc.js 가 계산한 두 시나리오를 겹쳐 그린다.
 *   과거   2015~2026 실측 이용지수 (2019=100)
 *   none   손대지 않으면 — 코로나 전 추세대로 계속 하락 → 바닥
 *   plan   판정대로 — 공사(2031·2039·2045·2054)마다 반등하는 톱니
 *
 * 계수는 지어낸 값이 아니라 이 건물 실측이다(감쇠 2015~19 추세 · 반등 +5%p).
 * 공사비 일부(설비)는 유사 건물 실적을 빌려 온 참조값이다 — lcc.js WORK.src 참조.
 */

import { HISTORY, END, money, projectAll } from '../lib/lcc'
import { useLang } from '../i18n'

const K = (ko, it) => ({ ko, it })

const W = 680
const H = 316
const PAD = { l: 40, r: 16, t: 30, b: 54 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b

const X0 = 2015
const X1 = END
const Y0 = 50
const Y1 = 110

const sx = (y) => PAD.l + (PW * (y - X0)) / (X1 - X0)
const sy = (v) => PAD.t + PH * (1 - (v - Y0) / (Y1 - Y0))
const path = (pts) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.y).toFixed(1)},${sy(p.v).toFixed(1)}`).join(' ')

export default function LccChart() {
  const { tx } = useLang()
  const scs = projectAll()
  const plan = scs.find((s) => s.key === 'plan')
  const none = scs.find((s) => s.key === 'none')

  const gridYears = [2020, 2030, 2040, 2050, 2060]

  return (
    <section style={{ margin: '4px 0 18px' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" xmlns="http://www.w3.org/2000/svg">
        <title>{tx(K('생애주기 이용 곡선 — 공사가 이용을 되돌린다', 'Curva del ciclo di vita'))}</title>

        {/* 축 */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + PH} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={PAD.l} y1={PAD.t + PH} x2={W - PAD.r} y2={PAD.t + PH} stroke="#cbd5e1" strokeWidth="1" />
        <text x={PAD.l - 6} y={sy(100) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">100</text>
        <text x={PAD.l - 6} y={sy(55) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">55</text>
        <text x={PAD.l} y={PAD.t - 14} fontSize="12" fill="#64748b">
          {tx(K('이용지수 (2019년 = 100)', 'Indice d\'uso (2019 = 100)'))}
        </text>
        {gridYears.map((y) => (
          <text key={y} x={sx(y)} y={PAD.t + PH + 16} textAnchor="middle" fontSize="10" fill="#94a3b8">{y}</text>
        ))}

        {/* 공사 시점 세로선 + 마커 */}
        {plan.works.map((w) => (
          <g key={w.year}>
            <line x1={sx(w.year)} y1={PAD.t} x2={sx(w.year)} y2={PAD.t + PH} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
            <text x={sx(w.year)} y={PAD.t + PH + 32} textAnchor="middle" fontSize="10" fill="#0d9488">{w.year}</text>
          </g>
        ))}

        {/* 손대지 않으면 — 점선 */}
        <path d={path(none.pts)} fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="5 4" opacity="0.75" />
        {/* 과거 실측 */}
        <path d={path(HISTORY)} fill="none" stroke="#64748b" strokeWidth="2.5" />
        {/* 판정대로 — 톱니 반등 */}
        <path d={path(plan.pts)} fill="none" stroke="#0d9488" strokeWidth="2.5" />

        {/* 공사 지점 반등 강조 점 */}
        {plan.works.map((w) => {
          const pt = plan.pts.find((p) => p.y === w.year)
          if (!pt) return null
          return <circle key={w.year} cx={sx(w.year)} cy={sy(pt.v)} r="4" fill="#0d9488" />
        })}

        {/* 범례 */}
        <g transform={`translate(${PAD.l}, ${H - 8})`} fontSize="11" fill="#64748b">
          <line x1="0" y1="-4" x2="18" y2="-4" stroke="#64748b" strokeWidth="2.5" />
          <text x="24" y="0">{tx(K('과거 실측', 'Storico'))}</text>
          <line x1="120" y1="-4" x2="138" y2="-4" stroke="#0d9488" strokeWidth="2.5" />
          <text x="144" y="0">{tx(K('판정대로 공사', 'Con interventi'))}</text>
          <line x1="270" y1="-4" x2="288" y2="-4" stroke="#dc2626" strokeWidth="2" strokeDasharray="5 4" />
          <text x="294" y="0">{tx(K('손대지 않으면', 'Senza interventi'))}</text>
        </g>
      </svg>

      <p style={{ margin: '2px 4px 0', fontSize: 14, lineHeight: 1.6, color: '#334155' }}>
        {tx(K(
          `손대지 않으면 이용은 코로나 전 추세대로 계속 빠집니다. 판정대로 ${plan.works.map((w) => w.year).join('·')}년에 손보면 곡선이 그때마다 반등합니다 — 큰 공사는 설비 주기(2039·2054)에 얹습니다.`,
          `Senza interventi l'uso continua a scendere. Intervenendo nel ${plan.works.map((w) => w.year).join('·')} la curva risale a ogni cantiere — i lavori maggiori si innestano sul ciclo impiantistico (2039·2054).`,
        ))}
      </p>
      <p style={{ margin: '4px 4px 0', fontSize: 12, lineHeight: 1.5, color: '#94a3b8' }}>
        {tx(K(
          `누적 공사비 약 ${money(plan.total)}억 (설비비는 유사 건물 실적 참조값 포함). 감쇠·반등 계수는 이 건물 실측값.`,
          `Costo cumulato ~${money(plan.total)}00 mln (impianti su costi di edifici analoghi). Coefficienti da misure di questo edificio.`,
        ))}
      </p>
    </section>
  )
}
