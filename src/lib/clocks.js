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

/**
 * 구간을 시작 해 하나로 적는다.
 *
 * 2028–29 처럼 두 해를 다 적으면 읽는 사람이 「어느 해인가」를 다시 물어야 한다.
 * 폭은 막대 길이가 이미 보여 주므로 글자는 시작 해만 든다.
 * 폭이 왜 있는지는 곡선 아래 단서에 적어 둔다.
 */
export const span = (s) => `${s.a}`

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

/**
 * 잔존 수명 곡선 — 준공을 100 으로 두고 층마다 따로 그린다.
 *
 * 한 줄로 합치려면 층별 가치 비중을 우리가 정해야 하고, 그 순간 지어낸 값이
 * 하나 생긴다. 세 선을 그대로 두면 가중치가 필요 없다.
 *
 * 교체 주기는 전부 준공(1989)부터 센다. 설비 1989·2004·2019·2034,
 * 내장 1989 … 2019·2025·2031 — 내장의 2025 는 노인회관 입주와 맞아떨어진다.
 * 구조는 교체가 없으므로 준공부터 한 번 내려가기만 한다. 그래서 이 선이
 * 「가치는 준공 때가 가장 높다」를 그림 그대로 말한다.
 */
const CURVE_TO = 2045

/** 그 해의 잔존율 — 마지막 교체부터 수명까지 선형 */
export const residual = (id, y) => {
  const p = PHYSICAL.find((x) => x.id === id)
  const life = (p.life[0] + p.life[1]) / 2
  if (y < BUILT) return 1
  if (id === 'str') return Math.max(0, 1 - (y - BUILT) / life)
  return 1 - ((y - BUILT) % life) / life
}

/** 톱니를 각지게 그리려면 교체 직전·직후 두 점이 다 있어야 한다 */
const lineOf = (id) => {
  const p = PHYSICAL.find((x) => x.id === id)
  const life = (p.life[0] + p.life[1]) / 2
  const pts = []
  for (let y = BUILT; y <= CURVE_TO; y += 1) {
    if (id !== 'str' && y > BUILT && (y - BUILT) % life === 0) {
      pts.push({ y, v: 0 })          // 교체 직전 — 바닥
    }
    pts.push({ y, v: residual(id, y) })
  }
  return pts
}

export const LAYER_LINES = PHYSICAL.map((p) => ({
  id: p.id,
  label: p.label,
  cycle: p.cycle,
  pts: lineOf(p.id),
})).reverse()   // 구조를 먼저 그려 가는 선이 위로 오게 한다

/**
 * 회계상 내용연수 — 법인세법 시행규칙 별표5.
 * 철근콘크리트조 기준내용연수 40년 (내용연수범위 30~50년).
 * 회계로는 2029년에 다 상각되는데 물리로는 2039년까지 남는다.
 */
export const ACCOUNTING_LIFE = 40

export const ACCOUNTING = [
  { y: BUILT, v: 1 },
  { y: BUILT + ACCOUNTING_LIFE, v: 0 },
  { y: CURVE_TO, v: 0 },
]

/**
 * 합성 곡선 — 준공에서 내려오다가, 손대면 그만큼 되돌아간다.
 *
 * 층별 선 셋만 놓으면 「그래서 이 건물은 지금 어떤가」가 한 줄로 안 잡힌다.
 * 세 층을 하나로 합쳐 한 선으로 그린다.
 *
 * 무게는 셋을 같게 둔다. 층별 공사비 비중을 쓰는 것이 정석이지만 그 자료가
 * 없다 — 설비 94.2억은 옆 건물 실적이고 구조 180억은 신축에서 역산한 추정이라
 * 둘 다 이 건물 값이 아니다. 없는 자료를 대신할 숫자를 만드는 대신 같은 무게로
 * 두고 그 사실을 화면에 적는다. 무게가 바뀌면 톱니의 깊이가 달라지지만
 * 톱니가 서는 해는 그대로다 — 이 화면이 말하는 것은 그 해다.
 *
 * 1989 → 2026   지나온 구간. 주기대로 갈았다고 보고 그린다.
 * 2026 → 2039   두 갈래. 손대지 않으면 계속 내려가고, 판정대로 손대면 반등한다.
 *
 * 2039 에서 끊는다. 구조 수명이 닿는 해이고, 대수선이 수명을 얼마나 되돌리는지는
 * 우리가 정할 값이 아니다. 거기서부터는 존치냐 재건축이냐의 결정이다.
 */
const LIFE = (id) => {
  const p = PHYSICAL.find((x) => x.id === id)
  return (p.life[0] + p.life[1]) / 2
}

/** 지금 기준 마지막 교체 — 주기대로 갈아 왔다고 본다 */
const LAST_OF = (id) => {
  const p = PHYSICAL.find((x) => x.id === id)
  const life = LIFE(id)
  return id === 'str' ? BUILT : p.from + Math.floor((NOW - p.from) / life) * life
}

