/**
 * 앱 셸 — 상단 스텝바 · 좌측 스테이지 · 우측 패널.
 *
 * 화면을 꽉 채운다. 단계 이동은 상단 스텝바가 맡으므로 각 화면은
 * 내용만 신경 쓰면 된다.
 */

import Arrow from './Arrow'

export const STEPS = [
  { key: 'site', no: '01', label: '대상지' },
  { key: 'region', no: '02', label: '지역 정보' },
  { key: 'options', no: '03', label: '대안 산출' },
  { key: 'rhino', no: '04', label: '모델링' },
  { key: 'future', no: '05', label: '시간 변화' },
]

export default function AppFrame({
  stage,
  site,
  onStep,
  onReset,
  side,
  children,
  scroll = false,
  next,
}) {
  const i = STEPS.findIndex((s) => s.key === stage)

  return (
    <div className="app">
      <header className="topbar">
        <div className="tb-brand">
          <b>적응형 건축 사전판정</b>
          <span>Team D</span>
        </div>

        <nav className="steps" aria-label="단계">
          {STEPS.map((s, k) => (
            <button
              key={s.key}
              type="button"
              className={`stp ${s.key === stage ? 'on' : ''}`}
              onClick={() => onStep(s.key)}
              aria-current={s.key === stage ? 'step' : undefined}
              // 앞 단계를 건너뛰면 근거 없이 결론으로 가게 된다
              disabled={k > i + 1}
            >
              <span className="stp-n num">{s.no}</span>
              <span className="stp-l">{s.label}</span>
            </button>
          ))}
        </nav>

        {site && (
          <div className="tb-site">
            <span className="nm">{site.name}</span>
            <button type="button" onClick={onReset}>
              대상지 변경
            </button>
          </div>
        )}
      </header>

      <div className="body">
        <div className={`stage ${scroll ? 'scroll' : ''}`}>{children}</div>

        <aside className="side">
          {side}
          {next && (
            <button
              type="button"
              className="go-next"
              onClick={next.onClick}
              disabled={next.disabled}
            >
              <span>{next.label}</span>
              <Arrow />
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}
