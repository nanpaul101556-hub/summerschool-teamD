/**
 * 03 · 대안 산출 — 앞의 자료가 여기서 선택지가 된다.
 *
 * 각 안은 시간에 따른 궤적이고, 갈리는 지점은 자료가 끊기는 곳부터다.
 * 규모 제약이 실제로 안을 걸러내므로, 통과와 미달을 같이 보여준다.
 */

import { DECLINE_RANK, POPULATION } from '../data/population'
import { SITE } from '../data/site'
import { areaLadder, buildOptions, recommend } from '../lib/options'
import { interpolate } from '../lib/timeline'
import AppFrame from './AppFrame'

export default function OptionsView({ site, picked, onPick, onStep, onReset, onNext }) {
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
        <h2>자료가 가리키는 방향</h2>
        <p>앞 구간은 인구추계가 정하고, 갈리는 것은 자료가 끊기는 지점부터입니다</p>
      </div>

      <section>
        <ol className="because">
          {rec.because.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="lab">규모가 선택지를 정한다</h3>
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
          계획 <b>{SITE.plannedArea} m²</b> 로 성립하는 안은{' '}
          <b>{rec.viableKeys.length}개</b>입니다. 스팬이 커질수록 전환에 필요한
          최소 면적이 계단식으로 올라갑니다.
        </p>
      </section>

      {sel && (
        <section>
          <h3 className="lab">선택 · {sel.key}안</h3>
          <div className="kv">
            <div><span className="k">건물이 직접</span><span className="v">{sel.absorbs}개 용도</span></div>
            <div><span className="k">스팬</span><span className="v num">{sel.spec.span.toFixed(1)} m</span></div>
            <div><span className="k">하중</span><span className="v num">{sel.spec.load} kg/m²</span></div>
            <div><span className="k">층고</span><span className="v num">{sel.spec.height.toFixed(1)} m</span></div>
            <div><span className="k">필요 연면적</span><span className="v num">{sel.required.toLocaleString()} m²</span></div>
          </div>
          <p className={`note ${sel.ok ? '' : 'warn'}`}>
            {sel.ok
              ? `계획 ${SITE.plannedArea} m² 로 성립합니다.`
              : `계획 ${SITE.plannedArea} m² 로는 ${sel.shortfall.toLocaleString()} m² 모자랍니다. 이 안을 실행하려면 규모를 키워야 합니다.`}
          </p>
          <p className="premise">
            <span>전제</span>
            {sel.premise}
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
        label: picked ? `${picked}안으로 모델링` : '대안을 고르십시오',
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
                <span className="opt-l">{o.label}</span>
                {rec.key === o.key && <span className="opt-r">자료 권장</span>}
              </div>

              <p className="opt-s">{o.strategy}</p>

              {/* 궤적 — 건물이 받는 것과 넘기는 것을 구분한다 */}
              <div className="track">
                {o.track.map((s, i) => (
                  <div key={i} className={`tr ${s.mode} ${s.bet ? 'bet' : ''}`}>
                    <span className="tr-y num">{s.year}</span>
                    <span className="tr-u">{s.label}</span>
                    <span className="tr-m">
                      {s.mode === 'own' ? '건물' : '연계'}
                      {s.bet && <em>베팅</em>}
                    </span>
                  </div>
                ))}
              </div>

              <div className="opt-req">
                <span>필요 연면적</span>
                <b className="num">{o.required.toLocaleString()} m²</b>
                <span className={`opt-v ${o.ok ? 'ok' : ''}`}>
                  {o.ok ? '성립' : `−${o.shortfall.toLocaleString()} m²`}
                </span>
              </div>

              <dl className="opt-why">
                <dt>이점</dt><dd>{o.benefit}</dd>
                <dt>위험</dt><dd>{o.risk}</dd>
                <dt>전제</dt><dd className="pm">{o.premise}</dd>
              </dl>
            </button>
          )
        })}
      </div>

      <p className="note">
        2031·2036 은 공표된 인구추계가 정하므로 세 안이 같습니다. 2046 은 예측할 수
        없어 각 안이 서로 다른 베팅을 합니다. 전제를 적어 둔 것은 그 전제를 공격할 수
        있게 하기 위해서입니다 — 검증되지 않는 안은 대안이 아닙니다.
      </p>
    </AppFrame>
  )
}
