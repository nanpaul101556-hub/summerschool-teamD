/**
 * 커서 자리를 한 곳에서 관리한다.
 *
 * 두 가지 좌표를 함께 둔다 —
 *   x, y    화면 한가운데가 0, 가장자리가 ±1. 3차원 배경이 쓴다.
 *   px, py  화면 위의 픽셀. 커서를 따라다니는 물방울이 쓴다.
 *
 * 배경 캔버스는 pointer-events 를 받지 않고 그 위를 표제와 입력칸이 덮고 있어서
 * 캔버스에 붙은 이벤트로는 커서를 알 수 없다. 그래서 창 전체에서 듣는다.
 *
 * React 상태로 두지 않는다. 커서가 1픽셀 움직일 때마다 화면을 다시 그릴
 * 이유가 없다 — 값을 읽는 쪽이 매 프레임 알아서 가져간다.
 */

export const cursor = {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  /** 아직 한 번도 움직이지 않았으면 물방울을 띄우지 않는다 (터치 기기) */
  seen: false,
}

/**
 * 듣는 일은 앱이 사는 동안 한 번이면 된다.
 * 여러 곳에서 불러 써도 귀는 하나만 열리게 한다.
 */
if (typeof window !== 'undefined') {
  const move = (e) => {
    cursor.px = e.clientX
    cursor.py = e.clientY
    cursor.x = (e.clientX / window.innerWidth) * 2 - 1
    cursor.y = -(e.clientY / window.innerHeight) * 2 + 1
    cursor.seen = true
  }
  // 창 밖으로 나가면 가운데로 돌아온다
  const rest = () => {
    cursor.x = 0
    cursor.y = 0
  }
  window.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('pointerleave', rest)
  window.addEventListener('blur', rest)
}

/**
 * 목표값으로 지수적으로 다가간다.
 * 곧바로 따라가면 커서를 튕기듯 쫓아 어지럽다. 프레임률이 달라도 같은 속도다.
 */
export function damp(cur, to, lambda, dt) {
  return cur + (to - cur) * (1 - Math.exp(-lambda * dt))
}
