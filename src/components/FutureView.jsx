/**
 * 05 · 시간 변화 — 무엇이 남고 무엇이 바뀌는가.
 * 세 장을 나란히 놓는 것 자체가 논지다. 프레임은 같고 채움만 다르다.
 */

import { useEffect, useState } from 'react'

import { FUTURES, KEPT } from '../data/futures'
import { SITE } from '../data/site'
import { useLang } from '../i18n'
import { buildOptions } from '../lib/options'
import AppFrame from './AppFrame'

export default function FutureView({ site, picked, onStep, onReset }) {
  const { t, tx } = useLang()
  const [open, setOpen] = useState(null)

  // 04 에서 고른 대안의 사양을 그대로 쓴다 — 화면끼리 어긋나지 않게
  const options = buildOptions(SITE.plannedArea)
  const option = options.find((o) => o.key === picked) ?? options[options.length - 1]
  const spec = option.spec

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 05</div>
        <h2>{t('fu.title')}</h2>
        <p>{t('fu.sub', { key: option.key })}</p>
      </div>

      <section>
        <div className="kv">
          {KEPT.map((k) => (
            <div key={k.k}>
              <span className="k">{t(k.k)}</span>
              <span className="v num">
                {k.unit === 'm' ? spec[k.from].toFixed(1) : spec[k.from]}
                <em> {k.unit}</em>
              </span>
            </div>
          ))}
        </div>
        <p className="note">{t('fu.keptNote')}</p>
      </section>

      <section>
        <h3 className="lab">{t('fu.byTime')}</h3>
        <div className="rows">
          {FUTURES.map((f) => (
            <div key={f.key}>
              <span className="n">
                {tx(f.after)} · {f.year}
                <br />
                <span className="sub">{tx(f.use)}</span>
              </span>
              <span className="m">{t(f.certainty === 'unknown' ? 'fu.notPredicted' : 'fu.grounded')}</span>
            </div>
          ))}
        </div>
        <p className="note">{t('fu.byTimeNote')}</p>
      </section>
    </>
  )

  return (
    <AppFrame stage="future" site={site} onStep={onStep} onReset={onReset} side={side}>
      <div className="futures">
        {FUTURES.map((f) => (
          <article key={f.key} className="fu">
            <button
              type="button"
              className="fu-img"
              onClick={() => setOpen(f)}
              aria-label={t('fu.zoom', { after: tx(f.after) })}
            >
              <img src={f.img} alt={`${tx(f.after)} · ${tx(f.use)}`} loading="lazy" />
              <span className="fu-yr num">{tx(f.after)}</span>
            </button>

            <div className="fu-body">
              <div className="fu-use">
                {tx(f.use)}
                {f.certainty === 'unknown' && <span className="tag">{t('fu.notPredicted')}</span>}
              </div>
              <div className="fu-yn num">{f.year}</div>
              <p className="fu-basis">{tx(f.basis)}</p>
              <div className="fu-in">
                <span className="fu-k">{t('fu.changes')}</span>
                {tx(f.infill)}
              </div>
            </div>
          </article>
        ))}
      </div>

      {open && (
        <div
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={`${tx(open.after)} · ${tx(open.use)}`}
          onClick={() => setOpen(null)}
        >
          <img src={open.img} alt={`${tx(open.after)} · ${tx(open.use)}`} />
          <div className="lb-cap">
            <b>{tx(open.after)} · {open.year}</b> {tx(open.use)}
          </div>
          <button type="button" className="lb-x" aria-label={t('fu.close')}>{t('fu.close')}</button>
        </div>
      )}
    </AppFrame>
  )
}
