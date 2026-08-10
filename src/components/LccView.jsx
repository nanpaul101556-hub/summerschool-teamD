/**
 * 05 생애주기 — 언제 손봐야 하는가. ★마무리
 *
 * 금액을 말하지 않는다. 단가를 확보하지 못한 채 금액을 발표하면 숫자를 지어내는 것이 된다.
 * 대신 시점만 낸다. 시점은 법(건축물관리법 제13조③)과 이 건물의 이력에서 나오므로
 * 추정이 섞이지 않는다.
 *
 * 화면은 세 그림으로 끝낸다 — 곡선(층별 잔존 수명) → 지평(지금부터 몇 년을 보나)
 * → 막대(층마다 얼마 남았나). y축이 셋 다 물리라 한 흐름으로 읽힌다.
 *
 * 두 시계·법정 점검 축·지나온 시점 목록·비용 구조·재원·마무리 문단은 걷어냈다.
 * 컴포넌트(TwoClocks · CostFrame)와 데이터(timeline.js 의 CLOSING · FUNDING ·
 * WHY_NOW · checkYears)는 남아 있으므로 되돌리려면 다시 붙이면 된다.
 */

import { useState } from 'react'

import { SITE } from '../data/site'
import { BUILT, LAW, SCOPE } from '../data/timeline'
import { useLang } from '../i18n'
import { eligibleIncentives } from '../lib/constraint'
import AppFrame from './AppFrame'
import Horizons from './Horizons'
import LifeFilm from './LifeFilm'
import LifeLeft from './LifeLeft'
import ValueCurve from './ValueCurve'

export default function LccView({ site, onStep, onReset }) {
  const { t, tx } = useLang()
  const incentives = eligibleIncentives(SITE)
  /** 곡선을 누르면 열리는 필름 — 같은 이야기를 건물 자체로 한 번 더 한다 */
  const [film, setFilm] = useState(false)

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

        {/* 물리 수명 하나로 흐른다 — 곡선(층별 잔존) → 지평(몇 년을 보나) → 막대(얼마 남았나).
            이용지수(정류장 승하차) 곡선은 걷어냈다. 그건 수요이지 건물 상태가 아니라,
            생애주기 화면에 섞으면 「가치」로 오독된다. 여기 세 그림의 y축은 모두 물리다. */}
        <ValueCurve onOpen={() => setFilm(true)} />

        <Horizons />

        <LifeLeft />
      </div>

      {film && <LifeFilm onClose={() => setFilm(false)} />}
    </AppFrame>
  )
}
