/**
 * 두 선 — 지역이 요구하는 용도와, 지금 용도가 그것을 받아내는 정도.
 *
 * 실존 건물에는 「신축 사건」이 없다. 전/후로 자를 수 없으니
 * 두 궤적이 벌어지는 지점으로 본다. 그 지점이 용도를 다시 물어야 할 때다.
 *
 * 수요는 인구 추계라 매끄럽고, 적합도는 손대야만 바뀌므로 계단이다.
 * 그 모양 차이 자체가 이 프로젝트의 논지다 — 동네는 계속 변하는데
 * 건물은 누가 손댈 때만 변한다.
 */

import { useState } from 'react'

import { useLang } from '../i18n'
import {
  END, PROGRAM, START, THRESHOLD, findTurn, priorClosings, series,
} from '../lib/trajectory'

const W = 760
const H = 250
const PAD = { l: 34, r: 16, t: 16, b: 26 }

const ROWS = series()
const { cross, turn } = findTurn(ROWS)
const CLOSED = priorClosings(ROWS)

const x = (year) => PAD.l + ((year - START) / (END - START)) * (W - PAD.l - PAD.r)
const y = (v) => PAD.t + (1 - v / 100) * (H - PAD.t - PAD.b)

const path = (key) => ROWS.map((r, i) => `${i ? 'L' : 'M'}${x(r.year)},${y(r[key])}`).join('')

/** 적합도는 손대기 전까지 그대로다 — 꺾은선이 아니라 계단으로 그린다. */
const stepPath = () => {
  let d = ''
  ROWS.forEach((r, i) => {
    if (!i) { d += `M${x(r.year)},${y(r.fit)}`; return }
    const prev = ROWS[i - 1]
    if (prev.fit !== r.fit) d += `L${x(r.year)},${y(prev.fit)}L${x(r.year)},${y(r.fit)}`
    else d += `L${x(r.year)},${y(r.fit)}`
  })
  return d
}

/** 벌어진 사이를 빗금으로 채운다 — 색을 쓰지 않고 「모자란 양」을 보이기 위해서다. */
const gapArea = () => {
  const open = ROWS.filter((r) => cross && r.year >= cross.year)
  if (!open.length) return ''
  const top = open.map((r, i) => `${i ? 'L' : 'M'}${x(r.year)},${y(r.demand)}`).join('')
  const bottom = [...open].reverse().map((r) => `L${x(r.year)},${y(r.fit)}`).join('')
  return `${top}${bottom}Z`
}

const firstEst = ROWS.find((r) => r.est)

export default function TwoLines() {
  const { t, tx } = useLang()
  const [at, setAt] = useState(null)

  const hover = (e) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    const year = Math.round(START + ((px - PAD.l) / (W - PAD.l - PAD.r)) * (END - START))
    setAt(ROWS.find((r) => r.year === Math.min(END, Math.max(START, year))) || null)
  }

  const shown = at || ROWS.find((r) => r.year === (turn ? turn.year : END))

  return (
    <div className="tl2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="tl2-svg"
        onMouseMove={hover}
        onMouseLeave={() => setAt(null)}
        role="img"
        aria-label={t('tj.aria')}
      >
        <defs>
          <pattern id="tl2h" width="6" height="6" patternTransform="rotate(-45)"
            patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" className="tl2-hatch" />
          </pattern>
        </defs>

        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PAD.l} y1={y(v)} x2={W - PAD.r} y2={y(v)} className="tl2-grid" />
            <text x={PAD.l - 6} y={y(v) + 3} className="tl2-ax" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* 실측이 끝나고 추계가 시작되는 자리 */}
        {firstEst && (
          <g>
            <line x1={x(firstEst.year)} y1={PAD.t} x2={x(firstEst.year)} y2={H - PAD.b}
              className="tl2-est" />
            <text x={x(firstEst.year) + 4} y={PAD.t + 9} className="tl2-ax">{t('tj.est')}</text>
          </g>
        )}

        <path d={gapArea()} className="tl2-gap" />
        <path d={path('demand')} className="tl2-demand" />
        <path d={stepPath()} className="tl2-fit" />

        {/* 용도를 손댄 해 — 적합도가 계단으로 오른 지점 */}
        {PROGRAM.filter((p) => p.year >= START).map((p) => (
          <g key={p.year}>
            <line x1={x(p.year)} y1={y(p.fit)} x2={x(p.year)} y2={H - PAD.b} className="tl2-mark" />
            <circle cx={x(p.year)} cy={y(p.fit)} r="3" className="tl2-dot" />
          </g>
        ))}

        {turn && (
          <g>
            <line x1={x(turn.year)} y1={PAD.t} x2={x(turn.year)} y2={H - PAD.b} className="tl2-turn" />
            <circle cx={x(turn.year)} cy={y(turn.demand)} r="4" className="tl2-dot lead" />
            <text x={x(turn.year)} y={PAD.t - 4} className="tl2-turn-l" textAnchor="middle">
              {turn.year}
            </text>
          </g>
        )}

        {at && (
          <line x1={x(at.year)} y1={PAD.t} x2={x(at.year)} y2={H - PAD.b} className="tl2-cur" />
        )}

        {[START, 2030, 2040, END].map((yr) => (
          <text key={yr} x={x(yr)} y={H - 8} className="tl2-ax" textAnchor="middle">{yr}</text>
        ))}
      </svg>

      <div className="tl2-read">
        <div className="k">
          <span className="d" /> {t('tj.demand')}
          <span className="f" /> {t('tj.fit')}
          <span className="g" /> {t('tj.gap')}
        </div>
        {shown && (
          <div className="v">
            <b className="num">{shown.year}</b>
            <span>{t('tj.demand')} <b className="num">{shown.demand.toFixed(0)}</b></span>
            <span>{t('tj.fit')} <b className="num">{shown.fit}</b></span>
            <span className={shown.gap >= THRESHOLD ? 'over' : ''}>
              {t('tj.gap')} <b className="num">{shown.gap > 0 ? '+' : '−'}{Math.abs(shown.gap).toFixed(0)}</b>
            </span>
            <em>{shown.est ? t('tj.estMark') : t('tj.realMark')}</em>
          </div>
        )}
      </div>

      <ul className="tl2-note">
        {CLOSED.map((c) => (
          <li key={c.year}>
            <b className="num">{c.year}</b>
            {t('tj.closed', { by: c.by ? tx(c.by.label) : '' })}
          </li>
        ))}
        {cross && <li><b className="num">{cross.year}</b>{t('tj.reopen')}</li>}
        {turn && <li className="lead"><b className="num">{turn.year}</b>{t('tj.turn', { n: THRESHOLD })}</li>}
      </ul>
    </div>
  )
}
