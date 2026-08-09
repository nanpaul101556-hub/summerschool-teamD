/**
 * 04 — 자료에서 판정까지, 그 사이를 보인다.
 *
 * 「입력이 다섯이고 결론은 이것이다」만 있으면 사이가 비어 보인다.
 * 무엇이 무엇을 말했고 그 둘이 합쳐 무엇이 됐는지를 세 칸으로 늘어놓는다.
 *
 *   잰 것 ─→ 그것이 말하는 것 ─→ 합치면
 *
 * 데모 셋은 이 사슬에 들어오지 않는다. 대신 맨 아래에 무엇을 뺐는지 적는다.
 */

import { CALL_OUT, FACTS, READS, UNUSED } from '../data/derive'
import { useLang } from '../i18n'

export default function Derivation() {
  const { t, tx } = useLang()

  return (
    <section className="dv">
      <div className="sh-h">
        <h3>{t('dv.title')}</h3>
        <span>{t('dv.sub')}</span>
      </div>

      <div className="dv-g">
        {/* ① 잰 것 */}
        <div className="dv-col">
          <h4>{t('dv.c1')}</h4>
          {FACTS.map((f) => (
            <div key={f.id} className={`dv-f ${f.to}`}>
              <div className="hd">
                <span className="nm">{tx(f.label)}</span>
                <span className={`g ${f.grade}`}>{t(`dv.g.${f.grade}`)}</span>
              </div>
              <b className="num">{f.value}</b>
              <span className="dt">{tx(f.detail)}</span>
              <span className="from">{t('dv.from', { n: f.from })}</span>
            </div>
          ))}
        </div>

        <div className="dv-ar" aria-hidden="true"><span /><span /></div>

        {/* ② 그것이 말하는 것 */}
        <div className="dv-col">
          <h4>{t('dv.c2')}</h4>
          {READS.map((r) => (
            <div key={r.id} className={`dv-r ${r.id}`}>
              <b>{tx(r.head)}</b>
              <p>{tx(r.body)}</p>
            </div>
          ))}
        </div>

        <div className="dv-ar one" aria-hidden="true"><span /></div>

        {/* ③ 합치면 */}
        <div className="dv-col">
          <h4>{t('dv.c3')}</h4>
          <div className="dv-out">
            <b>{tx(CALL_OUT.head)}</b>
            <p>{tx(CALL_OUT.body)}</p>
          </div>
        </div>
      </div>

      <div className="dv-un">
        <span className="l">{tx(UNUSED.head)}</span>
        <p>{tx(UNUSED.body)}</p>
      </div>
    </section>
  )
}
