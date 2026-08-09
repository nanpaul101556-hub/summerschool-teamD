/**
 * 03 머리 — 왜 이 근거가 필요한가, 그리고 어떻게 재는가.
 *
 * 카드 다섯을 먼저 보여 주면 「그래서 이게 왜 필요한데」가 남는다.
 * 그 물음에 먼저 답하고 카드로 내려간다.
 *
 *   ① 문제  용도는 수십 년 가는데 동네는 계속 변한다
 *   ② 공백  그런데 아무도 다시 묻지 않는다
 *   ③ 방법  만족은 직접 못 재니 세 층위로 나눠 묻는다
 *   ④ 자    다섯 갈래에 같은 자를 댄다
 *
 * 갈래별 상세는 카드가 맡는다 — 여기서는 흐름만 말한다.
 */

import { CHAIN, FRAME } from '../data/method'
import { useLang } from '../i18n'

export default function MethodMap() {
  const { t, tx } = useLang()

  return (
    <section className="mf">
      <header>
        <h3>{t('mf.title')}</h3>
        <p>{t('mf.sub')}</p>
      </header>

      {/* ── 왜 필요한가 ─────────────────────────── */}
      <ol className="mf-c">
        {CHAIN.map((c, i) => (
          <li key={c.id} className={c.id}>
            <span className="n num">{String(i + 1).padStart(2, '0')}</span>
            <b>{tx(c.head)}</b>
            <span className="d">{tx(c.body)}</span>
          </li>
        ))}
      </ol>

      {/* ── 어떻게 재는가 ───────────────────────── */}
      <div className="mf-f">
        <h4>{tx(FRAME.head)}</h4>
        <ol className="mf-s">
          {FRAME.steps.map((s, i) => (
            <li key={tx(s)}>
              <span className="n num">{i + 1}</span>
              <span>{tx(s)}</span>
            </li>
          ))}
        </ol>
        <p>{tx(FRAME.close)}</p>
      </div>
    </section>
  )
}
