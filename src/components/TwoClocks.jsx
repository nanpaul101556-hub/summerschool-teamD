/**
 * 05 머리 — 두 시계.
 *
 * 「언제 손대야 하는가」에는 답이 둘 있고, 둘이 다른 데서 나온다.
 *
 *   물리 시계   건물이 낡는 속도 — 내장 5~7년 · 설비 15년 · 구조 50년
 *   수요 시계   동네가 변하는 속도 — 이 건물은 3~4년마다 용도를 갈아 끼웠다
 *
 * 하나만 보면 공사를 두 번 한다. 용도 바꾸려고 한 번 뜯고, 몇 년 뒤 설비 때문에
 * 또 뜯는다. 둘을 겹쳐 놓으면 한 번에 끝낼 자리가 눈에 보인다.
 *
 * 두 줄을 위아래로 나란히 두고 구간을 막대로 그린다. 겹치는 곳에만 세로선을
 * 세워 두 줄을 잇는다. 그 세로선이 이 화면의 결론이다.
 */

import {
  BIG, DEMAND, DEMAND_SPANS, HORIZON, MEASURE_ONLY, MEET_YEARS, NOW, PHYS_SPANS, span,
} from '../lib/clocks'
import { useLang } from '../i18n'

const FROM = NOW
const TO = HORIZON
const pct = (y) => ((y - FROM) / (TO - FROM)) * 100
const wide = (s) => ({ left: `${pct(s.a)}%`, width: `${Math.max(pct(s.b) - pct(s.a), 0.9)}%` })

const TICKS = [2030, 2035, 2040]

export default function TwoClocks() {
  const { t, tx } = useLang()

  return (
    <section className="tc">
      <header>
        <h3>{t('tc.title')}</h3>
        <span>{t('tc.sub')}</span>
      </header>

      <div className="tc-b">
        {/* 물리 시계 */}
        <div className="tc-row phys">
          <span className="tc-k">
            <b>{t('tc.phys')}</b>
            <em>{t('tc.physD')}</em>
          </span>
          <div className="tc-t">
            {PHYS_SPANS.map((p) => (
              <div key={p.id} className={`tc-l ${p.id}`}>
                {p.spans.map((s, i) => (
                  <i key={s.a} style={wide(s)} title={`${tx(p.label)} ${span(s)}`}>
                    {/* 이름은 첫 구간에만 — 세 번 되풀이하면 막대가 글자밭이 된다 */}
                    {i === 0 && <span>{tx(p.label)} {tx(p.cycle)}</span>}
                  </i>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 겹치는 자리 — 두 줄을 잇는 세로선 */}
        <div className="tc-meet">
          {MEET_YEARS.map((m) => (
            <span
              key={m.id}
              className={`tc-m ${m.layer}${m.layer === BIG.layer ? ' big' : ''}`}
              style={{ left: `${pct((m.a + m.b) / 2)}%` }}
            >
              <b className="num">{span(m)}</b>
              <em>{tx(m.label)}</em>
            </span>
          ))}
        </div>

        {/* 수요 시계 */}
        <div className="tc-row dem">
          <span className="tc-k">
            <b>{t('tc.dem')}</b>
            <em>{t('tc.demD')}</em>
          </span>
          <div className="tc-t">
            <div className="tc-l demand">
              {DEMAND_SPANS.map((s) => (
                <i
                  key={s.a}
                  className={MEASURE_ONLY.some((d) => d.a === s.a) ? 'only' : ''}
                  style={wide(s)}
                  title={span(s)}
                >
                  <span>{span(s)}</span>
                </i>
              ))}
            </div>
          </div>
        </div>

        {/* 연도 눈금 */}
        <div className="tc-x">
          {TICKS.map((y) => (
            <span key={y} style={{ left: `${pct(y)}%` }}>{y}</span>
          ))}
        </div>
      </div>

      <ol className="tc-r">
        {MEASURE_ONLY.map((d) => (
          <li key={d.a} className="only">
            <b className="num">{span(d)}</b>
            <span className="h">{t('tc.onlyH')}</span>
            <span className="d">{t('tc.onlyD')}</span>
          </li>
        ))}
        {MEET_YEARS.map((m) => (
          <li key={m.id} className={m.layer === BIG.layer ? 'big' : ''}>
            <b className="num">{span(m)}</b>
            <span className="h">{t(`tc.h.${m.layer}`)}</span>
            <span className="d">
              {tx(PHYS_SPANS.find((p) => p.id === m.layer).base)}
              {' · '}
              {t('tc.withDem', { s: span(m.dem) })}
            </span>
          </li>
        ))}
      </ol>

      <p className="tc-w">{t('tc.why', { big: span(BIG), gap: tx(DEMAND.cycle) })}</p>
    </section>
  )
}
