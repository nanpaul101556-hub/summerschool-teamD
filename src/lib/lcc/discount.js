/**
 * 현재가치 환산 — 논문 식(1)의 1/(1+q)^t 항.
 *
 * 시간축에 흩어진 돈을 한 시점(오늘)으로 모아야 비교가 된다.
 * 여기 함수들은 부수효과가 없다 — 값을 받아 값을 돌려줄 뿐이다.
 */

/** t년 뒤 1원의 현재가치 계수 */
export const pvFactor = (t, rate) => 1 / (1 + rate) ** t

/** t년 뒤 발생하는 금액 amount 의 현재가치 */
export const pv = (amount, t, rate) => amount * pvFactor(t, rate)

/**
 * timing 에 따라 0..T 년의 발생 시점을 만든다.
 *   once    [0]
 *   annual  [1,2,...,T]
 *   cycle   [period, 2·period, ...]  (period 없으면 매년)
 *   event   위험도 엔진이 따로 처리하므로 여기선 빈 배열
 */
export function occurrences(timing, years, period) {
  if (timing === 'once') return [0]
  if (timing === 'event') return []
  const step = timing === 'cycle' ? (period || 1) : 1
  const out = []
  for (let t = step; t <= years; t += step) out.push(t)
  return out
}

/** annual/cycle 금액(연 또는 회당 amount)을 T년간 현재가치로 합산 */
export function pvStream(amount, timing, years, rate, period) {
  return occurrences(timing, years, period)
    .reduce((sum, t) => sum + pv(amount, t, rate), 0)
}
