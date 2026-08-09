/**
 * 05 — 물리적 가치는 층마다 얼마나 남았는가.
 *
 * 생애주기 화면의 곡선을 「값」이라고 불렀더니 물리 성능 곡선으로 읽혔다.
 * 물리 성능이 그렇게 출렁이려면 화재가 나거나 무너져야 한다. 그건 이 건물이
 * 아니라 사고 이야기다.
 *
 * 물리적 가치를 정직하게 적는 방법은 층마다 수명을 얼마나 썼는지를 그대로
 * 보이는 것이다. 선형이고, 계수가 없고, 지어낼 자리가 없다.
 *
 *   구조  1989 + 50년   37년 썼다 · 13년 남았다 → 2039
 *   설비  2019 + 15년    7년 썼다 ·  8년 남았다 → 2034
 *   내장  2025 +  6년    1년 썼다 ·  5년 남았다 → 2031
 *
 * 남은 햇수가 곧 손댈 자리다. 두 시계 그림과 같은 값에서 나온다.
 */

import { LIFE_LEFT, NOW } from '../lib/clocks'
import { useLang } from '../i18n'

export default function LifeLeft() {
  const { t, tx } = useLang()

  return (
    <section className="ll">
      <header>
        <h3>{t('ll.title')}</h3>
        <span>{t('ll.sub')}</span>
      </header>

      <ol>
        {LIFE_LEFT.map((l) => (
          <li key={l.id} className={l.sure ? '' : 'unsure'}>
            <span className="nm">
              <b>{tx(l.label)}</b>
              <em>{t('ll.of', { life: l.life, last: l.last })}</em>
            </span>

            <span className="bar" aria-hidden="true">
              <i style={{ width: `${Math.round(l.pct * 100)}%` }} />
            </span>

            <span className="left">
              <b className="num">{l.left}</b>
              <em>{t('ll.left')}</em>
            </span>

            <span className="due">
              <b className="num">{l.due}</b>
              <em>{t(`ll.due.${l.id}`)}</em>
            </span>
          </li>
        ))}
      </ol>

      <p className="ll-n">{t('ll.note', { now: NOW })}</p>
    </section>
  )
}
