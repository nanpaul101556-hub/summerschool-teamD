/** 01 · 대상지 — 지도가 스테이지를 다 쓰고, 판정 결과는 패널에 붙는다. */

import { SITE, TREND_DIRECTION, UPPER_PLANS } from '../data/site'
import { SOURCE, capacity } from '../data/zoning'

import { useLang } from '../i18n'
import { eligibleIncentives } from '../lib/constraint'
import { m2 } from '../lib/format'
import AppFrame from './AppFrame'
import SiteMap from './SiteMap'

export default function SiteView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
  const incentives = eligibleIncentives(SITE)
  const p = site.parcel
  const z = site.zone

  // 지적과 용도지역은 검색한 필지에서, 한도는 조례 표에서 온다
  const cap = capacity(p?.areaM2, z)
  const NA = t('site.missing')
  const or = (v) => (v == null ? NA : v)
  const specs = [
    { k: t('site.jibun'), v: or(p?.jibun) },
    {
      k: t('site.parcelArea'),
      v: or(p?.areaM2 ? `${p.areaM2.toLocaleString()} m²` : null),
      note: t('site.fromBoundary'),
    },
    {
      k: t('site.landPrice'),
      v: or(p?.jiga ? `${p.jiga.toLocaleString()} ₩/m²` : null),
      note: p?.gosi,
    },
    { k: t('site.zoning'), v: or(z?.name), note: z?.name ? SOURCE.zoneApi : null },
    {
      k: t('site.bcr'),
      v: or(z?.bcr != null ? `${z.bcr}%` : null),
      note: z?.bcr != null ? t('site.byLaw') : null,
    },
    {
      k: t('site.far'),
      v: or(z?.far != null ? `${z.far}%` : null),
      note: z?.far != null ? t('site.byLaw') : null,
    },
    {
      k: t('site.maxFloorArea'),
      v: or(cap ? m2(cap.base) : null),
      note: cap?.eased ? t('site.eased', { n: cap.easedFar, a: m2(cap.eased) }) : null,
    },
  ]

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 01</div>
        <h2>{site.name}</h2>
        <p>{site.address}</p>
      </div>

      <section className="hook">
        <h3 className="lab">{t('site.hookTitle')}</h3>
        <div className="hook-y">
          <b className="num">{SITE.builtYear}</b>
          <span>{t('site.hookAge', { n: 2026 - SITE.builtYear })}</span>
        </div>
        <p className="note">{t('site.hookBody')}</p>
      </section>

      <section>
        <h3 className="lab">{t('site.specs')}</h3>
        <div className="kv">
          {specs.map((s) => (
            <div key={s.k}>
              <span className="k">
                {s.k}
                {s.note && s.v !== NA && <em className="kn">{s.note}</em>}
              </span>
              <span className={`v num ${s.v === NA ? 'none' : ''}`}>{s.v}</span>
            </div>
          ))}
        </div>
        <p className="note">
          {t(site.curated ? 'site.curatedNote' : 'site.uncuratedNote')}
        </p>
      </section>

      <section>
        <h3 className="lab">{t('site.institutions')}</h3>
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
      </section>

      <section>
        <h3 className="lab">{t('site.plans')}</h3>
        <div className="demands">
          {UPPER_PLANS.map((u) => (
            <div key={u.name.ko}>
              <div className="dm-h">
                <span className="dm-n">{tx(u.name)}</span>
                <span className="dm-p num">{u.period}</span>
              </div>
              <div className="dm-d">{tx(u.demand)}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="lab">{t('site.trend')}</h3>
        <div className="demands">
          {TREND_DIRECTION.map((d) => (
            <div key={d.k.ko}>
              <div className="dm-h">
                <span className="dm-n">{tx(d.k)}</span>
                <span className="dm-p num">{tx(d.v)}</span>
              </div>
              <div className="dm-d">{tx(d.demand)}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )

  return (
    <AppFrame
      stage="site"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      next={{ label: t('step.region'), onClick: onNext }}
    >
      <SiteMap site={site} />
    </AppFrame>
  )
}
