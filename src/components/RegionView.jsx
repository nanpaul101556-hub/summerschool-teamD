/**
 * 02 · 지역 정보 — 누가 살고 무엇을 하는가.
 *
 * 확보한 자료는 스테이지에, 아직 없는 자료는 패널에 놓는다.
 * 빈칸을 감추면 대안이 어디까지 근거를 가진 것인지 알 수 없게 된다.
 */

import { AXES, EXCLUDED, STATUS, tally } from '../data/datasets'
import { OBSERVED } from '../data/facilities'
import { DECLINE_RANK, POPULATION, VULNERABLE } from '../data/population'
import { useLang } from '../i18n'
import { n } from '../lib/format'
import { interpolate } from '../lib/timeline'
import AppFrame from './AppFrame'
import PopCurve from './PopCurve'
import Skel from './Skel'

const tal = tally()

export default function RegionView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
  const now = interpolate(POPULATION, 2026)
  const late = interpolate(POPULATION, 2042)

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 02</div>
        <h2>{t('region.title')}</h2>
        <p>{t('region.sub', { n: tal.total })}</p>
      </div>

      <section>
        <div className="tal-bar">
          <span className="have" style={{ flex: tal.have }} />
          <span className="partial" style={{ flex: tal.partial }} />
          <span className="none" style={{ flex: tal.none }} />
        </div>
        <div className="tal-l">
          <span><b className="num">{tal.have}</b> {t('region.have')}</span>
          <span><b className="num">{tal.partial}</b> {t('region.partial')}</span>
          <span><b className="num">{tal.none}</b> {t('region.none')}</span>
        </div>
      </section>

      {AXES.map((ax) => (
        <section key={ax.key}>
          <div className="ax-h">
            <span className="ax-no num">{ax.no}</span>
            <span className="ax-l">{tx(ax.label)}</span>
          </div>
          <div className="ax-q">{tx(ax.q)}</div>
          {ax.lead && <div className="ax-lead">{tx(ax.lead)}</div>}

          <div className="slots">
            {ax.items.map((it) => (
              <div key={it.code} className={`slot ${it.status}`}>
                <div className="sl-h">
                  <span className="sl-n">{tx(it.name)}</span>
                  {it.rank && <span className="sl-r num">#{it.rank}</span>}
                  <span className={`sl-s ${STATUS[it.status].tone}`}>
                    {t(STATUS[it.status].key)}
                  </span>
                </div>
                <div className="sl-src">
                  {tx(it.src)}
                  {it.api && <em>API</em>}
                </div>
                {it.impact && <div className="sl-i">{tx(it.impact)}</div>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h3 className="lab">{t('region.excluded')}</h3>
        <div className="rows">
          {EXCLUDED.map((e) => (
            <div key={e.name.ko}>
              <span className="n">
                {tx(e.name)}
                <br />
                <span className="sub">{tx(e.why)}</span>
              </span>
              <span className="m">{t('region.excludedTag')}</span>
            </div>
          ))}
        </div>
        <p className="note">{t('region.excludedNote')}</p>
      </section>
    </>
  )

  return (
    <AppFrame
      stage="region"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      scroll
      next={{ label: t('step.options'), onClick: onNext }}
    >
      <div className="region">
        <section className="rg-wide">
          <div className="rg-h">
            <h3 className="lab">{t('region.pop')}</h3>
            <span className="rg-tag">{t('region.have')}</span>
          </div>
          <PopCurve />
          <p className="note">
            {t('region.popNote', { a: now.elder, b: late.elder,
              total: DECLINE_RANK.total, rank: DECLINE_RANK.rank })}
          </p>
        </section>

        <section>
          <div className="rg-h">
            <h3 className="lab">{t('region.vulnerable')}</h3>
            <span className="rg-tag">{t('region.have')}</span>
          </div>
          <div className="acts">
            {VULNERABLE.map((v) => (
              <div key={v.key}>
                <span className="ac-n">
                  {tx(v.label)}
                  <em>{tx(v.note)}</em>
                </span>
                <span className="ac-b">
                  <span style={{ width: `${(v.value / 36839) * 100}%` }} />
                </span>
                <span className="ac-v num">{n(v.value)}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="rg-h">
            <h3 className="lab">{t('region.acts')}</h3>
            <span className="rg-tag">{t('region.have')}</span>
          </div>
          <div className="acts">
            {OBSERVED.topActs.map((a) => (
              <div key={a.act.ko}>
                <span className="ac-n">{tx(a.act)}</span>
                <span className="ac-b">
                  <span style={{ width: `${(a.n / OBSERVED.topActs[0].n) * 100}%` }} />
                </span>
                <span className="ac-v num">{a.n}</span>
              </div>
            ))}
          </div>
          <p className="note">{t('region.actsNote', { n: OBSERVED.total })}</p>
        </section>

        <section>
          <div className="rg-h">
            <h3 className="lab">{t('region.byTime')}</h3>
            <span className="rg-tag">{t('region.have')}</span>
          </div>
          <div className="acts">
            {OBSERVED.byTime.map((s) => {
              const v = s.male + s.female
              const max = Math.max(...OBSERVED.byTime.map((x) => x.male + x.female))
              return (
                <div key={s.slot.ko}>
                  <span className="ac-n">{tx(s.slot)}</span>
                  <span className="ac-b">
                    <span style={{ width: `${(v / max) * 100}%` }} />
                  </span>
                  <span className="ac-v num">{v}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* 아직 안 붙은 자료도 자리를 잡아 둔다 */}
        {AXES.filter((ax) => ax.viz).map((ax) => (
          <section key={ax.key} className="rg-ghost">
            <div className="rg-h">
              <h3 className="lab">{tx(ax.label)}</h3>
              <span className="rg-tag off">{t('region.none')}</span>
            </div>
            <Skel kind={ax.viz} />
            <div className="gh-q">{tx(ax.q)}</div>
            <div className="gh-list">
              {ax.items
                .filter((i) => i.status !== 'have')
                .map((i) => (
                  <span key={i.code}>
                    {tx(i.name)}
                    {i.rank && <em className="num">#{i.rank}</em>}
                  </span>
                ))}
            </div>
          </section>
        ))}
      </div>
    </AppFrame>
  )
}
