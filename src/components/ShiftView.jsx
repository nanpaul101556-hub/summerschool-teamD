/**
 * 05 · 전환 대안 — 언제 무엇으로 바꿀 것인가.
 *
 * 위에 건물의 물리 주기를 놓고, 그 위에 대안을 얹는다.
 * 시점은 우리가 고른 것이 아니라 건물이 정한 것이다.
 *
 * 대안을 가르는 것은 규모가 아니라 「어디까지 손대는가」다.
 * 깊이 손댈수록 지금은 넓어지고 다음은 좁아진다.
 */

import { useState } from 'react'

import {
  BUILDING, CYCLE, LAYERS, OPTIONS, TRIGGER,
  openPrograms, programOf, reversibility, takenPrograms,
} from '../data/plans'
import { useLang } from '../i18n'
import AppFrame from './AppFrame'

const YEARS = [1989, 2024, 2031, 2039, 2054]
const SPAN = [1985, 2060]
const pos = (y) => ((y - SPAN[0]) / (SPAN[1] - SPAN[0])) * 100

export default function ShiftView({ site, onStep, onReset, picked, onPick }) {
  const { t, tx } = useLang()
  const [open, setOpen] = useState(picked ?? 'B')
  const cur = OPTIONS.find((o) => o.key === open) ?? OPTIONS[1]

  const choose = (k) => {
    setOpen(k)
    onPick?.(k)
  }

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 05</div>
        <h2>{t('sh.title')}</h2>
        <p>{t('sh.sub')}</p>
      </div>

      <section>
        <h3 className="lab">{t('sh.building')}</h3>
        <div className="cur">
          <b>{tx(BUILDING.name)}</b>
          <span>{tx(BUILDING.alias)}</span>
        </div>
        <div className="bd-facts">
          <div>
            <span className="k">{t('sh.built')}</span>
            <span className="v num">{BUILDING.built}</span>
          </div>
          <div>
            <span className="k">{t('sh.age')}</span>
            <span className="v num">{BUILDING.age}{t('sh.years')}</span>
          </div>
        </div>
        <p className="note">{tx(BUILDING.uses)}</p>
        <p className="note">{tx(BUILDING.state)}</p>
      </section>

      <section>
        <h3 className="lab">{t('sh.trigger')}</h3>
        <div className="tg">
          <div className="tg-bar">
            <span className="fill" style={{ width: `${(1 - TRIGGER.now / TRIGGER.threshold) * 100}%` }} />
            <span className="line" style={{ left: '100%' }} />
          </div>
          <div className="tg-l">
            <span><b className="num">{TRIGGER.now}%p</b> {t('sh.tgNow')}</span>
            <span>{t('sh.tgLine')} <b className="num">{TRIGGER.threshold}%p</b></span>
          </div>
        </div>
        <p className="note">{tx(TRIGGER.note)}</p>
      </section>

      <section>
        <h3 className="lab">{t('sh.chosen', { key: cur.key })}</h3>
        <div className="bd-layers">
          {Object.entries(LAYERS).map(([k, l]) => (
            <div key={k} className={cur.layers.includes(k) ? 'on' : ''}>
              <span className="n">{tx(l.label)}</span>
              <span className="y num">{tx(l.life)}</span>
            </div>
          ))}
        </div>
        <p className="note">{tx(cur.keeps)}</p>
      </section>
    </>
  )

  return (
    <AppFrame
      stage="options"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      scroll
    >
      <div className="sh">
        {/* ── 물리 주기 ─────────────────────────── */}
        <section className="sh-cyc">
          <div className="sh-h">
            <h3>{t('sh.cycTitle')}</h3>
            <span>{t('sh.cycSub')}</span>
          </div>

          <div className="tl">
            <div className="tl-axis">
              {YEARS.map((y) => (
                <span key={y} className="num" style={{ left: `${pos(y)}%` }}>{y}</span>
              ))}
            </div>
            <div className="tl-track">
              {CYCLE.map((c) => (
                <div
                  key={c.year}
                  className={`tl-p ${c.kind} ${c.key ? 'key' : ''}`}
                  style={{ left: `${pos(c.year)}%` }}
                >
                  <span className="dot" />
                </div>
              ))}
              <span className="tl-now" style={{ left: `${pos(BUILDING.now)}%` }} />
            </div>
          </div>

          <div className="cyc-l">
            {CYCLE.map((c) => (
              <article key={c.year} className={`${c.kind} ${c.key ? 'key' : ''}`}>
                <div className="cy-h">
                  <b className="num">{c.year}</b>
                  <span>{tx(c.label)}</span>
                </div>
                <p>{tx(c.note)}</p>
                {c.cost && (
                  <div className="cy-cost">
                    <span className="num">{(c.cost / 100).toFixed(0)}</span>
                    {t('sh.eok')}
                  </div>
                )}
                {c.result && <div className="cy-res">{tx(c.result)}</div>}
                {c.layers && (
                  <div className="cy-ly">
                    {c.layers.map((l) => (
                      <span key={l}>{tx(LAYERS[l].label)}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ── 무엇으로 ─────────────────────────── */}
        <section className="sh-pg">
          <div className="sh-h">
            <h3>{t('sh.pgTitle')}</h3>
            <span>{t('sh.pgSub')}</span>
          </div>
          <div className="pg-l">
            {takenPrograms().map((p) => (
              <div key={p.id} className="pg taken">
                <b>{tx(p.label)}</b>
                <p>{tx(p.why)}</p>
                <span className="st">{t('sh.taken')}</span>
              </div>
            ))}
            {openPrograms().map((p) => (
              <div key={p.id} className="pg open">
                <b>{tx(p.label)}</b>
                <p>{tx(p.why)}</p>
                <span className="st">{t('sh.open')}</span>
              </div>
            ))}
          </div>
          <p className="note">{t('sh.pgNote')}</p>
        </section>

        {/* ── 대안 ─────────────────────────────── */}
        <section className="sh-op">
          <div className="sh-h">
            <h3>{t('sh.opTitle')}</h3>
            <span>{t('sh.opSub')}</span>
          </div>

          <div className="ops">
            {OPTIONS.map((o) => {
              const on = o.key === open
              const rev = reversibility(o)
              return (
                <button
                  key={o.key}
                  type="button"
                  className={`op ${on ? 'on' : ''} ${o.lead ? 'lead' : ''}`}
                  onClick={() => choose(o.key)}
                  aria-pressed={on}
                >
                  <div className="op-h">
                    <span className="k">{o.key}</span>
                    <b>{tx(o.label)}</b>
                    <span className="at num">{o.at}</span>
                  </div>

                  <div className="op-ly">
                    {Object.keys(LAYERS).map((l) => (
                      <span key={l} className={o.layers.includes(l) ? 'on' : ''}>
                        {tx(LAYERS[l].label)}
                      </span>
                    ))}
                  </div>

                  <p className="op-w">{tx(o.what)}</p>

                  <div className="op-pg">
                    {o.program.map((p) => (
                      <span key={p}>{tx(programOf(p).label)}</span>
                    ))}
                  </div>

                  <dl className="op-d">
                    <dt>{t('sh.good')}</dt>
                    <dd>{tx(o.good)}</dd>
                    <dt>{t('sh.bad')}</dt>
                    <dd>{tx(o.bad)}</dd>
                  </dl>

                  <div className="op-rev">
                    <span className="l">{t('sh.rev')}</span>
                    <span className="d">
                      {[1, 2, 3].map((i) => (
                        <i key={i} className={i <= rev ? 'on' : ''} />
                      ))}
                    </span>
                    <span className="v">{t(`sh.rev${rev}`)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="sh-end">
          <h2>{t('sh.endH')}</h2>
          <p>{t('sh.endB')}</p>
        </section>
      </div>
    </AppFrame>
  )
}
