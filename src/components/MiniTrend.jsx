/**
 * 두 선과 그 사이 — 만족도처럼 여러 해에 걸친 축을 표 대신 그림으로 본다.
 *
 * 표는 값을 정확히 주지만 움직임을 감추고, 그림은 반대다.
 * 이 축은 「올랐는가 · 따라잡았는가」를 묻는 것이라 그림이 맞다.
 *
 * 값은 손대지 않는다. 표에 있던 그대로를 위치로 옮길 뿐이다.
 */

import { useLang } from '../i18n'

const W = 560
const H = 260
const PAD = { l: 36, r: 52, t: 30, b: 30 }

export default function MiniTrend({ chart }) {
  const { t, tx } = useLang()
  const { rows, marks = [], lo, hi, aLabel, bLabel } = chart

  const x = (i) => PAD.l + (i / (rows.length - 1)) * (W - PAD.l - PAD.r)
  const y = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b)

  const line = (k) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i)},${y(r[k])}`).join('')
  const band = `${rows.map((r, i) => `${i ? 'L' : 'M'}${x(i)},${y(r.b)}`).join('')}`
    + `${[...rows].reverse().map((r, i) => `L${x(rows.length - 1 - i)},${y(r.a)}`).join('')}Z`

  const last = rows[rows.length - 1]
  const low = rows.reduce((m, r) => (r.a < m.a ? r : m), rows[0])
  const lowI = rows.indexOf(low)

  return (
    <div className="mt">
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-svg" role="img" aria-label={t('mt.aria')}>
        <defs>
          <pattern id="mth" width="5" height="5" patternTransform="rotate(-45)"
            patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="5" className="mt-hatch" />
          </pattern>
        </defs>

        {[lo, (lo + hi) / 2, hi].map((v) => (
          <g key={v}>
            <line x1={PAD.l} y1={y(v)} x2={W - PAD.r} y2={y(v)} className="mt-grid" />
            <text x={PAD.l - 6} y={y(v) + 3} className="mt-ax" textAnchor="end">
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* 개입한 해 — 예산줄에서 확인된 것만 */}
        {marks.map((m) => {
          const i = rows.findIndex((r) => r.k === m.k)
          if (i < 0) return null
          return (
            <g key={m.k}>
              <line x1={x(i)} y1={PAD.t} x2={x(i)} y2={H - PAD.b} className="mt-mk" />
              <text x={x(i)} y={PAD.t - 6} className="mt-mk-l" textAnchor="middle">
                {tx(m.label)}
              </text>
            </g>
          )
        })}

        <path d={band} className="mt-band" />
        <path d={line('b')} className="mt-b" />
        <path d={line('a')} className="mt-a" />

        {/* 바닥과 끝 */}
        <circle cx={x(lowI)} cy={y(low.a)} r="3.5" className="mt-dot" />
        <text x={x(lowI)} y={y(low.a) + 17} className="mt-v" textAnchor="middle">
          {low.a.toFixed(2)}
        </text>
        <circle cx={x(rows.length - 1)} cy={y(last.a)} r="4.5" className="mt-dot lead" />
        <text x={x(rows.length - 1) + 9} y={y(last.a) + 4} className="mt-v lead">
          {last.a.toFixed(2)}
        </text>
        <text x={x(rows.length - 1) + 9} y={y(last.b) + 4} className="mt-v dim">
          {last.b.toFixed(2)}
        </text>

        {rows.map((r, i) => (
          (i === 0 || i === rows.length - 1 || r.k === '2021') && (
            <text key={r.k} x={x(i)} y={H - 8} className="mt-ax" textAnchor="middle">{r.k}</text>
          )
        ))}
      </svg>

      <div className="mt-lg">
        <span><i className="a" />{tx(aLabel)}</span>
        <span><i className="b" />{tx(bLabel)}</span>
        <span><i className="g" />{t('mt.gap')}</span>
      </div>
    </div>
  )
}
