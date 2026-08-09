/**
 * 05 생애주기 — 언제 손봐야 하는가. ★마무리
 *
 * 금액을 말하지 않는다. 단가를 확보하지 못한 채 금액을 발표하면 숫자를 지어내는 것이 된다.
 * 대신 시점만 낸다. 시점은 법(건축물관리법 제13조③)과 이 건물의 이력에서 나오므로
 * 추정이 섞이지 않는다.
 *
 * 미래의 한 해를 찍지 않는다. 물리 시계(내장 5~7년·설비 15년·구조 50년)와
 * 수요 시계(관측된 3~4년)가 겹치는 자리를 찾는 것이 이 화면의 클라이맥스다.
 * 두 시계 중 하나만 보면 공사를 두 번 한다.
 */

import { useState } from 'react'

import { SITE } from '../data/site'
import {
  BUILT, CLOSING, FORMULA, FUNDING, LAW, NOW, PAST, SCOPE, WHY_NOW,
  checkYears,
} from '../data/timeline'
import { useLang } from '../i18n'
import { eligibleIncentives } from '../lib/constraint'
import AppFrame from './AppFrame'
import LccChart from './LccChart'
import TwoClocks from './TwoClocks'

const FROM = BUILT
const TO = 2050
const CHECKS = checkYears(2020, TO)

const pos = (year) => ((year - FROM) / (TO - FROM)) * 100

