/** 01 · 대상지 — 지도가 스테이지를 다 쓰고, 판정 결과는 패널에 붙는다. */

import { SITE } from '../data/site'
import { BUILT, PAST } from '../data/timeline'
import { SOURCE, capacity } from '../data/zoning'

import { useLang } from '../i18n'
import { m2 } from '../lib/format'
import AppFrame from './AppFrame'
import SiteMap from './SiteMap'

export default function SiteView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
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
        <h3 className="lab">{t('site.histTitle')}</h3>
        <ol className="hist">
          {PAST.map((p) => (
            <li key={p.year} className={p.kind}>
              <b className="num">{p.year}</b>
              <span className="l">{tx(p.label)}</span>
              <em className="num">{p.year - BUILT}{t('site.histYr')}</em>
            </li>
          ))}
        </ol>
        <p className="note">{t('site.histNote')}</p>
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
      next={{ label: t('step.plan'), onClick: onNext }}
    >
      <SiteMap site={site} />
    </AppFrame>
  )
}
