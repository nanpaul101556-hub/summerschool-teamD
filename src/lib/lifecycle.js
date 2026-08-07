/**
 * ⑤ 생애주기 — 언제 무엇을 손봐야 하는가.
 *
 * 금액이 아니라 「시점」을 다룬다. 단가가 없어도 계산되는 부분이 여기다.
 * 법정 수선주기(별표15)는 확정값이므로 추정이 섞이지 않는다.
 *
 * 핵심 질문: 용도를 바꾸려는 시점과 설비를 갈아야 하는 시점이 맞는가.
 *   맞으면  → 한 번의 공사로 끝난다
 *   어긋나면 → 멀쩡한 설비를 버리거나, 곧 뜯을 곳을 새로 고친다
 */

import { LEGAL_INSPECTIONS, MAJOR_METHODS, REPAIR_CYCLES } from '../data/maintenance'

/** 큰 공사인가 — 부분수리는 일상 유지관리로 보고 타임라인에서 뺀다 */
export const isMajor = (item) => MAJOR_METHODS.includes(item.method)

/**
 * 준공연도부터 horizon 년까지의 수선 일정을 만든다.
 * 주기가 겹치는 해는 한 항목으로 묶는다 — 그 해가 곧 「공사가 몰리는 해」다.
 */
export function buildSchedule(builtYear, horizon = 50, { majorOnly = true } = {}) {
  const pool = majorOnly ? REPAIR_CYCLES.filter(isMajor) : REPAIR_CYCLES
  const byYear = new Map()

  pool.forEach((item) => {
    for (let age = item.cycle; age <= horizon; age += item.cycle) {
      const year = builtYear + age
      if (!byYear.has(year)) byYear.set(year, { year, age, items: [] })
      byYear.get(year).items.push(item)
    }
  })

  return [...byYear.values()]
    .sort((a, b) => a.year - b.year)
    .map((e) => ({ ...e, weight: e.items.length, layers: countLayers(e.items) }))
}

/** 그 해의 공사가 어느 층에 몰려 있는가 */
function countLayers(items) {
  return items.reduce((acc, i) => ({ ...acc, [i.layer]: (acc[i.layer] ?? 0) + 1 }), {})
}

/**
 * 특정 시점에 각 부재가 얼마나 남았는가.
 * 교체 직후면 cycle 전부, 교체 직전이면 0에 가깝다.
 */
export function remainingLife(item, builtYear, targetYear) {
  const age = targetYear - builtYear
  if (age < 0) return item.cycle
  const elapsed = age % item.cycle
  return elapsed === 0 ? 0 : item.cycle - elapsed
}

/**
 * ★ 용도 전환 시점과 설비 주기의 정합성.
 *
 * 전환하려면 설비·평면을 어차피 손봐야 한다.
 * 그때 잔여수명이 많이 남아 있으면 그만큼을 버리는 것이다.
 *
 * waste  = 버리게 되는 잔여수명의 합 (년)
 * window = 전환 시점 ±tolerance 안에 예정된 큰 공사 수
 */
export function alignTransition(builtYear, transitionYear, { tolerance = 2 } = {}) {
  const targets = REPAIR_CYCLES.filter(
    (i) => isMajor(i) && (i.layer === 'services' || i.layer === 'space'),
  )

  const detail = targets.map((item) => ({
    item,
    remaining: remainingLife(item, builtYear, transitionYear),
  }))

  const waste = detail.reduce((sum, d) => sum + d.remaining, 0)
  const maxWaste = targets.reduce((sum, i) => sum + i.cycle, 0)
  const aligned = detail.filter((d) => d.remaining <= tolerance || d.remaining >= d.item.cycle - tolerance)

  return {
    year: transitionYear,
    age: transitionYear - builtYear,
    waste,
    /** 0~100 — 높을수록 버리는 수명이 적다 */
    score: Math.round((1 - waste / maxWaste) * 100),
    alignedCount: aligned.length,
    total: targets.length,
    detail: detail.sort((a, b) => a.remaining - b.remaining),
  }
}

/**
 * 전환 시점 후보들을 비교해 가장 낭비가 적은 해를 찾는다.
 * "2035년에 바꾸려 했는데 2037년이 낫다" 같은 답이 여기서 나온다.
 */
export function bestTransitionYear(builtYear, wantYear, { search = 5 } = {}) {
  const cands = []
  for (let y = wantYear - search; y <= wantYear + search; y += 1) {
    if (y <= builtYear) continue
    cands.push(alignTransition(builtYear, y))
  }
  const best = cands.reduce((a, b) => (b.score > a.score ? b : a), cands[0])
  const want = cands.find((c) => c.year === wantYear)
  return {
    want,
    best,
    shift: best.year - wantYear,
    gain: best.score - (want?.score ?? 0),
    candidates: cands,
  }
}

/** 법정 점검 일정 — 안 하면 위법인 항목 */
export function inspectionSchedule(builtYear, horizon = 50) {
  return LEGAL_INSPECTIONS.flatMap((ins) => {
    const years = []
    for (let age = ins.first; age <= horizon; age += ins.every) {
      years.push({ year: builtYear + age, age, key: ins.key, label: ins.label, law: ins.law })
    }
    return years
  }).sort((a, b) => a.year - b.year)
}

/** 공사가 가장 몰리는 해 상위 n개 — 예산 편성이 필요한 시점 */
export function peakYears(schedule, n = 5) {
  return [...schedule].sort((a, b) => b.weight - a.weight).slice(0, n)
}
