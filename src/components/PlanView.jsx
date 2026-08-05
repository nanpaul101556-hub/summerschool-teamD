/**
 * 2D 평면도 — 브라우저에서 즉시 그린다.
 *
 * Rhino 를 거치지 않으므로 대안을 바꾸면 바로 반응한다.
 * 3D 는 같은 파라미터로 Rhino 가 만들고, 둘은 항상 같은 매싱을 본다.
 */

const PAD = 54

export default function PlanView({ massing }) {
  const { span, gx, gy, cells } = massing

  // 1 베이를 60 단위로 두고 그린다 (화면 크기는 CSS 가 정한다)
  const U = 60
  const w = gx * U
  const h = gy * U
  const W = w + PAD * 2
  const H = h + PAD * 2

  const px = (ix) => PAD + ix * U
  const py = (iy) => PAD + iy * U

  return (
    <figure className="plan">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`평면도 ${gx}×${gy} 베이, 스팬 ${span} 미터`}>
        {/* 채운 베이 */}
        {cells.filter((c) => c.filled).map((c) => (
          <rect key={`${c.ix}-${c.iy}`} x={px(c.ix)} y={py(c.iy)} width={U} height={U}
            className="pl-fill" />
        ))}

        {/* 그리드 */}
        {Array.from({ length: gx + 1 }, (_, i) => (
          <line key={`v${i}`} x1={px(i)} y1={py(0)} x2={px(i)} y2={py(gy)} className="pl-grid" />
        ))}
        {Array.from({ length: gy + 1 }, (_, i) => (
          <line key={`h${i}`} x1={px(0)} y1={py(i)} x2={px(gx)} y2={py(i)} className="pl-grid" />
        ))}

        {/* 채운 영역의 외곽선 — 지금의 외피 */}
        {cells.filter((c) => c.filled).map((c) => {
          const has = (dx, dy) =>
            cells.some((o) => o.ix === c.ix + dx && o.iy === c.iy + dy && o.filled)
          const x = px(c.ix)
          const y = py(c.iy)
          return (
            <g key={`e${c.ix}-${c.iy}`} className="pl-skin">
              {!has(0, -1) && <line x1={x} y1={y} x2={x + U} y2={y} />}
              {!has(0, 1) && <line x1={x} y1={y + U} x2={x + U} y2={y + U} />}
              {!has(-1, 0) && <line x1={x} y1={y} x2={x} y2={y + U} />}
              {!has(1, 0) && <line x1={x + U} y1={y} x2={x + U} y2={y + U} />}
            </g>
          )
        })}

        {/* 기둥 */}
        {Array.from({ length: gy + 1 }, (_, iy) =>
          Array.from({ length: gx + 1 }, (_, ix) => (
            <rect key={`c${ix}-${iy}`} x={px(ix) - 4} y={py(iy) - 4} width="8" height="8"
              className="pl-col" />
          )),
        )}

        {/* 스팬 치수선 */}
        <g className="pl-dim">
          <line x1={px(0)} y1={py(gy) + 22} x2={px(1)} y2={py(gy) + 22} />
          <line x1={px(0)} y1={py(gy) + 17} x2={px(0)} y2={py(gy) + 27} />
          <line x1={px(1)} y1={py(gy) + 17} x2={px(1)} y2={py(gy) + 27} />
          <text x={(px(0) + px(1)) / 2} y={py(gy) + 38} textAnchor="middle">
            {span.toFixed(1)} m
          </text>
        </g>

        {/* 전체 폭 */}
        <g className="pl-dim">
          <line x1={px(0)} y1={py(0) - 22} x2={px(gx)} y2={py(0) - 22} />
          <line x1={px(0)} y1={py(0) - 27} x2={px(0)} y2={py(0) - 17} />
          <line x1={px(gx)} y1={py(0) - 27} x2={px(gx)} y2={py(0) - 17} />
          <text x={(px(0) + px(gx)) / 2} y={py(0) - 28} textAnchor="middle">
            {(gx * span).toFixed(1)} m
          </text>
        </g>
      </svg>

      <figcaption className="pl-legend">
        <span><i className="pl-k-fill" />지금 채우는 베이 {massing.enclosed}</span>
        <span><i className="pl-k-open" />비워 둔 프레임 {massing.spareBays}</span>
        <span className="pl-sep">{gx}×{gy} 베이 · 기둥 {massing.columns}</span>
      </figcaption>
    </figure>
  )
}
