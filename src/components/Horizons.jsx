/**
 * 05 — 분석 지평 3 · 10 · 20년.
 *
 * LCC 는 준공부터 훑는 것이 아니라 지금부터 앞을 본다. 그래서 곡선 하나를
 * 길게 그리는 것으로는 「그래서 언제까지 뭘 정해야 하나」가 안 잡힌다.
 * 지평을 셋으로 끊어, 각 지평 안에 무엇이 들어오는지를 따로 적는다.
 *
 *   +3년  2029   물리 만기가 하나도 없다. 재기만 한다.
 *   +10년 2036   내장(2031)·설비(2034)가 둘 다 들어온다. 손대는 구간이다.
 *   +20년 2046   구조 수명(2039)이 들어온다. 존치냐 재건축이냐를 정해야 한다.
 *
 * 셋 다 우리가 고른 숫자가 아니다. 3년은 건축물관리법 제13조③ 의 점검 주기와
 * 같고, 10·20년은 이 건물의 물리 만기가 어디에 떨어지는지를 보고 끊었다.
 *
 * 금액은 아직 적지 않는다. 단가 두 종(용도별 ㎡당 공사비 · 재건축 단가)이
 * 없어 costs-junggye.json 열일곱 항목이 전부 비어 있다. 대신 그 지평 안에
 * 어떤 비용 항목이 발생하는지까지만 적는다 — 구조는 서 있고 값만 없다.
 */

import { COMPOSITE_END, HORIZON_ROWS, NOW } from '../lib/clocks'
import { useLang } from '../i18n'

const pc = (v) => (v == null ? '—' : `${Math.round(v * 100)}%`)

export default function Horizons() {
  const { t, tx } = useLang()

  return (
    <section className="hz">
      <header>
        <h3>{t('hz.title')}</h3>
        <span>{t('hz.sub', { now: NOW })}</span>
      </header>

      <div className="hz-g">
        {HORIZON_ROWS.map((h) => (
          <article key={h.id} className={`hz-c ${h.id}${h.decide ? ' decide' : ''}`}>
            <div className="hz-h">
              <b className="num">+{h.n}{t('tm.yrUnit')}</b>
              <em className="num">{h.year}</em>
            </div>

            <p className="hz-say">{t(`hz.say.${h.id}`)}</p>

            <dl className="hz-v">
              <div className="plan">
                <dt>{t('hz.plan')}</dt>
                <dd className="num">{h.beyond ? t('hz.beyond') : pc(h.plan)}</dd>
              </div>
              <div className="none">
                <dt>{t('hz.none')}</dt>
                <dd className="num">{pc(h.none)}</dd>
              </div>
            </dl>

            <ul className="hz-in">
              {h.lifts.length === 0 && <li className="none">{t('hz.noLift')}</li>}
              {h.lifts.map((m) => (
                <li key={m.id}>
                  <b className="num">{m.a}</b>
                  {tx(m.label)} {t('hz.due')}
                </li>
              ))}
              {h.decide && (
                <li className="big">
                  <b className="num">{COMPOSITE_END}</b>
                  {t('hz.structure')}
                </li>
              )}
            </ul>
          </article>
        ))}
      </div>

      <p className="hz-n">{t('hz.note')}</p>
    </section>
  )
}
