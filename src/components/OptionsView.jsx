/**
 * 03 · 대안 산출 — 앞의 자료가 여기서 선택지가 된다.
 *
 * 각 안은 시간에 따른 궤적이고, 갈리는 지점은 자료가 끊기는 곳부터다.
 * 규모 제약이 실제로 안을 걸러내므로, 통과와 미달을 같이 보여준다.
 */

import { DECLINE_RANK, POPULATION } from '../data/population'
import { SITE } from '../data/site'
import { areaLadder, buildOptions, recommend } from '../lib/options'
import { useLang } from '../i18n'
import { interpolate } from '../lib/timeline'
import AppFrame from './AppFrame'
import ForkTree from './ForkTree'

export default function OptionsView({ site, picked, onPick, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
  const options = buildOptions(SITE.plannedArea)
  const ladder = areaLadder(SITE.plannedArea)
  const now = interpolate(POPULATION, 2026)
  const late = interpolate(POPULATION, 2042)

  const rec = recommend(options, {
    elderNow: now.elder,
    elderLate: late.elder,
    declineRank: DECLINE_RANK.rank,
    plannedArea: SITE.plannedArea,
  })

  const sel = options.find((o) => o.key === picked)

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 03</div>
        <h2>{t('opt.title')}</h2>
        <p>{t('opt.sub')}</p>
      </div>

      <section>
        <ol className="because">
          {rec.because.map((b) => (
            <li key={b.ko}>{tx(b)}</li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="lab">{t('opt.ladder')}</h3>
        <div className="ladder">
          {ladder.map((l) => (
            <div key={l.span} className={l.reached ? 'on' : ''}>
              <span className="ld-a num">{l.area.toLocaleString()} m²</span>
              <span className="ld-b">
                <i style={{ width: `${Math.min(100, (SITE.plannedArea / l.area) * 100)}%` }} />
              </span>
              <span className="ld-n num">{l.uses.length}개</span>
            </div>
          ))}
        </div>
        <p className="note">
          {t('opt.ladderNote', { area: SITE.plannedArea, n: rec.viableKeys.length })}
        </p>
      </section>

      {sel && (
        <section>
          <h3 className="lab">{t('opt.selected', { key: sel.key })}</h3>
          <div className="kv">
            <div><span className="k">{t('opt.absorbs')}</span><span className="v">{t('opt.uses', { n: sel.absorbs })}</span></div>
            <div><span className="k">{t('opt.span')}</span><span className="v num">{sel.spec.span.toFixed(1)} m</span></div>
            <div><span className="k">{t('opt.load')}</span><span className="v num">{sel.spec.load} kg/m²</span></div>
            <div><span className="k">{t('opt.height')}</span><span className="v num">{sel.spec.height.toFixed(1)} m</span></div>
            <div><span className="k">{t('opt.required')}</span><span className="v num">{sel.required.toLocaleString()} m²</span></div>
          </div>
          <p className={`note ${sel.ok ? '' : 'warn'}`}>
            {sel.ok
              ? t('opt.ok', { area: SITE.plannedArea })
              : t('opt.short', { area: SITE.plannedArea, n: sel.shortfall.toLocaleString() })}
          </p>
          <p className="premise">
            <span>{t('opt.premise')}</span>
            {tx(sel.premise)}
          </p>
        </section>
      )}
    </>
  )

  return (
    <AppFrame
      stage="options"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      scroll
      next={{
        label: picked ? t('opt.next', { key: picked }) : t('opt.pick'),
        onClick: onNext,
        disabled: !picked,
      }}
    >
      <div className="opts">
        {options.map((o) => {
          const on = picked === o.key
          return (
            <button
              key={o.key}
              type="button"
              className={`opt ${on ? 'on' : ''} ${o.ok ? '' : 'short'}`}
              onClick={() => onPick(o.key)}
              aria-pressed={on}
            >
              <div className="opt-h">
                <span className="opt-k num">{o.key}</span>
                <span className="opt-l">{tx(o.label)}</span>
                {rec.key === o.key && <span className="opt-r">{t('opt.recommended')}</span>}
              </div>

              <p className="opt-s">{tx(o.strategy)}</p>

              {/* 궤적 — 건물이 받는 것과 넘기는 것을 구분한다 */}
              <div className="track">
                {o.track.map((s, i) => (
                  <div key={i} className={`tr ${s.mode} ${s.bet ? 'bet' : ''}`}>
                    <span className="tr-y num">{s.year}</span>
                    <span className="tr-u">{tx(s.label)}</span>
                    <span className="tr-m">
                      {t(s.mode === 'own' ? 'opt.own' : 'opt.link')}
                      {s.bet && <em>{t('opt.bet')}</em>}
                    </span>
                  </div>
                ))}
              </div>

              <div className="opt-req">
                <span>{t('opt.required')}</span>
                <b className="num">{o.required.toLocaleString()} m²</b>
                <span className={`opt-v ${o.ok ? 'ok' : ''}`}>
                  {o.ok ? t('opt.verdictOk') : `−${o.shortfall.toLocaleString()} m²`}
                </span>
              </div>

              <dl className="opt-why">
                <dt>{t('opt.benefit')}</dt><dd>{tx(o.benefit)}</dd>
                <dt>{t('opt.risk')}</dt><dd>{tx(o.risk)}</dd>
                <dt>{t('opt.premise')}</dt><dd className="pm">{tx(o.premise)}</dd>
              </dl>
            </button>
          )
        })}
      </div>

      <section className="fork-sec">
        <div className="rg-h">
          <h3 className="lab">{t('opt.forkTitle')}</h3>
          <span className="rg-tag">{t('opt.forkTag')}</span>
        </div>
        <ForkTree options={options} />
        <p className="note">{t('opt.forkNote')}</p>
      </section>
    </AppFrame>
  )
}
