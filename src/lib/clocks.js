/**
 * 두 시계 — 건물이 낡는 속도와 동네가 변하는 속도.
 *
 * 05 의 곡선은 2015~2026 실측 승하차로 시작했다. 그 구간에 코로나 급락이
 * 그대로 들어 있어 「건물의 가치가 2021년에 63까지 떨어졌다」로 읽혔다.
 * 그건 건물이 아니라 전염병이 만든 골이다. 실측이지만 이 화면이 말하려는 것과
 * 다른 것을 말한다. 그래서 곡선에서 뺐다.
 *
 * 남는 이야기는 이것이다 — 건물의 값은 손대지 않으면 계속 내려간다.
 * 언제 손댈지를 정하는 시계가 둘 있고, 그 둘이 겹치는 해가 최적이다.
 *
 *   물리 시계   건물이 낡는 속도. 내장 5~7년 · 설비 15년 · 구조 50년
 *               Duffy 의 층별 수명 (Askar 2021 p.17)
 *   수요 시계   동네가 변하는 속도. 이 건물은 3~4년마다 용도를 갈아 끼웠다
 *               2018 → 2022 → 2025 에서 관측
 *
 * 둘이 어긋나면 공사를 두 번 한다. 용도 바꾸려고 한 번 뜯고, 몇 년 뒤
 * 설비 때문에 또 뜯는다. 겹치는 해에 한 번에 하면 그 두 번이 한 번이 된다.
 *
 * 기준일이 확실한 것과 아닌 것을 구분해 둔다. 구조는 준공일(1989)부터라
 * 확실하고, 내장은 마지막으로 손댄 2025년부터다. 설비는 마지막 교체일을
 * 확인하지 못해 준공 기준으로 두었다 — 그 사실을 화면에 적는다.
 */

import { BUILT, PAST } from '../data/timeline'

const K = (ko, it) => ({ ko, it })

export const HORIZON = 2042
export const NOW = 2026

/** 마지막으로 손댄 해 — 준공은 개입이 아니다 */
const LAST = PAST.filter((p) => p.kind === 'work').at(-1).year

/**
 * 물리 시계 — 층마다 수명이 다르다.
 * from 이 기준일, life 가 수명(년). sure 는 기준일을 확인했는가.
 */
export const PHYSICAL = [
  {
    id: 'fit', from: LAST, life: [5, 7], sure: true,
    label: K('내장', 'Finiture'),
    cycle: K('5~7년', '5–7 anni'),
    base: K(`${LAST}년 노인회관 입주부터`, `Dal ${LAST}, ingresso del centro anziani`),
  },
  {
    id: 'svc', from: BUILT, life: [15, 15], sure: false,
    label: K('설비', 'Impianti'),
    cycle: K('15년', '15 anni'),
    base: K(`마지막 교체일 미확인 — 준공(${BUILT})부터 센다`,
      `Data dell’ultima sostituzione non verificata: si conta dall’agibilità (${BUILT})`),
  },
  {
    id: 'str', from: BUILT, life: [50, 50], sure: true,
    label: K('구조', 'Struttura'),
    cycle: K('50년', '50 anni'),
    base: K(`준공 ${BUILT}년부터`, `Dall’agibilità del ${BUILT}`),
  },
]

/** 수요 시계 — 이 건물이 실제로 손댄 간격 */
export const DEMAND = {
  from: LAST,
  gap: [3, 4],
  label: K('용도 재판정', 'Riesame della destinazione'),
  cycle: K('3~4년', '3–4 anni'),
  base: K('2018 → 2022 → 2025 에서 관측 · 두 번뿐',
    'Osservato su 2018 → 2022 → 2025: solo due intervalli'),
}

/**
 * 기준일에 수명을 거듭 더해 앞으로의 구간을 뽑는다.
 *
 * 회차를 거듭할수록 폭이 벌어진다 — 내장 5~7년은 3회차에 이미 15~21년이 되어
 * 구간이 6년 폭이다. 그쯤이면 「언제」를 말하는 것이 아니므로 세 회차에서 끊는다.
 * 이미 지나간 구간도 뺀다.
 */
const spans = (from, [lo, hi], max) => {
  const out = []
  for (let a = from + lo, b = from + hi; a <= HORIZON && out.length < max; a += lo, b += hi) {
    if (b >= NOW) out.push({ a, b })
  }
  return out
}

