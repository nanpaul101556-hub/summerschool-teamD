/**
 * 미연결 자료 자리의 스켈레톤.
 *
 * 빈칸을 그냥 비워 두면 무엇이 들어올 자리인지 알 수 없다.
 * 실제 값이 아니라 「이런 형태가 들어온다」만 보여주는 도형이다.
 */

const SHAPES = {
  /** 업종·점포 구성 — 가로 막대 */
  bars: [72, 54, 41, 30, 22],
  /** 시간에 따른 값 — 꺾은선 */
  line: [26, 30, 24, 34, 42, 38, 52],
  /** 완만한 추세 — 곡선 */
  curve: [18, 22, 29, 38, 50, 63, 74],
}

export default function Skel({ kind = 'bars' }) {
  if (kind === 'bars') {
    return (
      <div className="skel skel-bars" aria-hidden="true">
        {SHAPES.bars.map((w, i) => (
          <span key={i} style={{ width: `${w}%` }} />
        ))}
      </div>
    )
  }

  const vals = SHAPES[kind] ?? SHAPES.line
  const step = 100 / (vals.length - 1)
  const pts = vals.map((v, i) => `${i * step},${100 - v}`).join(' ')

  return (
    <div className="skel" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="skel-svg">
        <polyline points={pts} />
      </svg>
    </div>
  )
}