/**
 * 판정이 그 층을 손대는 해 — 두 시계가 겹치는 자리 그대로다.
 *
 * 구조(2039)는 뺀다. 대수선이 구조 수명을 얼마나 되돌리는지는 우리가 정할 값이
 * 아니고, 넣는 순간 곡선의 마지막 반등이 통째로 지어낸 값이 된다.
 * 2039 는 반등이 아니라 곡선이 끝나는 해다 — 존치냐 재건축이냐를 거기서 정한다.
 */
const PLAN_AT = Object.fromEntries(
  MEET_YEARS.filter((m) => m.layer !== 'str').map((m) => [m.layer, m.a]),
)

/**
 * 앞으로의 잔존율. plan 이면 계획된 해에 그 층이 100 으로 돌아간다.
 * before 는 교체 직전 값 — 톱니를 각지게 그리려면 한 해에 두 점이 필요하다.
 */
const ahead = (id, y, plan, before) => {
  const life = LIFE(id)
  const hit = PLAN_AT[id]
  const done = plan && hit && (before ? y > hit : y >= hit)
  const base = done ? hit : LAST_OF(id)
  return Math.max(0, 1 - (y - base) / life)
}

const mean = (fn) => (PHYSICAL.reduce((a, p) => a + fn(p.id), 0) / PHYSICAL.length)

/**
 * 분석 지평 — LCC 는 준공부터 훑는 것이 아니라 지금부터 앞을 본다.
 *
 * 단기 3년   법이 정한 정기점검 주기와 같다. 이 안에 물리 만기가 하나도 없다.
 * 중기 10년  내장(2031)과 설비(2034)가 둘 다 들어온다. 두 시계가 겹치는 자리다.
 * 장기 20년  구조 수명(2039)이 들어온다. 존치냐 재건축이냐를 이 안에서 정해야 한다.
 *
 * 셋 다 우리가 고른 숫자가 아니다. 3년은 건축물관리법 제13조③, 10·20년은
 * 이 건물의 물리 만기가 어디에 떨어지는지를 보고 끊은 것이다.
 */
export const HORIZONS = [
  { n: 3, id: 'short', year: NOW + 3 },
  { n: 10, id: 'mid', year: NOW + 10 },
  { n: 20, id: 'long', year: NOW + 20 },
]

export const HORIZON_END = HORIZONS.at(-1).year

/** 구조 수명이 닿는 해. 여기서부터는 우리가 모델링하지 않는다. */
export const COMPOSITE_END = BIG.a

/** 지나온 구간 — 주기대로 갈아 온 톱니 */
export const COMPOSITE_PAST = (() => {
  const pts = []
  for (let y = BUILT; y <= NOW; y += 1) {
    for (const p of PHYSICAL) {
      const life = LIFE(p.id)
      if (p.id !== 'str' && y > BUILT && (y - p.from) % life === 0) {
        pts.push({ y, v: mean((id) => (id === p.id ? 0 : residual(id, y))) })
        break
      }
    }
    pts.push({ y, v: mean((id) => residual(id, y)) })
  }
  return pts
})()

/** 앞으로의 두 갈래 */
/**
 * 앞으로의 두 갈래.
 *
 * 손대지 않는 쪽은 20년 지평 끝까지 그린다 — 0 에 닿고 그대로 눕는다.
 * 판정대로 손대는 쪽은 구조 수명이 닿는 2039 에서 끊는다. 그 뒤는 대수선이
 * 수명을 얼마나 되돌리는지를 우리가 정해야 하는 구간이고, 그 값이 없다.
 */
export const COMPOSITE = ['none', 'plan'].map((key) => {
  const plan = key === 'plan'
  const stop = plan ? COMPOSITE_END : HORIZON_END
  const pts = []
  for (let y = NOW; y <= stop; y += 1) {
    if (plan && Object.values(PLAN_AT).includes(y) && y > NOW) {
      pts.push({ y, v: mean((id) => ahead(id, y, true, true)) })
    }
    pts.push({ y, v: mean((id) => ahead(id, y, plan, false)) })
  }
  return { key, pts }
})

/** 그 해에 두 갈래가 각각 어디에 서 있는가 */
export const valueAt = (key, y) => {
  const c = COMPOSITE.find((x) => x.key === key)
  const hit = c.pts.filter((p) => p.y <= y).at(-1)
  return hit ? hit.v : null
}

/** 화면에 적을 두 값 — 2039 년에 어디에 서 있는가 */
export const COMPOSITE_END_V = Object.fromEntries(
  COMPOSITE.map((c) => [c.key, valueAt(c.key, COMPOSITE_END)]),
)

/**
 * 지평마다 무엇이 들어오는가.
 * lifts 는 그 지평 안에 떨어지는 물리 만기, decide 는 구조 수명이 들어오는지.
 */
export const HORIZON_ROWS = HORIZONS.map((h) => ({
  ...h,
  lifts: MEET_YEARS.filter((m) => m.layer !== 'str' && m.a <= h.year),
  decide: BIG.a <= h.year,
  plan: valueAt('plan', Math.min(h.year, COMPOSITE_END)),
  none: valueAt('none', h.year),
  /** 구조 수명을 넘어선 지평은 물리 상태를 단정하지 않는다 */
  beyond: h.year > COMPOSITE_END,
}))
