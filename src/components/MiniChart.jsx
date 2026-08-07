/**
 * 근거 카드 안에 들어가는 작은 차트.
 *
 * 색으로 강조하지 않는다. 말하려는 계열만 검게 두고 나머지는 회색으로 물린다.
 * 축과 눈금은 최소한만 — 카드에서 읽을 것은 추세이지 정확한 값이 아니다.
 * 정확한 값은 옆의 사실 목록이 말한다.
 */

import { useLang } from '../i18n'

const W = 420
const H = 132
const P = { t: 12, r: 12, b: 20, l: 30 }

const nice = (v) => (Number.isInteger(v) ? v : v.toFixed(v < 10 ? 3 : 1))

/** 연도축 지수 추이. 자료가 없는 해는 선을 끊는다 */
export function Lines({ years, series, unit, base = 100 }) {
  const { tx } = useLang()
  const vals = series.flatMap((s) => s.v).filter((v) => v != null)
  const lo = Math.min(...vals, base)
  const hi = Math.max(...vals, base)
  const pad = (hi - lo) * 0.12 || 1
  const y0 = lo - pad
  const y1 = hi + pad

  const px = (i) => P.l + (i / (years.length - 1)) * (W - P.l - P.r)
  const py = (v) => P.t + (1 - (v - y0) / (y1 - y0)) * (H - P.t - P.b)

  return (
    <svg className="mc" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={unit}>
      <line className="mc-base" x1={P.l} y1={py(base)} x2={W - P.r} y2={py(base)} />
      <text className="mc-tick" x={P.l - 5} y={py(base) + 3} textAnchor="end">{base}</text>

      {series.map((s) => {
        const pts = s.v
          .map((v, i) => (v == null ? null : `${px(i)},${py(v)}`))
          .filter(Boolean)
          .join(' ')
        return (
          <polyline
            key={s.key}
            className={`mc-l ${s.lead ? 'lead' : ''} ${s.ctrl ? 'ctrl' : ''}`}
            points={pts}
          />
        )
      })}

      {series.filter((s) => s.lead).map((s) => {
        const i = s.v.length - 1
        return (
          <g key={`${s.key}-end`}>
            <circle className="mc-dot" cx={px(i)} cy={py(s.v[i])} r="2.6" />
            <text className="mc-end num" x={px(i) - 6} y={py(s.v[i]) - 7} textAnchor="end">
              {nice(s.v[i])}
            </text>
          </g>
        )
      })}

      {years.map((y, i) =>
        (i === 0 || i === years.length - 1 || i % 3 === 0 ? (
          <text key={y} className="mc-tick num" x={px(i)} y={H - 6} textAnchor="middle">
            {String(y).slice(2)}
          </text>
        ) : null))}

      <g className="mc-leg">
        {series.map((s, i) => (
          <text
            key={s.key}
            className={s.lead ? 'lead' : s.ctrl ? 'ctrl' : ''}
            x={W - P.r}
            y={P.t + 9 + i * 12}
            textAnchor="end"
          >
            {tx(s.label)}
          </text>
        ))}
      </g>
    </svg>
  )
}

/** 항목별 가로 막대. mid 를 주면 그 값이 기준선이 된다 */
export function Bars({ bars, mid }) {
  const { tx } = useLang()
  const vs = bars.map((b) => b.v)
  const hasNeg = vs.some((v) => v < 0)
  const span = Math.max(...vs.map((v) => Math.abs(v - (mid ?? 0)))) || 1

  return (
    <div className="mb">
      {bars.map((b) => {
        const d = b.v - (mid ?? 0)
        const w = (Math.abs(d) / span) * 100
        return (
          <div key={tx(b.label)} className={`mb-r ${b.lead ? 'lead' : ''}`}>
            <span className="mb-n">{tx(b.label)}</span>
            <span className={`mb-t ${hasNeg || mid != null ? 'mid' : ''}`}>
              <span
                className={`mb-b ${d < 0 ? 'neg' : ''}`}
                style={
                  mid != null || hasNeg
                    ? { width: `${w / 2}%`, [d < 0 ? 'right' : 'left']: '50%' }
                    : { width: `${w}%`, left: 0 }
                }
              />
            </span>
            <span className="mb-v num">{nice(b.v)}{b.neg != null || b.v < 0 ? '%' : ''}</span>
          </div>
        )
      })}
    </div>
  )
}

/** 거리축 — 가까울수록 크게 반응했는가 */
export function Steps({ steps, unit }) {
  const vs = steps.map((s) => s.v)
  const hi = Math.max(...vs, 0)
  const lo = Math.min(...vs, 0)
  const xs = steps.map((s) => s.at)
  const xhi = Math.max(...xs)

  const px = (m) => P.l + (m / (xhi * 1.08)) * (W - P.l - P.r)
  const py = (v) => P.t + (1 - (v - lo) / (hi - lo || 1)) * (H - P.t - P.b)

  return (
    <svg className="mc" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={unit}>
      <line className="mc-base" x1={P.l} y1={py(0)} x2={W - P.r} y2={py(0)} />
      <text className="mc-tick" x={P.l - 5} y={py(0) + 3} textAnchor="end">0</text>

      <polyline
        className="mc-l lead"
        points={steps.map((s) => `${px(s.at)},${py(s.v)}`).join(' ')}
      />
      {steps.map((s, i) => (
        <g key={`${s.at}-${i}`}>
          <line className="mc-drop" x1={px(s.at)} y1={py(0)} x2={px(s.at)} y2={py(s.v)} />
          <circle className="mc-dot" cx={px(s.at)} cy={py(s.v)} r="3" />
          <text
            className="mc-end num"
            x={px(s.at)}
            y={py(s.v) + (s.v >= 0 ? -8 : 14)}
            textAnchor="middle"
          >
            {s.v > 0 ? '+' : ''}{s.v}
          </text>
          <text className="mc-tick num" x={px(s.at)} y={H - 6} textAnchor="middle">
            {s.at}m
          </text>
        </g>
      ))}
    </svg>
  )
}

/** 자료를 아직 못 붙인 자리 */
export function Empty({ label }) {
  return (
    <div className="mc-empty" role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  )
}
