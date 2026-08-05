/** 01 · 대상지 — 지도가 스테이지를 다 쓰고, 판정 결과는 패널에 붙는다. */

import { SITE, TREND_DIRECTION, UPPER_PLANS } from '../data/site'
import { computeLimits, eligibleIncentives } from '../lib/constraint'
import { m2, orMissing } from '../lib/format'
import AppFrame from './AppFrame'
import SiteMap from './SiteMap'

export default function SiteView({ site, onStep, onReset, onNext }) {
  const limits = computeLimits(SITE)
  const incentives = eligibleIncentives(SITE)
  const p = site.parcel

  // 지적은 검색한 필지에서, 나머지는 정리된 자료에서 온다
  const specs = [
    { k: '지번', v: p?.jibun ?? orMissing(null) },
    {
      k: '필지면적',
      v: p?.areaM2 ? `${p.areaM2.toLocaleString()} m²` : orMissing(null),
      note: '경계 산출',
    },
    {
      k: '공시지가',
      v: p?.jiga ? `${p.jiga.toLocaleString()} 원/m²` : orMissing(null),
      note: p?.gosi,
    },
    { k: '용도지역', v: orMissing(site.curated ? SITE.zoning : null) },
    { k: '건폐율', v: orMissing(site.curated ? SITE.bcr : null, '%') },
    { k: '용적률', v: orMissing(site.curated ? SITE.far : null, '%') },
    {
      k: '최대 연면적',
      v: site.curated && limits.totalArea ? m2(limits.totalArea) : orMissing(null),
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
        <h3 className="lab">제원</h3>
        <div className="kv">
          {specs.map((s) => (
            <div key={s.k}>
              <span className="k">
                {s.k}
                {s.note && s.v !== '미확보' && <em className="kn">{s.note}</em>}
              </span>
              <span className={`v num ${s.v === '미확보' ? 'none' : ''}`}>{s.v}</span>
            </div>
          ))}
        </div>
        <p className="note">
          {site.curated
            ? '지번·면적·지가는 연속지적도에서 실시간으로 가져옵니다.'
            : '이 대상지는 지적 정보만 조회했습니다. 인구·상위계획·제도 판정은 자료가 정리된 대상지에서만 제공됩니다.'}
        </p>
      </section>

      <section>
        <h3 className="lab">적용 제도</h3>
        <div className="rows">
          {incentives.map((inc) => (
            <div key={inc.key}>
              <span className="n">
                {inc.label}
                <br />
                <span className="sub">{inc.detail}</span>
              </span>
              <span className="m">{inc.active ? '해당' : '비대상'}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="lab">중장기계획이 요구하는 것</h3>
        <div className="demands">
          {UPPER_PLANS.map((u) => (
            <div key={u.name}>
              <div className="dm-h">
                <span className="dm-n">{u.name}</span>
                <span className="dm-p num">{u.period}</span>
              </div>
              <div className="dm-d">{u.demand}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="lab">트렌드가 가리키는 방향</h3>
        <div className="demands">
          {TREND_DIRECTION.map((t) => (
            <div key={t.k}>
              <div className="dm-h">
                <span className="dm-n">{t.k}</span>
                <span className="dm-p num">{t.v}</span>
              </div>
              <div className="dm-d">{t.demand}</div>
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
      next={{ label: '지역 정보', onClick: onNext }}
    >
      <SiteMap site={site} />
    </AppFrame>
  )
}
