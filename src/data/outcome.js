/**
 * 결과 — 문장이 아니라 수치로 끝낸다.
 *
 * 전에는 「지금은 잘 쓰이고 있다 — 다만 이 용도로 계속은 아니다」 아래에
 * 다섯 줄짜리 글을 늘어놓았다. 실제로 쓰는 도구라면 그 자리에 값이 있어야 한다.
 * 읽어야 알 수 있는 결론은 결론이 아니다.
 *
 * 세 칸으로 끝낸다 — 지금 · 언제 · 무엇으로.
 *
 *   지금      현 용도에 적합하다      +5.3%p  +143%  82.5▾
 *   2028년    적합성을 다시 잰다       3년 주기 · 마지막 개입 2025 · 고령 36.2%
 *   그다음    이 용도로 대응한다       +51%p  +35%p
 *
 * 값은 하나도 여기서 만들지 않는다. 전부 다른 파일에서 끌어온다.
 * 2028 도 우리가 고른 해가 아니라 마지막 개입(2025)에 법정 주기(3년)를 더한 것이다.
 */

import { CARDS } from './evidence'
import { PROGRAMS } from './plans'
import { POPULATION } from './population'
import { CONTROL, STOPS } from './stops'
import { LAW, PAST } from './timeline'

const K = (ko, it) => ({ ko, it })

const card = (id) => CARDS.find((c) => c.id === id)

/** 마지막으로 손댄 해 — 준공은 개입이 아니므로 뺀다 */
const LAST = PAST.filter((p) => p.kind === 'work').at(-1)

/** 우리가 고른 해가 아니다. 마지막 개입 + 법정 점검 주기다. */
export const NEXT_YEAR = LAST.year + LAW.cycle

const SITE = STOPS.find((s) => s.lead)
const AGED = POPULATION.find((p) => p.year === 2042)
const OPEN = PROGRAMS.filter((p) => p.state === 'open')

/** ① 지금 — 현 용도에 맞는가 */
export const NOW = {
  head: K('현 용도에 적합하다', 'Idoneo alla destinazione attuale'),
  rows: [
    {
      id: 'bus', dir: 'up', v: card('bus').brief.v,
      k: K('승하차', 'Flussi'),
      d: K('노원구 대조군 대비 초과', 'Oltre il controllo distrettuale'),
    },
    {
      id: 'budget', dir: 'up', v: card('budget').brief.v,
      k: K('예산', 'Bilancio'),
      d: K('2022년 1.5억 → 2025년 3.6억', 'Da 0,15 a 0,36 mld, 2022 → 2025'),
    },
    {
      id: 'recover', dir: 'down', v: SITE.idx.toFixed(1),
      k: K('회복률', 'Ripresa'),
      d: K(`노원구 평균 ${CONTROL.idx.toFixed(1)} 아래`,
        `Sotto la media di Nowon, ${CONTROL.idx.toFixed(1)}`),
    },
  ],
}

/** ② 언제 — 우리가 정하지 않는다 */
export const WHEN = {
  v: `${NEXT_YEAR}`,
  head: K('적합성을 다시 잰다', 'Si rimisura l’idoneità'),
  rows: [
    {
      id: 'law', v: `${LAW.cycle}년`,
      k: K('법정 점검 주기', 'Ciclo di legge'),
      d: LAW.art,
    },
    {
      id: 'last', v: `${LAST.year}`,
      k: K('마지막 개입', 'Ultimo intervento'),
      d: LAST.label,
    },
    {
      id: 'aged', v: `${AGED.elder}%`,
      k: K(`${AGED.year}년 고령 비율`, `Over 65 nel ${AGED.year}`),
      d: K('2024년 20.4%에서', 'Dal 20,4% del 2024'),
    },
  ],
}

/** ③ 무엇으로 — 걸어서 닿는 거리에 없는 것만 남는다 */
export const INTO = {
  head: K('이 용도로 대응한다', 'Si risponde con queste destinazioni'),
  rows: OPEN.map((p) => ({
    id: p.id, v: p.v, k: p.label,
    d: K('인근 같은 용도 시설의 실측 증감', 'Variazione misurata in strutture analoghe vicine'),
  })),
}

/** 한 줄 — 값이 어디서 왔는지만 밝힌다 */
export const OUT_SRC = K(
  `승하차·예산 OA-12913 · 서울재정포털 · 회복률 2019.07 = 100 · 인구 노원구 추계 · 주기 ${LAW.art}`,
  `Flussi e bilancio: OA-12913, portale finanziario · Ripresa: 07.2019 = 100 · `
  + `Demografia: proiezioni di Nowon · Ciclo: legge sulla gestione degli edifici`,
)
