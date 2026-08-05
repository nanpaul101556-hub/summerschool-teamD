/** 숫자·단위 표기 유틸. 화면 전체가 같은 규칙을 쓴다. */

export const n = (v) => (v == null ? '—' : v.toLocaleString('ko-KR'))
export const pct = (v, d = 1) => (v == null ? '—' : `${v.toFixed(d)}%`)
export const m2 = (v) => (v == null ? '—' : `${Math.round(v).toLocaleString('ko-KR')} m²`)

/** 도보 소요시간 (분) — 고령자 보행속도 기준 */
export const walkMinutes = (meters, kmh = 2.5) => Math.round((meters / 1000 / kmh) * 60)

/** 결측을 화면에서 구분하기 위한 표기 */
export const orMissing = (v, unit = '') => (v == null ? '미확보' : `${v}${unit}`)
