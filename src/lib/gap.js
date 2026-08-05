/** ② 지역 — 수요와 공급을 대조해 대응 유형을 고른다. */

/** 인구 신호에서 기능별 수요 점수(0~100)를 만든다. */
export function deriveDemand({ elder, youth }) {
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)))
  return [
    { key: 'care', label: '돌봄 · 복지', score: clamp((elder - 8) * 3.4) },
    { key: 'medical', label: '의료 접근', score: clamp((elder - 10) * 3.1) },
    { key: 'community', label: '커뮤니티', score: clamp((elder - 12) * 2.6) },
    { key: 'education', label: '교육시설', score: clamp((youth ?? 8) * 7.5) },
  ]
}

export const RESPONSE = {
  BUILD: { code: 'BUILD', label: '신설', desc: '수요 있음 · 공급 없음', tone: 'build' },
  CONNECT: { code: 'CONNECT', label: '연결', desc: '있는데 걸어서 닿지 않음', tone: 'connect' },
  SUPPORT: { code: 'SUPPORT', label: '보조', desc: '있는데 부족 — 기능 보완', tone: 'support' },
  CONVERT: { code: 'CONVERT', label: '전환', desc: '수요 소멸 — 용도 변경', tone: 'convert' },
  KEEP: { code: 'KEEP', label: '유지', desc: '현재 공급으로 충분', tone: 'keep' },
}

/**
 * 대응 유형 판정.
 * 신설이 항상 답은 아니다 — 인구 감소 지역에서 신설은 미래의 유휴자산이 된다.
 */
export function classify({ demand, supplyExists, reachable, surplus }) {
  if (surplus) return RESPONSE.CONVERT
  if (!supplyExists) return RESPONSE.BUILD
  if (!reachable) return RESPONSE.CONNECT
  if (demand > 60) return RESPONSE.SUPPORT
  return RESPONSE.KEEP
}

/**
 * 공급 시설 목록에서 기능별 도달 가능성을 판정한다.
 * @param {Array} facilities  dist(m) 를 가진 시설 목록
 * @param {number} radius     도달 기준 거리(m)
 */
export function assessSupply(facilities, radius) {
  const byType = (type) => facilities.filter((f) => f.type === type)
  const nearest = (type) => {
    const list = byType(type)
    return list.length ? Math.min(...list.map((f) => f.dist)) : null
  }
  return {
    welfare: { nearest: nearest('welfare'), exists: byType('welfare').length > 0 },
    culture: { nearest: nearest('culture'), exists: byType('culture').length > 0 },
    education: { nearest: nearest('education'), exists: byType('education').length > 0 },
    reachable: (type) => {
      const d = nearest(type)
      return d != null && d <= radius
    },
  }
}
