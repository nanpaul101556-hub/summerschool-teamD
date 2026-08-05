/**
 * 인구 연령 구성 곡선.
 *
 * 실측(2012–2024)은 실선, 추계(2026–2050)는 점선으로 나눈다.
 * 공표된 값과 추계를 같은 선으로 그리면 둘을 구분할 수 없게 된다.
 */

import { POPULATION } from '../data/population'

const W = 760
const H = 300
const PAD = { t: 18, r: 18, b: 28, l: 36 }

const X0 = PAD.l
const X1 = W - PAD.r
const Y0 = PAD.t
const Y1 = H - PAD.b

const YEAR_MIN = POPULATION[0].year
const YEAR_MAX = POPULATION[POPULATION.length - 1].year
const PCT_MAX = 40

const sx = (year) => X0 + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (X1 - X0)
const sy = (pct) => Y1 - (pct / PCT_MAX) * (Y1 - Y0)

/** Catmull-Rom 을 베지에로 바꿔 부드러운 곡선을 만든다. */
function curve(pts) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
  }
  return d
}

const pts = (rows, key) => rows.map((r) => [sx(r.year), sy(r[key])])

export default function PopCurve() {
  const measured = POPULATION.filter((r) => !r.est)
  const lastMeasured = measured[measured.length - 1]
  // 추계 구간은 마지막 실측점에서 이어 붙여야 선이 끊기지 않는다
  const forecast = [lastMeasured, ...POPULATION.filter((r) => r.est)]

  const elderSolid = curve(pts(measured, 'elder'))
  const elderDash = curve(pts(forecast, 'elder'))
  const youthRows = POPULATION.filter((r) => r.youth != null)
  const youthDash = curve(pts(youthRows, 'youth'))

  const areaPts = pts([...measured, ...POPULATION.filter((r) => r.est)], 'elder')
  const area = `${curve(areaPts)} L${X1},${Y1} L${X0},${Y1} Z`

  const marks = POPULATION.filter((r) => [2024, 2026, 2042].includes(r.year))

  return (
    <figure className="curve">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label="노원구 65세 이상과 유소년 인구 비율 추이 2012년부터 2050년">
        <defs>
          <linearGradient id="elderFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A1A1A" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 눈금 */}
        {[0, 10, 20, 30, 40].map((p) => (
          <g key={p}>
            <line x1={X0} y1={sy(p)} x2={X1} y2={sy(p)}
              stroke={p === 20 ? '#DDDBD7' : '#EBE9E5'}
              strokeDasharray={p === 20 ? '4 4' : undefined} />
            <text x={X0 - 8} y={sy(p) + 4} textAnchor="end" className="c-ax">{p}</text>
          </g>
        ))}

        {/* 초고령 기준선 */}
        <text x={X1} y={sy(20) - 7} textAnchor="end" className="c-note">초고령 20%</text>

        {/* 실측 / 추계 경계 */}
        <line x1={sx(lastMeasured.year)} y1={Y0} x2={sx(lastMeasured.year)} y2={Y1}
          stroke="#DDDBD7" />
        <text x={sx(lastMeasured.year) + 6} y={Y0 + 11} className="c-note">추계 시작</text>

        <path d={area} fill="url(#elderFade)" />

        <path d={elderSolid} className="c-elder" />
        <path d={elderDash} className="c-elder dash" />
        <path d={youthDash} className="c-youth dash" />

        {marks.map((r) => (
          <g key={r.year}>
            <circle cx={sx(r.year)} cy={sy(r.elder)} r="3.5" className="c-dot" />
            <text x={sx(r.year)} y={sy(r.elder) - 11} textAnchor="middle" className="c-val">
              {r.elder}%
            </text>
          </g>
        ))}

        {/* 연도 */}
        {POPULATION.filter((r) => [2012, 2024, 2035, 2050].includes(r.year)).map((r) => (
          <text key={r.year} x={sx(r.year)} y={H - 8} textAnchor="middle" className="c-ax">
            {r.year}
          </text>
        ))}
      </svg>

      <figcaption className="c-legend">
        <span><i className="k-elder" />65세 이상</span>
        <span><i className="k-youth" />유소년</span>
        <span className="c-sep">실선 실측 · 점선 추계</span>
      </figcaption>
    </figure>
  )
}
