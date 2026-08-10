/**
 * 위험도비용 — 백병훈·조중연(2014) 식(4)(5).
 *
 *   기대복구비  C_EREC = Σ νL · P(파괴|재해) · C_recovery
 *   기대간접비  C_EIND = Σ νL · P(파괴|재해) · C_indirect
 *
 * 1989년 준공 건물은 1988년 내진설계 의무화 직전이라, 지진·화재의
 * 기대복구비가 「왜 지금 손봐야 하는가」를 금액으로 말해 준다.
 *
 * 확률·단가가 아직 없으므로 이 파일은 계산 구조만 세운다.
 * hazards 가 비어 있으면 0을 돌려주고, 화면은 그 사실을 미확보로 표시한다.
 */

import { pvFactor } from './discount'

/**
 * 한 재해의 기대비용.
 * @param {{ freqPerYear:number, pFailure:number, recovery:number, indirect:number }} h
 */
const expectedOf = (h) => ({
  restoration: h.freqPerYear * h.pFailure * h.recovery,
  indirect: h.freqPerYear * h.pFailure * h.indirect,
})

/**
 * 위험도비용 총계 — 매년 발생확률로 보고 T년간 현재가치 합산.
 * @param {Array} hazards  [{ id, freqPerYear, pFailure, recovery, indirect }]
 * @returns {{ restoration:number, indirect:number, total:number, byHazard:Array }}
 */
export function riskCost(hazards, years, rate) {
  if (!hazards || hazards.length === 0) {
    return { restoration: 0, indirect: 0, total: 0, byHazard: [], empty: true }
  }
  let restoration = 0
  let indirect = 0
  const byHazard = hazards.map((h) => {
    const e = expectedOf(h)
    let r = 0
    let d = 0
    for (let t = 1; t <= years; t += 1) {
      r += e.restoration * pvFactor(t, rate)
      d += e.indirect * pvFactor(t, rate)
    }
    restoration += r
    indirect += d
    return { id: h.id, restoration: r, indirect: d }
  })
  return { restoration, indirect, total: restoration + indirect, byHazard, empty: false }
}
