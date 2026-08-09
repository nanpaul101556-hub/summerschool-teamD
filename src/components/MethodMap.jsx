/**
 * 03 머리 — 왜 이 근거가 필요한가.
 *
 * 넷을 나란히 늘어놓았더니 문제와 해법이 같은 무게로 보여,
 * 「읽어야 이해되는 그림」이 됐다. 그림이 논리를 대신하지 못한 것이다.
 *
 * 문제 둘을 왼쪽에 묶고, 우리가 만든 것 하나를 오른쪽에 크게 놓는다.
 * 가운데 굵은 화살표 하나가 그 둘을 잇는다 — 대비가 설명을 대신한다.
 *
 * 자의 네 단계는 세로로 쌓지 않고 한 줄로 흘린다. 계산은 순서가 전부이므로
 * 왼쪽에서 오른쪽으로 읽히면 그것으로 설명이 끝난다.
 *
 * 그림 둘은 축이 다르다 — 왼쪽 DriftFigure 가 시간, 오른쪽 SignalMap 이 공간이다.
 * 「동네는 계속 변한다」와 「그래서 여기를 이렇게 잰다」가 나란히 놓인다.
 */

import { CHAIN, FRAME } from '../data/method'
import DriftFigure from './DriftFigure'
import SignalMap from './SignalMap'
import { useLang } from '../i18n'

export default function MethodMap() {
  const { t, tx } = useLang()

  const problems = CHAIN.filter((c) => c.id !== 'rule')
  const answer = CHAIN.find((c) => c.id === 'rule')

  return (
    <section className="mf">
      <header>
        <h3>{t('mf.title')}</h3>
      </header>

      {/* ── 문제 → 우리가 만든 것 ─────────────────── */}
      <div className="mf-x">
        <div className="mf-p">
          <span className="cap">{t('mf.problem')}</span>
          {problems.map((c) => (
            <div key={c.id} className="mf-i">
              <b>{tx(c.head)}</b>
              <span>{tx(c.body)}</span>
            </div>
          ))}
          <DriftFigure />
        </div>

        <div className="mf-ar" aria-hidden="true">
          <svg viewBox="0 0 40 16" preserveAspectRatio="none">
            <path d="M0,8 H30" />
            <path d="M24,3 L31,8 L24,13" />
          </svg>
        </div>

        <div className="mf-r">
          <div className="mf-a">
            <span className="cap">{t('mf.answer')}</span>
            <b>{tx(answer.head)}</b>
            <span className="d">{tx(answer.body)}</span>
          </div>
          <SignalMap />
        </div>
      </div>

      {/* ── 자의 네 단계 · 한 줄 ──────────────────── */}
      <div className="mf-f">
        <h4>{tx(FRAME.head)}</h4>
        <ol className="mf-s">
          {FRAME.steps.map((s, i) => (
            <li key={tx(s.t)} className={i === FRAME.steps.length - 1 ? 'last' : ''}>
              <b>{tx(s.t)}</b>
              <span>{tx(s.d)}</span>
            </li>
          ))}
        </ol>
        <p>{tx(FRAME.close)}</p>
      </div>
    </section>
  )
}
