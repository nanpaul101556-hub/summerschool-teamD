/**
 * 04 · 판정 — 모은 자료가 무엇이라 말하는가.
 *
 * 전에는 입력 다섯을 늘어놓고 처방으로 바로 건너뛰었다. 그래서 이 화면이
 * 답해야 할 질문 — 「그래서 좋은가 나쁜가」 — 이 어디에도 없었다.
 *
 * 순서를 바꾼다. 결론을 먼저 크게 놓고, 그 아래에서 하나씩 따진다.
 *
 *   ① 판정        좋다 둘 · 나쁘다 하나 · 쌓는 중 셋 → 한 문장
 *   ② 신호        축마다 좋다·나쁘다와 그렇게 본 기간
 *   ③ 그래서      두 신호가 합쳐 무엇이 되는가
 *   ④ 그런데      왜 「지금 좋다」가 「계속 좋다」가 아닌가
 *   ⑤ 언제        마지막 개입 + 법정 주기 = 다시 보는 해. 문단이 아니라 식이다
 *   ⑥ 무엇으로    그때 열려 있는 용도
 *
 * 좋은 것만 세지 않는다. 같은 승하차 자료도 12개월로 보면 오르고 2019년과
 * 견주면 못 돌아왔다. 둘 다 사실이므로 ② 에 둘 다 놓는다.
 */

import { DRIFT, PHASES, SIGNALS, TALLY } from '../data/verdict'
import { NEXT_YEAR, WHEN } from '../data/outcome'
import { READS, UNUSED } from '../data/derive'
import { PROGRAMS } from '../data/plans'
import { useLang } from '../i18n'
import AppFrame from './AppFrame'

const ORDER = ['good', 'bad', 'wait']
const ROWS = ORDER.flatMap((d) => SIGNALS.filter((s) => s.dir === d))

export default function VerdictView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 04</div>
        <h2>{t('vd.title')}</h2>
        <p>{t('vd.sub')}</p>
      </div>

      <section>
        <h3 className="lab">{t('vd.tally')}</h3>
        <div className="vj-side">
          {TALLY.map(({ d, n }) => (
            <div key={d} className={d}>
              <b>{n}</b>
              <span>{t(`vd.d.${d}`)}</span>
            </div>
          ))}
        </div>
        <p className="note">{t('vd.tallyNote')}</p>
      </section>

      <section>
        <h3 className="lab">{tx(UNUSED.head)}</h3>
        <p className="note">{tx(UNUSED.body)}</p>
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
      <div className="vj">
        {/* ① 판정 ─────────────────────────────── */}
        <section className="vj-call">
          <span className="cap">{t('vd.callCap')}</span>
          <h2>{t('vd.callHead', { y: NEXT_YEAR })}</h2>
          <ul className="vj-cnt">
            {TALLY.map(({ d, n }) => (
              <li key={d} className={d}>
                <b>{n}</b>
                <span>{t(`vd.d.${d}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ② 신호 ─────────────────────────────── */}
        <section className="vj-s">
          <div className="sh-h">
            <h3>{t('vd.sigTitle')}</h3>
            <span>{t('vd.sigSub')}</span>
          </div>

          <ol className="vj-sl">
            {ROWS.map((s) => (
              <li key={s.id} className={s.dir}>
                <span className="mk" aria-hidden="true" />
                <span className="nm">
                  <b>{tx(s.label)}</b>
                  <em>{tx(s.span)}</em>
                </span>
                <span className="v">{s.v || t('vd.d.wait')}</span>
                <span className="say">{tx(s.say)}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ③ 그래서 ───────────────────────────── */}
        <section className="vj-r">
          <div className="sh-h">
            <h3>{t('vd.readTitle')}</h3>
            <span>{t('vd.readSub')}</span>
          </div>
          <div className="vj-rl">
            {READS.map((r) => (
              <article key={r.id}>
                <b>{tx(r.head)}</b>
                <p>{tx(r.body)}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ④ 그런데 ───────────────────────────── */}
        <section className="vj-d">
          <div className="sh-h">
            <h3>{t('vd.driftTitle')}</h3>
            <span>{t('vd.driftSub')}</span>
          </div>
          <ol className="vj-dl">
            {DRIFT.map((d) => (
              <li key={d.id}>
                <b className="num">{d.v}</b>
                <span className="h">{tx(d.head)}</span>
                <span className="d">{tx(d.body)}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ⑤ 언제 ─────────────────────────────── */}
        <section className="vj-ph">
          <div className="sh-h">
            <h3>{t('vd.phTitle')}</h3>
            <span>{t('vd.phSub')}</span>
          </div>

          {/* 문단으로 설명하면 읽어야 안다. 식으로 놓으면 보면 안다. */}
          <p className="vj-eq">
            {WHEN.rows.slice(0, 2).map((r) => (
              <span key={r.id}>
                <b className="num">{r.v}</b>
                <em>{typeof r.k === 'string' ? r.k : tx(r.k)}</em>
              </span>
            ))}
            <span className="out">
              <b className="num">{NEXT_YEAR}</b>
              <em>{t('vd.eqOut')}</em>
            </span>
          </p>

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

        {/* ⑥ 무엇으로 ─────────────────────────── */}
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
