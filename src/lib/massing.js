/**
 * 매싱 산출 — 고른 대안에서 형태 파라미터를 계산한다.
 *
 * 형태 규칙은 두 선례에서 가져온다.
 *   Folie N6 (Tschumi, Parc de la Villette)
 *     — 골조가 외피보다 크다. 프레임이 프로그램보다 먼저 있고 남는다.
 *   유리 적층형
 *     — 슬래브가 드러나는 층 적층, 1층은 열린 필로티.
 *
 * 규칙은 모든 안에 같게 적용하고, 치수와 채움만 대안에 따라 달라진다.
 * 남는 프레임(overshoot)이 곧 여유이고, 그것이 옵션 프리미엄의 실체다.
 */

/** 전환 최소 단위 — 스팬 2×2 베이. 이보다 작으면 무주공간을 못 만든다. */
const CORE_BAYS = 2

/** 층수는 두 선례와 기존 Rhino 모델을 따라 2개 층으로 고정한다. */
const FLOORS = 2

export function computeMassing(option, plannedArea) {
  const span = option.spec.span
  const height = option.spec.height
  const bayArea = span * span

  // 받아내는 용도가 늘수록 프레임이 외피 밖으로 더 자란다
  const overshoot = Math.max(0, option.absorbs - 1)
  const gx = CORE_BAYS + Math.ceil(overshoot / 2)
  const gy = CORE_BAYS + Math.floor(overshoot / 2)

  // 지금 실제로 채우는 베이 — 계획 연면적을 층수로 나눈 만큼만
  const perFloor = plannedArea / FLOORS
  const enclosed = Math.max(1, Math.min(gx * gy, Math.ceil(perFloor / bayArea)))

  // 한쪽 모서리부터 채워 덩어리로 읽히게 한다
  const cells = []
  let left = enclosed
  for (let iy = 0; iy < gy; iy += 1) {
    for (let ix = 0; ix < gx; ix += 1) {
      const filled = left > 0
      if (filled) left -= 1
      cells.push({ ix, iy, filled })
    }
  }

  return {
    span,
    height,
    floors: FLOORS,
    gx,
    gy,
    overshoot,
    enclosed,
    cells,
    columns: (gx + 1) * (gy + 1),
    /** 프레임이 덮는 전체 바닥 */
    frameArea: Math.round(gx * gy * bayArea),
    /** 지금 채우는 바닥 (전 층 합) */
    enclosedArea: Math.round(enclosed * bayArea * FLOORS),
    /** 비워 둔 프레임 = 여유 */
    spareBays: gx * gy - enclosed,
    width: gx * span,
    depth: gy * span,
    top: FLOORS * height,
  }
}
