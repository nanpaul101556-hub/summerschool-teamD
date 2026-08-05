/**
 * 02 · 지역 정보 — 누가 살고 무엇을 하는가.
 *
 * 확보한 자료는 스테이지에, 아직 없는 자료는 패널에 놓는다.
 * 빈칸을 감추면 대안이 어디까지 근거를 가진 것인지 알 수 없게 된다.
 */

import { AXES, EXCLUDED, STATUS, tally } from '../data/datasets'
import { OBSERVED } from '../data/facilities'
import { DECLINE_RANK, POPULATION, VULNERABLE } from '../data/population'
import { n } from '../lib/format'
import { interpolate } from '../lib/timeline'
import AppFrame from './AppFrame'
import PopCurve from './PopCurve'
import Skel from './Skel'

const t = tally()

export default function RegionView({ site, onStep, onReset, onNext }) {
  const now = interpolate(POPULATION, 2026)
  const late = interpolate(POPULATION, 2042)

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 02</div>
        <h2>자료 확보 현황</h2>
        <p>지역 축 {t.total}개 항목 · 대안은 확보한 것만으로 산출됩니다</p>
      </div>

      <section>
        <div className="tal-bar">
          <span className="have" style={{ flex: t.have }} />
          <span className="partial" style={{ flex: t.partial }} />
          <span className="none" style={{ flex: t.none }} />
        </div>
        <div className="tal-l">
          <span><b className="num">{t.have}</b> 확보</span>
          <span><b className="num">{t.partial}</b> 부분</span>
          <span><b className="num">{t.none}</b> 미연결</span>
        </div>
      </section>

      {AXES.map((ax) => (
        <section key={ax.key}>
          <div className="ax-h">
            <span className="ax-no num">{ax.no}</span>
            <span className="ax-l">{ax.label}</span>
          </div>
          <div className="ax-q">{ax.q}</div>
          {ax.lead && <div className="ax-lead">{ax.lead}</div>}

          <div className="slots">
            {ax.items.map((it) => (
              <div key={it.code} className={`slot ${it.status}`}>
                <div className="sl-h">
                  <span className="sl-n">{it.name}</span>
                  {it.rank && <span className="sl-r num">{it.rank}순위</span>}
                  <span className={`sl-s ${STATUS[it.status].tone}`}>
                    {STATUS[it.status].label}
                  </span>
                </div>
                <div className="sl-src">
                  {it.src}
                  {it.api && <em>API</em>}
                </div>
                {it.impact && <div className="sl-i">{it.impact}</div>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h3 className="lab">일부러 쓰지 않는 자료</h3>
        <div className="rows">
          {EXCLUDED.map((e) => (
            <div key={e.name}>
              <span className="n">
                {e.name}
                <br />
                <span className="sub">{e.why}</span>
              </span>
              <span className="m">제외</span>
            </div>
          ))}
        </div>
        <p className="note">
          목록에서 빠진 것과 빼기로 결정한 것은 다릅니다.
        </p>
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
      next={{ label: '대안 산출', onClick: onNext }}
    >
      <div className="region">
        <section className="rg-wide">
          <div className="rg-h">
            <h3 className="lab">인구 연령 구성</h3>
            <span className="rg-tag">확보</span>
          </div>
          <PopCurve />
          <p className="note">
            16년 사이 65세 이상이 <b>{now.elder}% → {late.elder}%</b>로 올라갑니다.
            인구 감소는 서울 <b>{DECLINE_RANK.total}개 자치구 중 {DECLINE_RANK.rank}위</b>이고,
            2042년에는 고령인구가 유소년의 약 <b>5배</b>가 됩니다.
          </p>
        </section>

        <section>
          <div className="rg-h">
            <h3 className="lab">취약 계층</h3>
            <span className="rg-tag">확보</span>
          </div>
          <div className="acts">
            {VULNERABLE.map((v) => (
              <div key={v.key}>
                <span className="ac-n">
                  {v.label}
                  <em>{v.note}</em>
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
            <h3 className="lab">공원에서 일어나는 일</h3>
            <span className="rg-tag">확보</span>
          </div>
          <div className="acts">
            {OBSERVED.topActs.map((a) => (
              <div key={a.act}>
                <span className="ac-n">{a.act}</span>
                <span className="ac-b">
                  <span style={{ width: `${(a.n / OBSERVED.topActs[0].n) * 100}%` }} />
                </span>
                <span className="ac-v num">{a.n}</span>
              </div>
            ))}
          </div>
          <p className="note">
            관찰 {OBSERVED.total}명 · <b>노인 이용자</b> 관찰치라 전체 규모는 알 수 없습니다.
          </p>
        </section>

        <section>
          <div className="rg-h">
            <h3 className="lab">시간대별 이용</h3>
            <span className="rg-tag">확보</span>
          </div>
          <div className="acts">
            {OBSERVED.byTime.map((s) => {
              const v = s.male + s.female
              const max = Math.max(...OBSERVED.byTime.map((x) => x.male + x.female))
              return (
                <div key={s.slot}>
                  <span className="ac-n">{s.slot}</span>
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
              <h3 className="lab">{ax.label}</h3>
              <span className="rg-tag off">미연결</span>
            </div>
            <Skel kind={ax.viz} />
            <div className="gh-q">{ax.q}</div>
            <div className="gh-list">
              {ax.items
                .filter((i) => i.status !== 'have')
                .map((i) => (
                  <span key={i.code}>
                    {i.name}
                    {i.rank && <em className="num">{i.rank}순위</em>}
                  </span>
                ))}
            </div>
          </section>
        ))}
      </div>
    </AppFrame>
  )
}
