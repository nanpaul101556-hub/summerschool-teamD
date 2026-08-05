/**
 * 03 · 대안 산출 — 앞의 자료가 여기서 선택지가 된다.
 * 고른 대안이 그대로 모델링 입력이 되므로, 고르지 않으면 다음이 없다.
 */

import { DECLINE_RANK, POPULATION } from '../data/population'
import { SITE } from '../data/site'
import { buildOptions, recommend } from '../lib/options'
import { interpolate } from '../lib/timeline'
import AppFrame from './AppFrame'

export default function OptionsView({ site, picked, onPick, onStep, onReset, onNext }) {
  const options = buildOptions(SITE.plannedArea)
  const now = interpolate(POPULATION, 2026)
  const late = interpolate(POPULATION, 2042)

  const rec = recommend(options, {
    elderNow: now.elder,
    elderLate: late.elder,
    declineRank: DECLINE_RANK.rank,
  })

  const sel = options.find((o) => o.key === picked)

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 03</div>
        <h2>자료가 가리키는 방향</h2>
        <p>몇 개의 미래를 받아낼 것인가 — 그것이 대안을 가르는 축입니다</p>
      </div>

      <section>
        <ol className="because">
          {rec.because.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ol>
        <p className="note">권장 · 대안 {rec.key}</p>
      </section>

      {sel && (
        <section>
          <h3 className="lab">선택 · 대안 {sel.key}</h3>
          <div className="kv">
            <div><span className="k">용도</span><span className="v">{sel.absorbs}개</span></div>
            <div><span className="k">스팬</span><span className="v num">{sel.spec.span.toFixed(1)} m</span></div>
            <div><span className="k">하중</span><span className="v num">{sel.spec.load} kg/m²</span></div>
            <div><span className="k">층고</span><span className="v num">{sel.spec.height.toFixed(1)} m</span></div>
            <div><span className="k">전력</span><span className="v num">{sel.spec.power} %</span></div>
            <div>
              <span className="k">전환 최소면적</span>
              <span className="v num">{sel.minArea.toLocaleString()} m²</span>
            </div>
          </div>
          <p className={`note ${sel.verdict.ok ? '' : 'warn'}`}>{sel.verdict.msg}</p>
        </section>
      )}

      <section>
        <p className="note" style={{ marginTop: 0 }}>
          전환 최소면적은 스팬 한 베이의 2×2 — 무주공간을 만들 수 있는 최소 단위입니다.
          현재 계획 연면적 {SITE.plannedArea} m²는 세 대안 모두에 미달이라, 규모를
          키우지 않으면 어떤 대안도 실제로는 전환되지 않습니다.
        </p>
      </section>
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
        label: picked ? `대안 ${picked}로 모델링` : '대안을 고르십시오',
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
              className={`opt ${on ? 'on' : ''}`}
              onClick={() => onPick(o.key)}
              aria-pressed={on}
            >
              <div className="opt-h">
                <span className="opt-k num">{o.key}</span>
                <span className="opt-l">{o.label}</span>
                {rec.key === o.key && <span className="opt-r">권장</span>}
              </div>

              <div className="opt-u">{o.labels.join(' · ')}</div>
              <p className="opt-s">{o.stance}</p>

              <div className="opt-spec">
                {[
                  ['스팬', `${o.spec.span.toFixed(1)} m`],
                  ['하중', `${o.spec.load} kg/m²`],
                  ['층고', `${o.spec.height.toFixed(1)} m`],
                  ['전력', `${o.spec.power} %`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <b className="num">{v}</b>
                  </div>
                ))}
              </div>

              <div className="opt-f">
                <div>
                  <span>받아내는 미래</span>
                  <b className="num">{o.absorbs}개</b>
                </div>
                <div>
                  <span>전환 최소면적</span>
                  <b className="num">{o.minArea.toLocaleString()} m²</b>
                </div>
              </div>

              <p className={`opt-risk ${o.verdict.ok ? '' : 'bad'}`}>
                {o.verdict.ok
                  ? o.risk
                  : `${o.risk} · 계획 ${SITE.plannedArea} m²로는 전환 최소면적에 ${o.verdict.shortfall.toLocaleString()} m² 모자랍니다`}
              </p>
            </button>
          )
        })}
      </div>
    </AppFrame>
  )
}
