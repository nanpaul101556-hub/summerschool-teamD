/**
 * 04 · 판정 — 자료를 합치면 무엇을 해야 하는가.
 *
 * 위에 네 갈래의 입력을 놓고, 그 아래에 시간 구간별 처방을 놓는다.
 * 처방은 「바꿔라」가 아니라 「언제 무엇을 하라」다.
 */

import { BASIS, CALL, INPUTS, PHASES, haveCount } from '../data/verdict'
import { PROGRAMS } from '../data/plans'
import { useLang } from '../i18n'
import AppFrame from './AppFrame'

const SPAN = [2026, 2058]
const pos = (y) => ((y - SPAN[0]) / (SPAN[1] - SPAN[0])) * 100

export default function VerdictView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
  const have = haveCount()

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 04</div>
        <h2>{t('vd.title')}</h2>
        <p>{t('vd.sub')}</p>
      </div>

      <section>
        <h3 className="lab">{t('vd.inTitle')}</h3>
        <div className="vin">
          {INPUTS.map((i) => (
            <div key={i.id} className={i.have ? 'on' : 'off'}>
              <span className="n">{tx(i.label)}</span>
              <span className="v">{i.have ? tx(i.value) : t('vd.none')}</span>
            </div>
          ))}
        </div>
        <p className="note">{t('vd.inNote', { n: have, m: INPUTS.length })}</p>
      </section>

      <section>
        <h3 className="lab">{tx(BASIS.head)}</h3>
        <p className="note">{tx(BASIS.have)}</p>
        <div className="vgap">{tx(BASIS.gap)}</div>
      </section>
    </>
  )

  return (
    <AppFrame
      stage="verdict"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      scroll
      next={{ label: t('step.lcc'), onClick: onNext }}
    >
      <div className="vd2">
        {/* ── 입력 ─────────────────────────────── */}
        <section className="vd2-in">
          <div className="sh-h">
            <h3>{t('vd.inTitle')}</h3>
            <span>{t('vd.inSub')}</span>
          </div>
          <div className="vd2-il">
            {INPUTS.map((i) => (
              <article key={i.id} className={i.have ? 'have' : 'miss'}>
                <b>{tx(i.label)}</b>
                {i.have ? (
                  <span className={`v ${i.dir}`}>{tx(i.value)}</span>
                ) : (
                  <span className="v none">—</span>
                )}
                <p>{tx(i.detail)}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── 결론 ─────────────────────────────── */}
        <section className="vd2-call">
          <h2>{tx(CALL.head)}</h2>
          <p>{tx(CALL.body)}</p>
        </section>

        {/* ── 처방 ─────────────────────────────── */}
        <section className="vd2-ph">
          <div className="sh-h">
            <h3>{t('vd.phTitle')}</h3>
            <span>{t('vd.phSub')}</span>
          </div>

          <div className="ph-l">
            {PHASES.map((p) => (
              <article key={p.id} className={`${p.kind} ${p.key ? 'key' : ''}`}>
                <div className="ph-h">
                  <b>{tx(p.label)}</b>
                  <span className={`k ${p.kind}`}>{t(`vd.k.${p.kind}`)}</span>
                </div>
                <div className="ph-w">{tx(p.what)}</div>
                <p>{tx(p.why)}</p>
                {p.watch && (
                  <div className="ph-watch">
                    <span>{t('vd.watch')}</span>
                    {tx(p.watch)}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ── 무슨 용도로 ─────────────────────── */}
        <section className="vd2-pg">
          <div className="sh-h">
            <h3>{t('vd.pgTitle')}</h3>
            <span>{t('vd.pgSub')}</span>
          </div>

          <p className="vd2-pg-how">{t('vd.pgHow')}</p>

          <div className="pg-l">
            {[...PROGRAMS].sort((a, b) => (a.state === b.state ? 0 : a.state === 'open' ? -1 : 1))
              .map((p) => (
                <article key={p.id} className={`${p.state}${p.lead ? ' lead' : ''}`}>
                  <div className="pg-h">
                    <b>{tx(p.label)}</b>
                    <span className={`st ${p.state}`}>
                      {t(p.state === 'open' ? 'vd.pgOpen' : 'vd.pgTaken')}
                    </span>
                  </div>
                  <p>{tx(p.why)}</p>
                </article>
              ))}
          </div>

          <p className="note">{t('vd.pgNote')}</p>
        </section>

        <section className="vd2-next">
          <span>{t('vd.next')}</span>
        </section>
      </div>
    </AppFrame>
  )
}