/** 물리는 세 회차면 지평선에 닿는다. 수요는 주기가 짧아 네 회차까지 간다. */
export const PHYS_SPANS = PHYSICAL.map((p) => ({ ...p, spans: spans(p.from, p.life, 3) }))
export const DEMAND_SPANS = spans(DEMAND.from, DEMAND.gap, 4)

const overlaps = (x, y) => x.a <= y.b && y.a <= x.b

/**
 * 겹치는 자리 — 물리 구간과 수요 구간이 만나는 곳.
 * 여기서 한 번에 하면 공사가 두 번이 아니라 한 번이 된다.
 *
 * 층마다 「처음 만나는 자리」 하나만 남긴다. 내장은 주기가 짧아 뒤로 갈수록
 * 수요 구간과 계속 겹치는데, 그걸 다 찍으면 별이 열 개가 되어 아무 데나
 * 손대도 된다는 말이 된다. 우리가 말하려는 것은 「여기」다.
 */
export const MEET_YEARS = PHYS_SPANS
  .map((p) => {
    for (const ps of p.spans) {
      const ds = DEMAND_SPANS.find((d) => overlaps(ps, d))
      if (ds) {
        return {
          id: p.id, layer: p.id, label: p.label, sure: p.sure,
          a: Math.max(ps.a, ds.a), b: Math.min(ps.b, ds.b),
          phys: ps, dem: ds,
        }
      }
    }
    return null
  })
  .filter(Boolean)
  .sort((x, y) => x.a - y.a)

export const span = (s) => (s.a === s.b ? `${s.a}` : `${s.a}–${String(s.b).slice(2)}`)

/** 가장 큰 결정이 걸리는 자리 — 구조 수명이 닿는 해 */
export const BIG = MEET_YEARS.find((m) => m.layer === 'str') || MEET_YEARS.at(-1)

/** 물리와 만나지 않는 수요 구간 — 재기만 하고 손대지는 않는 해 */
export const MEASURE_ONLY = DEMAND_SPANS.filter(
  (d) => !MEET_YEARS.some((m) => overlaps(m.dem, d)),
)

/** 생애주기 시나리오가 쓰는 공사 시점 — 겹치는 자리 그대로다 */
const LAYER = { fit: 'space', svc: 'services', str: 'structure' }

export const WORK_YEARS = MEET_YEARS.map((m) => ({
  year: m.a,
  layers: m.layer === 'str' ? ['structure', 'space'] : [LAYER[m.layer]],
}))

/**
 * 층별 잔존 수명 — 물리적 가치는 이렇게 말한다.
 *
 * 05 의 곡선은 정류장 승하차 지수인데 이름을 「값」이라고 붙였다. 그러면
 * 생애주기 비용의 물리 성능 곡선으로 읽히고, 실제 물리 성능은 그렇게
 * 출렁이지 않는다 — 그만큼 떨어지려면 화재가 나거나 무너져야 한다.
 *
 * 물리적 가치를 정직하게 적는 방법은 층마다 수명을 얼마나 썼는지를 그대로
 * 보이는 것이다. 선형이고, 계수가 없고, 지어낼 자리가 없다.
 *
 *   구조  1989 + 50년   37년 썼다 · 13년 남았다 → 2039
 *   설비  2019 + 15년    7년 썼다 ·  8년 남았다 → 2034
 *   내장  2025 +  6년    1년 썼다 ·  5년 남았다 → 2031
 *
 * 남은 햇수가 곧 겹침의 자리다. 두 시계 그림과 같은 값에서 나온다.
 */
export const LIFE_LEFT = PHYSICAL.map((p) => {
  const life = (p.life[0] + p.life[1]) / 2
  /** 주기가 되풀이되는 층은 마지막 교체가 언제였는지부터 되짚는다 */
  const cycles = Math.floor((NOW - p.from) / life)
  const last = p.from + cycles * life
  const used = NOW - last
  return {
    id: p.id,
    label: p.label,
    base: p.base,
    sure: p.sure,
    life,
    last,
    used,
    left: Math.max(life - used, 0),
    pct: Math.min(used / life, 1),
    due: last + life,
  }
}).sort((a, b) => a.due - b.due)
