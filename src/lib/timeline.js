/** ③ 시간 — 연도 보간과 변화 유형 분류. */

/** 인구 시계열에서 임의 연도 값을 선형보간한다. */
export function interpolate(series, year) {
  const s = [...series].sort((a, b) => a.year - b.year)
  const hit = s.find((d) => d.year === year)
  if (hit) return hit

  const lo = [...s].reverse().find((d) => d.year < year)
  const hi = s.find((d) => d.year > year)
  if (!lo) return s[0]
  if (!hi) return s[s.length - 1]

  const t = (year - lo.year) / (hi.year - lo.year)
  const mix = (a, b) => (a == null || b == null ? (a ?? b) : a + (b - a) * t)

  return {
    year,
    pop: Math.round(mix(lo.pop, hi.pop)),
    elder: Number(mix(lo.elder, hi.elder).toFixed(1)),
    youth: lo.youth != null && hi.youth != null ? Number(mix(lo.youth, hi.youth).toFixed(1)) : null,
    est: true,
    interpolated: true,
  }
}

/**
 * van Ellen(2021)의 구분을 그대로 쓴다.
 * certain  = 반복·예측 가능한 리듬 (인구추계)
 * scenario = 예측 불가 (기술·산업 변화) — 조건부로만 표기
 */
export function classifyChange(phase) {
  return phase.certainty === 'certain'
    ? { label: '확정', tone: 'certain', note: '공표 추계 기반' }
    : { label: '시나리오', tone: 'scenario', note: '조건부 — 단언하지 않음' }
}

/** 두 시점 사이 인구 변화율 */
export function changeRate(series, fromYear, toYear) {
  const a = interpolate(series, fromYear)
  const b = interpolate(series, toYear)
  return {
    pop: Number((((b.pop - a.pop) / a.pop) * 100).toFixed(1)),
    elder: Number((b.elder - a.elder).toFixed(1)),
  }
}
