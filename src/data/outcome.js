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
import { LAW, PAST, RHYTHM } from './timeline'

const K = (ko, it) => ({ ko, it })

const card = (id) => CARDS.find((c) => c.id === id)

/** 마지막으로 손댄 해 — 준공은 개입이 아니므로 뺀다 */
const LAST = PAST.filter((p) => p.kind === 'work').at(-1)

/**
 * 최근 개입 간격 — 2022 → 2025 의 3년. 법이 아니라 이 건물의 이력에서 나온다.
 *
 * 법정 점검 주기도 3년이라 값은 같지만 근거가 다르다. 건축물관리법 제13조③ 은
 * 「점검을 시작한 날을 기준으로」 3년이라 최초 점검일을 알아야 다음 해가 나오는데,
 * 그 날짜를 확인하지 못했다. 2025년은 점검이 아니라 노인회관 입주 공사다.
 * 그러므로 이 해는 「법정 점검이 오는 해」가 아니라 「이 건물이 손댈 때가 되는 해」다.
 */
const RECENT_GAP = RHYTHM.gaps.at(-1).to - RHYTHM.gaps.at(-1).from

export const NEXT_YEAR = LAST.year + RECENT_GAP

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
      id: 'gap', v: `${RECENT_GAP}년`,
      k: K('이 건물이 손댄 간격', 'Intervallo fra gli interventi'),
      d: K('2022 → 2025 · 법정 점검 주기도 같은 3년',
        '2022 → 2025 · anche il ciclo di legge è di tre anni'),
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

/** 한 줄 — 값이 어디서 왔는지, 그리고 무엇이 아직 미확인인지 */
export const OUT_SRC = K(
  `승하차·예산 OA-12913 · 서울재정포털 · 회복률 2019.07 = 100 · 인구 노원구 추계 · `
  + `간격 이 건물 개입 이력(2018·2022·2025)`,
  `Flussi e bilancio: OA-12913, portale finanziario · Ripresa: 07.2019 = 100 · `
  + `Demografia: proiezioni di Nowon · Intervallo: storia degli interventi (2018, 2022, 2025)`,
)

/**
 * 밝혀 둘 것 — 이 해는 법정 점검 일정이 아니다.
 * 화면에서 지우면 「법이 정한 해」로 읽히므로 결과 칸 아래에 그대로 둔다.
 */
export const OUT_CAVEAT = K(
  `${LAW.art} 은 「점검을 시작한 날을 기준으로」 3년마다로 정한다. `
  + '이 건물의 최초 점검일을 확인하지 못해 법정 점검이 오는 해는 특정하지 않는다 — '
  + `${NEXT_YEAR}년은 이 건물이 손대 온 간격에서 나온 해다.`,
  'La legge fissa il ciclo triennale a partire dalla data del primo controllo. '
  + 'Non avendo verificato quella data, non indichiamo l\'anno del controllo di legge: '
  + `il ${NEXT_YEAR} deriva dagli intervalli con cui questo edificio è stato modificato.`,
)
