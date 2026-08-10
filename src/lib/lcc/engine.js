/**
 * 총 LCC — 백병훈·조중연(2014) 식(1)을 costModel 위에서 돈다.
 *
 *          T
 *  C_TOT = C_INI + Σ  ──────── × ( C_MAI(t) + C_DIS(t) )   + 위험도비용
 *         t=1   (1+q)^t
 *
 * 값(costs)이 아직 비어 있어도 계산은 돌아간다 — 채워진 것만 더하고,
 * 비어 있는 것은 완성도(coverage)로 따로 보고한다. 지어내지 않는다.
 */

import { allLeaves } from './costModel'
import { pvStream, pv } from './discount'
import { riskCost } from './risk'
import { HORIZON, DISCOUNT } from './params'

/**
 * costs 한 항목의 현재가치.
 * value 의 뜻은 timing 을 따른다 — once=총액, annual=연액, cycle=회당액.
 */
function leafPv(leaf, entry, years, rate) {
  if (!entry || entry.value == null) return 0
  if (leaf.timing === 'once') return pv(entry.value, 0, rate)   // t=0, 할인 안 함
  if (leaf.timing === 'event') return 0                         // 위험도 엔진이 처리
  return pvStream(entry.value, leaf.timing, years, rate, leaf.period)
}

/**
 * @param {object} costs      { leafKey: { value, status, source, basis } }
 * @param {Array}  hazards    위험도 입력 (없으면 위험도비용 0)
 * @param {object} opts       { years, rate } — 없으면 params 기본값
 */
export function computeLcc(costs = {}, hazards = [], opts = {}) {
  const years = opts.years ?? HORIZON.years
  const rate = opts.rate ?? DISCOUNT.rate

  const leaves = allLeaves()
  const lines = leaves.map((leaf) => {
    const entry = costs[leaf.key]
    const status = entry?.status ?? 'missing'
    return {
      key: leaf.key,
      label: leaf.label,
      branch: leaf.branch,
      group: leaf.group,
      timing: leaf.timing,
      status,
      raw: entry?.value ?? null,
      present: entry?.value != null,
      pv: leaf.branch === 'risk' ? 0 : leafPv(leaf, entry, years, rate),
    }
  })

  const risk = riskCost(hazards, years, rate)
  const managed = lines.reduce((s, l) => s + l.pv, 0)
  const total = managed + risk.total

  return {
    total,
    managed,
    risk,
    lines,
    params: { years, rate },
    coverage: coverageOf(lines),
  }
}

/** 확보/미확보 집계 — 화면이 「얼마나 채워졌나」를 정직하게 보이게 한다 */
function coverageOf(lines) {
  const by = { confirmed: 0, estimate: 0, missing: 0 }
  for (const l of lines) by[l.status] = (by[l.status] ?? 0) + 1
  const total = lines.length
  return {
    ...by,
    total,
    ready: total ? +(((by.confirmed) / total) * 100).toFixed(0) : 0,
    missingKeys: lines.filter((l) => l.status === 'missing').map((l) => l.key),
  }
}
