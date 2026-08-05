/** 전체 셸 — 헤더 · 단계 레일 · 푸터 */

import { SITE } from '../../data/site'

const STEPS = [
  { no: '01', name: '제도', sub: '무엇이 허용되는가' },
  { no: '02', name: '지역', sub: '무엇이 필요한가' },
  { no: '03', name: '시간', sub: '언제 바뀌는가' },
  { no: '04', name: '설계', sub: '어떻게 적응하는가' },
]

export default function AppShell({ step, onStep, children }) {
  return (
    <div className="shell">
      <header className="hdr">
        <div>
          <div className="eyebrow">적응형 건축 사전판정 플랫폼 · Team D</div>
          <h1>{SITE.name}</h1>
          <div className="addr">{SITE.address} · 대지 {SITE.landArea.toLocaleString()} m² · {SITE.parkType}</div>
        </div>
      </header>

      <nav className="rail" aria-label="워크플로우 단계">
        {STEPS.map((s, i) => (
          <button key={s.no} type="button" className={step === i + 1 ? 'on' : ''}
            onClick={() => onStep(i + 1)} aria-current={step === i + 1 ? 'step' : undefined}>
            <div className="no">{s.no}</div>
            <div className="nm">{s.name}</div>
            <div className="sb">{s.sub}</div>
          </button>
        ))}
      </nav>

      {children}

      <footer className="ftr">
        2026 KR–IT GSC Summer School · Team D · 개발용 프로토타입<br />
        모든 수치에 출처를 표기합니다. ⚠ 표시는 근거 미확보 추정치입니다.<br />
        노원구 통계연보(2024) · 서울시 장래인구추계 · 김지연·김영민(2024) 한국도시설계학회지 25(2)
      </footer>
    </div>
  )
}
