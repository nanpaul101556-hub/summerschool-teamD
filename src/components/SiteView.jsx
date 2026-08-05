/**
 * 대상지 화면 — 지도를 크게 두고 그 주위에 정보를 배치한다.
 * 지도는 아직 연결 전이므로 자리만 잡아 둔다.
 */

import { PHASES, USES } from '../data/requirements'
import { SITE, UPPER_PLANS } from '../data/site'
import { computeLimits, eligibleIncentives } from '../lib/constraint'
import { m2, orMissing } from '../lib/format'
import Arrow from './Arrow'

export default function SiteView({ onBack, onNext }) {
  const limits = computeLimits(SITE)
  const incentives = eligibleIncentives(SITE)

  const specs = [
    { k: '대지면적', v: `${SITE.landArea.toLocaleString()} m²` },
    { k: '용도지역', v: orMissing(SITE.zoning) },
    { k: '건폐율', v: orMissing(SITE.bcr, '%') },
    { k: '용적률', v: orMissing(SITE.far, '%') },
    { k: '최대 연면적', v: limits.totalArea ? m2(limits.totalArea) : orMissing(null) },
  ]

  return (
    <div className="page">
      <header className="head">
        <div>
          <h1>{SITE.name}</h1>
          <div className="addr">{SITE.address}</div>
        </div>
        <button type="button" className="back" onClick={onBack}>
          대상지 변경
        </button>
      </header>

      <div className="work">
        {/* ── 지도 ── */}
        <section>
          <div className="mapslot">
            <div>
              <div className="t">지도 연결 예정</div>
              <div className="s">
                {SITE.coords[0]}, {SITE.coords[1]}
              </div>
            </div>
          </div>
          <div className="mapmeta">
            <span>{SITE.parkType}</span>
            <span className="num">준공 {SITE.builtYear}</span>
          </div>
        </section>

        {/* ── 오른쪽 정보 레일 ── */}
        <div className="rail">
          <section>
            <h2 className="lab">제원</h2>
            <div className="kv">
              {specs.map((s) => (
                <div key={s.k}>
                  <span className="k">{s.k}</span>
                  <span className={`v num ${s.v === '미확보' ? 'none' : ''}`}>{s.v}</span>
                </div>
              ))}
            </div>
            <p className="note">
              용도지역·건폐율·용적률 미확보. 이 셋이 들어오면 최대 연면적이 자동 산정됩니다.
            </p>
          </section>

          <section>
            <h2 className="lab">적용 제도</h2>
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
        </div>
      </div>

      {/* ── 아래 정보 띠 ── */}
      <div className="strip">
        <section>
          <h2 className="lab">시기별 용도 경로</h2>
          <div className="path">
            {PHASES.map((p) => {
              const use = USES.find((u) => u.key === p.use)
              return (
                <div key={p.year}>
                  <span className="y num">{p.year}</span>
                  <div>
                    <div className="u">
                      {use?.label}
                      {p.certainty === 'scenario' && <span className="tag">시나리오</span>}
                    </div>
                    <div className="b">{p.basis}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="lab">상위계획</h2>
          <div className="rows">
            {UPPER_PLANS.map((p) => (
              <div key={p.name}>
                <span className="n">{p.name}</span>
                <span className="m num">{p.period}</span>
              </div>
            ))}
          </div>
          <p className="note">
            인구추계는 공표 자료라 단언하고, 산업 변화는 조건부 시나리오로만 적습니다.
          </p>
        </section>
      </div>

      <div className="foot">
        <span className="no">02</span>
        <span className="next">
          <span className="cap">모델 생성</span>
          <button type="button" className="go" onClick={onNext} aria-label="다음 단계">
            <Arrow />
          </button>
        </span>
      </div>
    </div>
  )
}