export default function LccView({ site, onStep, onReset }) {
  const { t, tx } = useLang()
  const [open, setOpen] = useState(PAST.find((p) => p.key)?.year ?? null)
  const incentives = eligibleIncentives(SITE)

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 05</div>
        <h2>{t('tm.title')}</h2>
        <p>{t('tm.sub')}</p>
      </div>

      <section>
        <h3 className="lab">{t('tm.lawTitle')}</h3>
        <blockquote className="tm-q">
          {tx(LAW.quote)}
          <cite>{LAW.art}</cite>
        </blockquote>
        <p className="note">{t('tm.lawNote', { n: LAW.cycle })}</p>
      </section>

      <section>
        <h3 className="lab">{t('tm.gapTitle')}</h3>
        <blockquote className="tm-q">
          {tx(LAW.gapQuote)}
          <cite>{LAW.gapArt}</cite>
        </blockquote>
        <p className="note">{tx(LAW.gap)}</p>
      </section>

      <section>
        <h3 className="lab">{t('tm.incTitle')}</h3>
        <div className="rows">
          {incentives.map((inc) => (
            <div key={inc.key}>
              <span className="n">
                {inc.label}
                <br />
                <span className="sub">{inc.detail}</span>
              </span>
              <span className="m">{t(inc.active ? 'site.applies' : 'site.notApplies')}</span>
            </div>
          ))}
        </div>
        <p className="note">{t('tm.incNote')}</p>
      </section>

      <section>
        <h3 className="lab">{t('tm.scopeTitle')}</h3>
        <p className="tm-scope-h">{tx(SCOPE.head)}</p>
        <table className="tm-scope">
          <thead>
            <tr>
              <th />
              {SCOPE.cols.map((c) => <th key={tx(c)}>{tx(c)}</th>)}
            </tr>
          </thead>
          <tbody>
            {SCOPE.rows.map((r) => (
              <tr key={tx(r.k)}>
                <th scope="row">{tx(r.k)}</th>
                <td className="do">{tx(r.a)}</td>
                <td className="dont">{tx(r.b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )

  return (
    <AppFrame stage="lcc" site={site} onStep={onStep} onReset={onReset} side={side} scroll>
      <div className="tm">
        <div className="tm-h">
          <span className="l">{t('tm.head')}</span>
          <b>{t('tm.headV', { built: BUILT, n: LAW.cycle })}</b>
        </div>

        <TwoClocks />

        <LccChart />

        {/* ── 축 ─────────────────────────────────────────── */}
        <div className="tm-axis">
          <div className="tm-line" />

          {/* 법정 점검 — 3년마다 */}
          {CHECKS.map((y) => (
            <span
              key={y}
              className={`tm-check${y > NOW ? ' near' : ''}`}
              style={{ left: `${pos(y)}%` }}
              title={`${y} · ${LAW.art}`}
            />
          ))}

          {/* 지나온 시점 */}
          {PAST.map((p) => (
            <button
              key={p.year}
              type="button"
              className={`tm-pt ${p.kind}${p.key ? ' key' : ''}${open === p.year ? ' on' : ''}`}
              style={{ left: `${pos(p.year)}%` }}
              onClick={() => setOpen(open === p.year ? null : p.year)}
            >
              <i />
              <em className="num">{p.year}</em>
            </button>
          ))}

          {/* 지금 */}
          <span className="tm-now" style={{ left: `${pos(NOW)}%` }}>
            <i />
            <em>{t('tm.now')}</em>
          </span>

        </div>

        <div className="tm-leg">
          <span><i className="c" />{t('tm.legCheck', { n: LAW.cycle })}</span>
          <span><i className="p" />{t('tm.legPast')}</span>
        </div>

        {/* ── 지나온 시점 ─────────────────────────────────── */}
        <h3 className="tm-sec">{t('tm.pastTitle')}</h3>
        <ol className="tm-list">
          {PAST.map((p) => (
            <li key={p.year} className={`${p.key ? 'key' : ''}${open === p.year ? ' on' : ''}`}>
              <button type="button" onClick={() => setOpen(open === p.year ? null : p.year)}>
                <b className="num">{p.year}</b>
                <span className="nm">{tx(p.label)}</span>
                <span className="ag">{p.year - BUILT}{t('tm.yrs')}</span>
              </button>
              {open === p.year && (
                <div className="tm-d">
                  <p>{tx(p.note)}</p>
                  {p.quote && <blockquote>{tx(p.quote)}</blockquote>}
                  <span className="src">{tx(p.src)}</span>
                </div>
              )}
            </li>
          ))}
        </ol>

        {/* ── 어디서 막히는가 ─────────────────────── */}
        <section className="tm-fm">
          <h3 className="tm-sec">{t('tm.fmTitle')}</h3>
          <div className="tm-fm-r">
            {FORMULA.parts.map((p, i) => (
              <span key={`${p.t}-${i}`} className={`pt ${p.k}`}>
                <b>{p.t}</b>
                {p.note && <em>{tx(p.note)}</em>}
              </span>
            ))}
          </div>
          <p className="note">{tx(FORMULA.note)}</p>
        </section>

        {/* ── 구가 실제로 내는 몫 ──────────────────── */}
        <section className="tm-fund">
          <h3 className="tm-sec">{t('tm.fundTitle')}</h3>
          <div className="tm-fund-b">
            <div className="bar" aria-hidden="true">
              <span className="gov" style={{ flex: FUNDING.ratio.gov }}>
                {FUNDING.ratio.gov}%
              </span>
              <span className="gu" style={{ flex: FUNDING.ratio.gu }}>
                {FUNDING.ratio.gu}%
              </span>
            </div>
            <div className="cap">
              <span>{tx(FUNDING.label)}</span>
              <b>{tx(FUNDING.head)}</b>
            </div>
          </div>
          <p className="note">{tx(FUNDING.body)}</p>
        </section>

        <section className="tm-end">
          <h2>{tx(CLOSING.head)}</h2>
          <p>{tx(CLOSING.body)}</p>
          <div className="tm-hook">
            <span className="l">{t('tm.hookL', { y: BUILT })}</span>
            <p>{tx(CLOSING.hook)}</p>
          </div>

          <div className="tm-why">
            <b>{tx(WHY_NOW.head)}</b>
            <ol>
              {WHY_NOW.chain.map((c) => <li key={tx(c)}>{tx(c)}</li>)}
            </ol>
            <p className="q">{tx(WHY_NOW.why)}</p>
            <p className="a">{tx(WHY_NOW.close)}</p>
          </div>
        </section>
      </div>
    </AppFrame>
  )
}
