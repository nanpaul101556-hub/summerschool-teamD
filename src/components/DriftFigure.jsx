/**
 * 「용도는 고정, 동네는 변한다」를 눈으로 보인다.
 *
 * 예측하지 않는다. 실제로 있는 것 둘만 겹쳐 놓는다.
 *   선   노원구 65세 이상 비율 — 실측 2012–2024 · 추계 2026–2050 (노원구 공식 추계)
 *   눈금 이 건물이 손댄 해 — 2018 · 2022 · 2025 (예산줄에서 확인)
 *
 * 하나는 매끄럽게 흐르고 하나는 띄엄띄엄 멈춰 있다. 그 모양 차이가 곧 논지다 —
 * 동네는 계속 변하는데 건물은 누가 손댈 때만 변한다.
 *
 * 두 선을 빼거나 교차점을 찍지 않는다. 그건 우리가 계수를 정해야 나오는 값이고,
 * 그렇게 만든 곡선은 근거가 되지 못한다.
 */

import { POPULATION } from '../data/population'
import { PAST } from '../data/timeline'
import { useLang } from '../i18n'

const W = 560
const H = 132
const PAD = { l: 30, r: 14, t: 16, b: 22 }

const FROM = 2012
const TO = 2050
const LO = 8
const HI = 40

/** 손댄 해 — 준공(1989)은 축 밖이라 뺀다 */
const WORKS = PAST.filter((p) => p.year >= FROM)

const x = (y) => PAD.l + ((y - FROM) / (TO - FROM)) * (W - PAD.l - PAD.r)
const y = (v) => PAD.t + (1 - (v - LO) / (HI - LO)) * (H - PAD.t - PAD.b)

const REAL = POPULATION.filter((p) => !p.est)
const EST = POPULATION.filter((p) => p.est)
const LAST_REAL = REAL[REAL.length - 1]

const path = (rows) => rows.map((p, i) => `${i ? 'L' : 'M'}${x(p.year)},${y(p.elder)}`).join('')

export default function DriftFigure() {
  const { t } = useLang()

  return (
    <figure className="df">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('df.aria')}>
        {[LO, HI].map((v) => (
          <g key={v}>
            <line x1={PAD.l} y1={y(v)} x2={W - PAD.r} y2={y(v)} className="df-grid" />
            <text x={PAD.l - 5} y={y(v) + 3} className="df-ax" textAnchor="end">{v}%</text>
          </g>
        ))}

        {/* 동네 — 매끄럽게 흐른다 */}
        <path d={path(REAL)} className="df-real" />
        <path d={path([LAST_REAL, ...EST])} className="df-est" />

        {/* 건물 — 손댈 때만 움직인다 */}
        {WORKS.map((p) => (
          <g key={p.year}>
            <line x1={x(p.year)} y1={H - PAD.b} x2={x(p.year)} y2={H - PAD.b - 13}
              className="df-mk" />
            <text x={x(p.year)} y={H - 6} className="df-ax" textAnchor="middle">{p.year}</text>
          </g>
        ))}
        <line x1={x(FROM)} y1={H - PAD.b} x2={x(TO)} y2={H - PAD.b} className="df-base" />

        <text x={W - PAD.r} y={y(EST[EST.length - 1].elder) - 6} className="df-v" textAnchor="end">
          {EST[EST.length - 1].elder}%
        </text>
      </svg>

      <figcaption>
        <span><i className="a" />{t('df.town')}</span>
        <span><i className="b" />{t('df.bldg')}</span>
        <em>{t('df.src')}</em>
      </figcaption>
    </figure>
  )
}
