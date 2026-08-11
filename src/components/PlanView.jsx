/**
 * 02 · 상위계획 — 넓은 데서 좁은 데로.
 *
 *   서울시가 어디로 가는가 → 노원구는 어떤 상태인가 → 대상지는 어디에 놓였는가
 *
 * 각 단에 표시한 원문 페이지가 붙는다. 눌러서 크게 볼 수 있다.
 * 「이 조항에 의거했다」는 말은 원문을 볼 수 있을 때만 근거가 된다.
 */

import { useEffect, useState } from 'react'

import { LEVELS, PLAN_STATS, POP_TABLE, popShare } from '../data/upperPlans'
import { useLang } from '../i18n'
import AppFrame from './AppFrame'
import MindMap from './MindMap'
import { Lines } from './MiniChart'

const share = popShare()

/** 방향성 항목이 가리키는 페이지의 이미지 id — 같은 단의 인용에서 찾는다 */
const pageOf = (lv, p) => lv.trends.find((tr) => tr.p === p)?.page ?? lv.trends[0].page

/** 표시한 페이지를 크게 보는 오버레이 */
function Sheet({ page, onClose }) {
  const { t } = useLang()
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div className="sheet" onClick={onClose} role="dialog" aria-modal="true">
      <button type="button" className="sh-x" onClick={onClose} aria-label={t('plan.close')}>
        ×
      </button>
      <img src={`/plans/${page}.png`} alt="" onClick={(e) => e.stopPropagation()} />
    </div>
  )
}

export default function PlanView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
  const [open, setOpen] = useState(null)
  const [map, setMap] = useState(false)

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 02</div>
        <h2>{t('plan.title')}</h2>
        <p>{t('plan.sub')}</p>
      </div>

      <section>
        <div className="pv-nums">
          <div>
            <b className="num">{PLAN_STATS.quotes}</b>
            <span>{t('plan.quotes')}</span>
          </div>
          <div>
            <b className="num">{PLAN_STATS.pages}</b>
            <span>{t('plan.pages')}</span>
          </div>
        </div>
        <p className="note">{t('plan.marksNote', { n: PLAN_STATS.marks })}</p>
      </section>

      <section>
        <h3 className="lab">{t('plan.popTitle')}</h3>
        <div className="pop-t">
          {share.filter((r) => [2025, 2030, 2036, 2042].includes(r.y)).map((r) => (
            <div key={r.y}>
              <span className="y num">{r.y}</span>
              <span className="b">
                <span className="old" style={{ width: `${r.old}%` }} />
                <span className="yg" style={{ width: `${r.young}%` }} />
              </span>
              <span className="v num">{r.old}%</span>
            </div>
          ))}
        </div>
        <p className="note">{tx(POP_TABLE.src)}</p>
      </section>

      <section>
        <h3 className="lab">{t('plan.honestTitle')}</h3>
        <p className="note">{t('plan.honestBody')}</p>
      </section>
    </>
  )

  return (
    <AppFrame
      stage="plan"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      scroll
      next={{ label: t('step.data'), onClick: onNext }}
    >
      <div className="fn">
        <div className="fn-in">
          <span className="l">{t('plan.from')}</span>
          <b>{tx(site?.nameTx ?? site?.name ?? { ko: '대상지', en: 'Site', it: 'Sito' })}</b>
        </div>

        {LEVELS.map((lv, i) => (
          <section key={lv.id} className={`fn-lv l-${lv.id}`} style={{ '--i': i }}>
            <header className="fn-h">
              <span className="sc">{tx(lv.scope)}</span>
              <h3>{tx(lv.head)}</h3>
              <div className="doc">
                <b>{tx(lv.doc)}</b>
                <em>{tx(lv.docMeta)}</em>
              </div>
            </header>

            <p className="fn-lead">{tx(lv.lead)}</p>

            <div className="fn-body">
              <div className="fn-tr">
                {lv.trends.map((tr) => (
                  <article key={tr.id} className={tr.lead ? 'lead' : ''}>
                    <b>{tx(tr.label)}</b>
                    <blockquote>{tx(tr.text)}</blockquote>
                    <button type="button" onClick={() => setOpen(tr.page)}>
                      {t('plan.see')}
                      <em className="num">p.{tr.p}</em>
                    </button>
                  </article>
                ))}
              </div>

              <div className="fn-pg">
                {[...new Set(lv.trends.map((tr) => tr.page))].map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    className="thumb"
                    onClick={() => setOpen(pg)}
                    aria-label={t('plan.see')}
                  >
                    <img src={`/plans/${pg}.png`} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            <div className="fn-sum">
              <h4 className="lab">{t('plan.summary')}</h4>
              <p>{tx(lv.summary)}</p>
            </div>

            <div className="fn-sh">
              <h4 className="lab">{t('plan.shifts')}</h4>
              <div className="fn-sh-l">
                {lv.shifts.map((sh) => (
                  <div key={tx(sh.to)}>
                    <div className="sh-ab">
                      <span className="a">{tx(sh.from)}</span>
                      <svg viewBox="0 0 24 10" aria-hidden="true">
                        <path d="M0,5 H18" />
                        <path d="M14,1.5 L19,5 L14,8.5" />
                      </svg>
                      <span className="b">{tx(sh.to)}</span>
                    </div>
                    <p>
                      {tx(sh.why)}
                      <button type="button" onClick={() => setOpen(pageOf(lv, sh.p))}>
                        p.{sh.p}
                      </button>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {lv.id === 'nowon' && (
              <div className="fn-pop">
                <div className="fp-h">
                  <h4>{t('plan.popChart')}</h4>
                  <span>{tx(POP_TABLE.origin)}</span>
                </div>
                <Lines
                  years={share.map((r) => r.y)}
                  base={20.9}
                  series={[
                    {
                      key: 'old',
                      label: { ko: '65세 이상', en: '65 and over', it: 'Over 65' },
                      lead: true,
                      v: share.map((r) => r.old),
                    },
                    {
                      key: 'young',
                      label: { ko: '14세 이하', en: '14 and under', it: 'Under 14' },
                      v: share.map((r) => r.young),
                    },
                  ]}
                  unit="%"
                />
                <div className="fp-n">{t('plan.popNote')}</div>
              </div>
            )}

            {lv.near && (
              <div className="fn-near">
                {lv.near.map((f) => (
                  <div key={tx(f.label)}>
                    <span className="d num">{f.m}m</span>
                    <span className="l">
                      {tx(f.label)}
                      <em>{tx(f.note)}</em>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="fn-so">{tx(lv.so)}</div>
          </section>
        ))}

        <div className="fn-out">
          <span>{t('plan.next')}</span>
        </div>

        <button type="button" className="mm-open" onClick={() => setMap(true)}>
          <span className="i" aria-hidden="true">
            <svg viewBox="0 0 24 16">
              <circle cx="3" cy="8" r="2" />
              <circle cx="13" cy="3" r="2" />
              <circle cx="13" cy="13" r="2" />
              <circle cx="21" cy="3" r="1.6" />
              <circle cx="21" cy="13" r="1.6" />
              <path d="M5,8 C9,8 9,3 11,3 M5,8 C9,8 9,13 11,13 M15,3 H19 M15,13 H19" />
            </svg>
          </span>
          <span className="t">{t('plan.mapOpen')}</span>
          <span className="s">{t('plan.mapHint')}</span>
        </button>
      </div>

      {open && <Sheet page={open} onClose={() => setOpen(null)} />}
      {map && <MindMap site={site} onClose={() => setMap(false)} />}
    </AppFrame>
  )
}
