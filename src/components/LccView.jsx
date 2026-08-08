/**
 * 05 생애주기 — 언제 손봐야 하는가. ★마무리
 *
 * 금액을 말하지 않는다. 단가를 확보하지 못한 채 금액을 발표하면 숫자를 지어내는 것이 된다.
 * 대신 시점만 낸다. 시점은 법(건축물관리법 제13조③)과 이 건물의 이력에서 나오므로
 * 추정이 섞이지 않는다.
 *
 * 미래의 한 해를 찍지 않는다. 이 건물이 손댄 간격(4년·3년)과
 * 법이 정한 점검 주기(3년)가 이미 같다는 관찰이 이 화면의 클라이맥스다.
 */

import { useState } from 'react'

import {
  BUILT, CLOSING, LAW, NOW, PAST, RHYTHM, checkYears, meanGap,
} from '../data/timeline'
import { useLang } from '../i18n'
import AppFrame from './AppFrame'

const FROM = BUILT
const TO = 2050
const CHECKS = checkYears(2020, TO)
const GAP = meanGap()

const pos = (year) => ((year - FROM) / (TO - FROM)) * 100

export default function LccView({ site, onStep, onReset }) {
  const { t, tx } = useLang()
  const [open, setOpen] = useState(PAST.find((p) => p.key)?.year ?? null)

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
        <h3 className="lab">{t('tm.noMoneyTitle')}</h3>
        <p className="note">{tx(CLOSING.noMoney)}</p>
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

        {/* ── 겹치는 자리 ─────────────────────────────────── */}
        <section className="tm-meet">
          <h3>{tx(RHYTHM.head)}</h3>
          <div className="tm-meet-g">
            <div>
              <span className="l">{t('tm.obsGap')}</span>
              <b className="num">{GAP % 1 ? GAP.toFixed(1) : GAP}{t('tm.yrUnit')}</b>
              <p>{t('tm.obsGapD', {
                a: RHYTHM.gaps[0].to - RHYTHM.gaps[0].from,
                b: RHYTHM.gaps[1].to - RHYTHM.gaps[1].from,
              })}</p>
            </div>
            <div className="x" aria-hidden="true">=</div>
            <div>
              <span className="l">{t('tm.fromLaw')}</span>
              <b className="num">{LAW.cycle}{t('tm.yrUnit')}</b>
              <p>{t('tm.checkAt', { n: LAW.cycle, art: LAW.art })}</p>
            </div>
          </div>
          <p className="tm-meet-b">{tx(RHYTHM.body)}</p>
          <p className="note">{tx(RHYTHM.caveat)}</p>
        </section>

        <section className="tm-end">
          <h2>{tx(CLOSING.head)}</h2>
          <p>{tx(CLOSING.body)}</p>
          <div className="tm-hook">
            <span className="l">{t('tm.hookL', { y: BUILT })}</span>
            <p>{tx(CLOSING.hook)}</p>
          </div>
        </section>
      </div>
    </AppFrame>
  )
}
