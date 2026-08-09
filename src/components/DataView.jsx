/**
 * 03 · 정량 근거 — 지금 이 건물, 제 용도로 잘 쓰이고 있는가.
 *
 * 갈래마다 표와 사실을 다 펼쳐 놓으니 세로가 길어져 끝까지 읽히지 않았다.
 * 카드는 「무엇을 물었고 답이 얼마인가」만 들고, 근거는 누르면 열리는 시트가 맡는다.
 *
 * 카드 위에는 왜 이 근거가 필요한지를 먼저 놓는다 — 다섯을 보여 주기 전에
 * 「왜 다섯인가」에 답해야 하기 때문이다.
 */

import { useState } from 'react'

import { CARDS, CONCLUSION, EVENT } from '../data/evidence'
import { LAYERS } from '../data/method'
import { sheetOf } from '../data/sheets'
import { useLang } from '../i18n'
import AppFrame from './AppFrame'
import DataSheet from './DataSheet'
import MethodMap from './MethodMap'

/** 등급 — 계산은 다섯 다 섰고, 자료가 연결된 것만 실측이다 */
const GRADE = { have: 'verified', missing: 'collecting', flat: 'hypothesis' }
const gradeOf = (c) => GRADE[c.status] || 'hypothesis'

/** 층위 순서대로 늘어놓는다 — 카드 위 띠와 줄을 맞추기 위해서다 */
const ORDERED = LAYERS.flatMap((lv) => lv.axes)
  .map((id) => CARDS.find((c) => c.id === id))
  .filter(Boolean)

export default function DataView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
  const [sheet, setSheet] = useState(null)
  const measured = CARDS.filter((c) => c.status === 'have').length

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 03</div>
        <h2>{t('ev.title')}</h2>
        <p>{t('ev.sub')}</p>
      </div>

      <section>
        <h3 className="lab">{t('tj.gradeTitle')}</h3>
        <dl className="tj-ax">
          <div className="done">
            <dt>{t('tj.axCalc')}</dt>
            <dd>
              <b className="num">{CARDS.length}/{CARDS.length}</b>
              <span className="s">{t('tj.axDone')}</span>
              <span className="d">{t('tj.axCalcD')}</span>
            </dd>
          </div>
          <div>
            <dt>{t('tj.axData')}</dt>
            <dd>
              <b className="num">{measured}/{CARDS.length}</b>
              <span className="s">{t('tj.axLinked')}</span>
              <span className="d">{t('tj.axDataD')}</span>
            </dd>
          </div>
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
      <div className="ev3">
        <MethodMap />

        {/* ── 다섯 갈래 · 층위 띠 아래 한 줄 ─────────── */}
        <div className="ev3-h">
          <span className="l">{t('ev.axes')}</span>
          <b>{EVENT.ym} · {tx(EVENT.label)}</b>
        </div>

        <div className="ec-g">
          {LAYERS.map((lv) => (
            <div key={lv.id} className={`ec-lb ${lv.id}`}>
              <b>{tx(lv.label)}</b>
              <span>{tx(lv.lead)}</span>
            </div>
          ))}

          {ORDERED.map((c) => {
            const g = gradeOf(c)
            return (
              <button
                key={c.id}
                type="button"
                className={`ec ${g}`}
                onClick={() => sheetOf(c.id) && setSheet(c.id)}
              >
                <div className="ec-t">
                  <em className="num">{c.no}</em>
                  <span className={`g ${g}`}>{t(`tj.g.${g}`)}</span>
                </div>
                <h3>{tx(c.title)}</h3>
                <p className="q">{tx(c.ask)}</p>
                <div className="ec-v">
                  <b className={`num${c.brief.v === '—' ? ' none' : ''}`}>{c.brief.v}</b>
                  <span>{tx(c.brief.d)}</span>
                </div>
                <p className="say">{tx(c.reading)}</p>
                <span className="ec-go">{t('ev.see')}</span>
                {c.feed && (
                  <span className={`ec-f${c.feed.live ? ' live' : ''}`}>
                    <i aria-hidden="true" />
                    {c.feed.live ? t('ms.live') : tx(c.feed.label)}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <article className="ev2-end">
          <div className="ev2-no num">→</div>
          <div className="ev2-end-b">
            <h2>{tx(CONCLUSION.head)}</h2>
            <ol>
              {CONCLUSION.yes.map((y) => (
                <li key={tx(y)}>{tx(y)}</li>
              ))}
            </ol>
            <div className="but">{tx(CONCLUSION.but)}</div>
          </div>
        </article>
      </div>

      {sheet && <DataSheet id={sheet} onClose={() => setSheet(null)} />}
    </AppFrame>
  )
}
