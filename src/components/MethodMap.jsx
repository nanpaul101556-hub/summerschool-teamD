/**
 * 03 머리 — 왜 이 근거가 필요한가.
 *
 * 문제 둘과 해법 하나를 상자로 세워 봤다. 대비는 생겼지만 화면이 설명서가 됐고,
 * 정작 볼 것 — 인구 곡선과 지도 — 이 아래로 밀렸다. 논지는 두 줄이면 끝난다.
 * 상자를 지우고 그 자리를 그림에 준다.
 *
 * 왼쪽은 무엇을 봤는가 — 시간(인구)과 공간(지도).
 * 오른쪽은 어떻게 재는가 — 정류장별 수치와 자의 네 단계.
 * 닫는 문장만 아래에 폭 전체로 남긴다. 양쪽을 다 받는 말이라 그 자리가 맞다.
 */

import { FRAME, LEAD } from '../data/method'
import DriftFigure from './DriftFigure'
import SignalMap, { SignalList } from './SignalMap'
import { useLang } from '../i18n'

export default function MethodMap() {
  const { t, tx } = useLang()

  return (
    <section className="mf">
      <header>
        <h3>{t('mf.title')}</h3>
        <p>{tx(LEAD)}</p>
      </header>

      <div className="mf-x">
        {/* 무엇을 봤는가 — 시간과 공간 */}
        <div className="mf-p">
          <DriftFigure />
          <SignalMap />
        </div>

        {/* 어떻게 재는가 */}
        <div className="mf-r">
          <SignalList />

          {/* 자의 네 단계 — 세로로 쌓아 순서를 못 오해하게 한다 */}
          <div className="mf-f">
            <h4>{tx(FRAME.head)}</h4>
            <ol className="mf-s">
              {FRAME.steps.map((s, i) => (
                <li key={tx(s.t)} className={i === FRAME.steps.length - 1 ? 'last' : ''}>
                  <i>{i + 1}</i>
                  <b>{tx(s.t)}</b>
                  <span>{tx(s.d)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <p className="mf-e">{tx(FRAME.close)}</p>
    </section>
  )
}
