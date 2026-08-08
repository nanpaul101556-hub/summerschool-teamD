/**
 * 03 · 정량 근거 — 지금 이 건물, 제 용도로 잘 쓰이고 있는가.
 *
 * 실존 건물에는 「신축 사건」이 없다. 그래서 전/후로 자르지 않고
 * 두 궤적이 벌어지는 지점을 본다. 그 그래프가 화면의 머리이고,
 * 여섯 갈래는 그 선을 만든 근거로 아래에 선다.
 *
 * 근거는 등급을 밝힌다. 확실하지 않은 것을 확실한 척하지 않는 것이
 * 이 도구를 믿을 수 있게 만드는 유일한 방법이다.
 */

import { useState } from 'react'

import { CARDS, CONCLUSION, EVENT } from '../data/evidence'
import { sheetOf } from '../data/sheets'
import { useLang } from '../i18n'
import { n } from '../lib/format'
import { DEMAND, THRESHOLD, findTurn } from '../lib/trajectory'
import AppFrame from './AppFrame'
import DataSheet from './DataSheet'
import { Bars } from './MiniChart'
import TwoLines from './TwoLines'

const { turn } = findTurn()

/**
 * 근거 등급 — 확정 논리의 정직성 규칙.
 *   검증됨  대조군을 두고 잰 것          (전후를 실제로 쟀다)
 *   수집 중  받는 절차가 정해진 것        (데모로 자리만 잡아 둔 것)
 *   가설    단면만 있어 추세는 미검증
 */
const GRADE = { have: 'verified', missing: 'collecting', flat: 'hypothesis' }
const gradeOf = (c) => GRADE[c.status] || 'hypothesis'
const ORDER = ['verified', 'hypothesis', 'collecting']
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

/**
 * 자릿수가 흔들리면 표가 아니다 — 소수 자리를 고정하고 빼기표는 진짜 마이너스(−)를 쓴다.
 * 만족도처럼 소수로 재는 축은 tab.scale 로 정수를 나눠 되돌린다(304 → 3.04).
 */
const pp = (v, unit = '%p') =>
  `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(unit === '%p' ? 1 : 2)}${unit}`

const cell = (v, scale) =>
  scale ? (v / scale).toFixed(2) : v.toLocaleString()

/**
 * 예시 표 — 자료가 없는 칸을 비워 두지 않고, 자료가 오면 어떤 표가 서는지 보인다.
 * 빗금 테두리가 「이 수치는 실물이 아니다」를 말한다. 판정에는 들어가지 않는다.
 */
function SampleTable({ tab }) {
  const { t, tx } = useLang()
  return (
    <div className="ev2-samp">
      <div className="cap">
        <span className="samp">{t('ev.sample')}</span>
        <span className="ev2-samp-h">{tx(tab.head)}</span>
      </div>
      <table className="ev2-tab">
        <thead>
          <tr>
            <th>{tx(tab.cols[0])}</th>
            {tab.cols.slice(1).map((c) => <th key={tx(c)}>{tx(c)}</th>)}
          </tr>
        </thead>
        <tbody>
          {tab.rows.map((r) => (
            <tr key={tx(r.label)} className={r.lead ? 'lead' : ''}>
              <td>{tx(r.label)}</td>
              <td className="num">{cell(r.before, tab.scale)}</td>
              <td className="num">{cell(r.after, tab.scale)}</td>
              <td className="num d">{pp(r.d, tab.unitD)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ev2-samp-n">{tx(tab.note)}</p>
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
        <h3 className="lab">{t('tj.how')}</h3>
        <dl className="tj-in">
          <dt>{t('tj.inDemand')}</dt>
          <dd className="mono">({t('tj.elder')} − {DEMAND.base}) × {DEMAND.slope}</dd>
          <dt>{t('tj.inFit')}</dt>
          <dd>{t('tj.inFitF')}</dd>
        </dl>
        <p className="note">{t('tj.why')}</p>
      </section>

      <section>
        <h3 className="lab">{t('tj.gradeTitle')}</h3>
        <dl className="tj-gr">
          {ORDER.map((g) => (
            <div key={g}>
              <dt className={g}>{t(`tj.g.${g}`)}</dt>
              <dd>
                <b className="num">{CARDS.filter((c) => gradeOf(c) === g).length}</b>
                {t(`tj.g.${g}D`)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="note">{t('tj.gradeNote')}</p>
      </section>

      <section>
        <h3 className="lab">{t('ev.eventTitle')}</h3>
        <div className="evt">
          <b className="num">{EVENT.ym}</b>
          <span>{tx(EVENT.label)}</span>
        </div>
        <p className="note">{tx(EVENT.note)}</p>
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
          <span className="l">{t('tj.head')}</span>
          <b>{turn ? t('tj.headV', { y: turn.year, n: THRESHOLD }) : t('tj.head')}</b>
        </div>
        <p className="ev2-lead">{t('tj.sub')}</p>

        <TwoLines />

        <div className="ev2-h feeds">
          <span className="l">{t('tj.feeds')}</span>
          <b>{t('ev.head')}</b>
        </div>

        {CARDS.map((c) => (
          <article key={c.id} className={`ev2-r ${c.status}`}>
            <div className="ev2-no num">{c.no}</div>

            <div className="ev2-q">
              <h3>{tx(c.title)}</h3>
              <div className="ask">{tx(c.ask)}</div>
              {c.unit && <div className="unit">{tx(c.unit)}</div>}
              <span className={`grade ${gradeOf(c)}`}>{t(`tj.g.${gradeOf(c)}`)}</span>
              {c.sample && <span className="samp">{t('ev.sample')}</span>}
            </div>

            <div className="ev2-m">
              {c.tab && <SampleTable tab={c.tab} />}
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
