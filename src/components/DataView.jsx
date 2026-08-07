/**
 * 03 · 정량 근거 — 건물이 바뀌기 전과 후.
 *
 * 다섯 갈래를 같은 틀로 묻는다. 왼쪽에 전, 가운데에 후, 오른쪽에 그래서 무엇인가.
 * 못 구한 갈래도 같은 자리를 차지한다. 빈칸을 감추면 결론이 어디까지
 * 근거를 가진 것인지 알 수 없게 된다.
 */

import { useState } from 'react'

import { CARDS, CONCLUSION, EVENT, tally } from '../data/evidence'
import { sheetOf } from '../data/sheets'
import { useLang } from '../i18n'
import { n } from '../lib/format'
import AppFrame from './AppFrame'
import DataSheet from './DataSheet'
import { Bars } from './MiniChart'

const t3 = tally()
const pct = (v) => `${v > 0 ? '+' : ''}${v}%`

/** 전 → 후 큰 숫자 두 개 */
function BeforeAfter({ c }) {
  const { t, tx } = useLang()
  return (
    <div className="ba">
      <div className="ba-s">
        <span className="l">{t('ev.before')}</span>
        <b className="num">{n(c.before.v)}</b>
        <em>{c.before.period}</em>
      </div>
      <div className="ba-x" aria-hidden="true">
        <svg viewBox="0 0 30 12" preserveAspectRatio="none">
          <path d="M0,6 H23" />
          <path d="M18,2 L24,6 L18,10" />
        </svg>
        <span className={`d ${c.pct >= 0 ? 'up' : 'dn'}`}>{pct(c.pct)}</span>
      </div>
      <div className="ba-s after">
        <span className="l">{t('ev.after')}</span>
        <b className="num">{n(c.after.v)}</b>
        <em>{c.after.period}</em>
      </div>
      {c.ctrl != null && (
        <div className="ba-c">
          <span>{t('ev.ctrl')} <b className="num">{pct(c.ctrl)}</b></span>
          <span className="ex">{t('ev.excess')} <b className="num">+{c.excess}%p</b></span>
        </div>
      )}
    </div>
  )
}

function Missing() {
  const { t } = useLang()
  return (
    <div className="ba miss" role="img" aria-label={t('ev.noData')}>
      <span>{t('ev.noData')}</span>
    </div>
  )
}

export default function DataView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
  const [sheet, setSheet] = useState(null)

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 03</div>
        <h2>{t('ev.title')}</h2>
        <p>{t('ev.sub')}</p>
      </div>

      <section>
        <h3 className="lab">{t('ev.eventTitle')}</h3>
        <div className="evt">
          <b className="num">{EVENT.ym}</b>
          <span>{tx(EVENT.label)}</span>
        </div>
        <p className="note">{tx(EVENT.note)}</p>
        <p className="note">{tx(EVENT.why)}</p>
      </section>

      <section>
        <h3 className="lab">{t('ev.statusTitle')}</h3>
        <div className="st-bar">
          <span className="have" style={{ flex: t3.have }} />
          <span className="flat" style={{ flex: t3.flat }} />
          <span className="miss" style={{ flex: t3.missing }} />
        </div>
        <div className="st-l">
          <span><b className="num">{t3.have}</b> {t('ev.stHave')}</span>
          <span><b className="num">{t3.flat}</b> {t('ev.stFlat')}</span>
          <span><b className="num">{t3.missing}</b> {t('ev.stMiss')}</span>
        </div>
        <p className="note">{t('ev.statusNote')}</p>
      </section>
    </>
  )

  return (
    <AppFrame
      stage="data"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      scroll
      next={{ label: t('step.verdict'), onClick: onNext }}
    >
      <div className="ev2">
        <div className="ev2-h">
          <span className="l">{t('ev.head')}</span>
          <b>{EVENT.ym} · {tx(EVENT.label)}</b>
        </div>

        {CARDS.map((c) => (
          <article key={c.id} className={`ev2-r ${c.status}`}>
            <div className="ev2-no num">{c.no}</div>

            <div className="ev2-q">
              <h3>{tx(c.title)}</h3>
              <div className="ask">{tx(c.ask)}</div>
              {c.unit && <div className="unit">{tx(c.unit)}</div>}
              <span className={`tag ${c.status}`}>{t(`ev.st.${c.status}`)}</span>
              {c.sample && <span className="samp">{t('ev.sample')}</span>}
            </div>

            <div className="ev2-m">
              {c.status === 'missing' && <Missing />}
              {c.before && <BeforeAfter c={c} />}
              {c.bars && (
                <div className="ev2-bars">
                  <Bars bars={c.bars} />
                  {c.ages && (
                    <div className="ev-ages">
                      {c.ages.map((a) => (
                        <span key={a.label}>
                          <b className="num">{a.v}%</b>
                          {a.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {c.moves && (
                <div className="mv">
                  {c.moves.map((m) => (
                    <div key={tx(m.label)} className={m.v > 0 ? 'up' : 'dn'}>
                      <span className="n">{tx(m.label)}</span>
                      <span className="v num">{m.v > 0 ? '+' : ''}{n(m.v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ev2-s">
              <ul>
                {c.facts.map((f) => (
                  <li key={tx(f)}>{tx(f)}</li>
                ))}
              </ul>
              <p className="say">{tx(c.reading)}</p>
              <div className="ev2-f">
                {c.verdict ? (
                  <span className={`v ${c.verdict}`}>{t(`ev.${c.verdict}`)}</span>
                ) : (
                  <span className="v none">{t('ev.noVerdict')}</span>
                )}
                <span className="src">{tx(c.src)}</span>
                {sheetOf(c.id) && (
                  <button type="button" className="see" onClick={() => setSheet(c.id)}>
                    {t('ev.see')}
                  </button>
                )}
              </div>
              {c.limit && <div className="lim">{tx(c.limit)}</div>}
            </div>
          </article>
        ))}

        <article className="ev2-end">
          <div className="ev2-no num">→</div>
          <div className="ev2-end-b">
            <h2>{tx(CONCLUSION.head)}</h2>
            <ol>
              {CONCLUSION.yes.map((y) => (
                <li key={tx(y)}>{tx(y)}</li>
              ))}
            </ol>
            <div className="but">
              <span className="l">{t('ev.but')}</span>
              <p>{tx(CONCLUSION.but)}</p>
            </div>
          </div>
        </article>
      </div>

      {sheet && <DataSheet id={sheet} onClose={() => setSheet(null)} />}
    </AppFrame>
  )
}
