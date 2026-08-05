/**
 * ④ 설계 — 용도 경로를 다 소화하는 최소 사양을 역산한다.
 * 이 시스템의 심장. 형태가 아니라 조건이 먼저다.
 */

/**
 * 선택된 용도들의 요구 성능 중 각 항목의 최댓값을 채택한다.
 * 최댓값과 첫 용도의 차이 = 「여유」 = 옵션 프리미엄의 물리적 실체.
 */
export function backCalculate(uses, selectedKeys) {
  const rows = selectedKeys.map((k) => uses.find((u) => u.key === k)).filter(Boolean)
  if (!rows.length) return null

  const max = (f) => Math.max(...rows.map(f))
  const base = rows[0]

  const spec = {
    load: max((r) => r.load),
    span: max((r) => r.span),
    height: max((r) => r.height),
    power: max((r) => r.power),
  }

  return {
    rows,
    spec,
    base,
    premium: {
      load: spec.load - base.load,
      span: Number((spec.span - base.span).toFixed(1)),
      height: Number((spec.height - base.height).toFixed(1)),
      power: spec.power - base.power,
    },
    /** 모든 값이 추정치면 화면에 경고를 띄운다 */
    estimated: rows.every((r) => r.src === 'estimate'),
  }
}

/**
 * 전환 가능한 최소 면적.
 * 평면을 재분할하려면 최소 2×2 베이가 필요하다 (무주공간 확보 단위).
 */
export function minAdaptableArea(span) {
  return Math.round(span * 2 * (span * 2))
}

/**
 * 계획 면적이 전환 가능 규모인지 판정한다.
 * — "작은 건물은 애초에 못 바꾼다"를 수치로 보여주는 부분
 */
export function judgeAdaptability(plannedArea, span) {
  const required = minAdaptableArea(span)
  const ok = plannedArea >= required
  return {
    required,
    plannedArea,
    ok,
    shortfall: ok ? 0 : required - plannedArea,
    msg: ok
      ? `${span} m 스팬 기준 최소 ${required.toLocaleString()} m² 를 충족합니다.`
      : `${span} m 스팬 × 2×2 베이 = ${required.toLocaleString()} m² 가 필요한데 계획은 ${plannedArea} m² 입니다. 무주공간 확보가 어려워 용도 전환이 구조적으로 제약됩니다.`,
  }
}

/**
 * Shearing Layers (Brand 1994) — 부재를 수명별로 나눈다.
 * 수명이 다른 것끼리 붙이지 않는 것이 적응성의 기본 규칙.
 */
export const LAYERS = [
  { key: 'site', label: 'Site 대지', life: '영구', fixed: true },
  { key: 'structure', label: 'Structure 구조', life: '30–300년', fixed: true },
  { key: 'skin', label: 'Skin 외피', life: '20년', fixed: false },
  { key: 'services', label: 'Services 설비', life: '7–15년', fixed: false },
  { key: 'space', label: 'Space plan 평면', life: '3–30년', fixed: false },
  { key: 'stuff', label: 'Stuff 집기', life: '수시', fixed: false },
]
