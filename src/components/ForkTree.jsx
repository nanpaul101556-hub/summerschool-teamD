/**
 * 대안 분기도.
 *
 * 세 안은 임의로 고른 셋이 아니라 두 번의 판단에서 갈라져 나온 결과다.
 *   2036 — 커뮤니티 수요를 건물이 받을 것인가, 인근에 넘길 것인가
 *   2046 — 자료가 끊기는 지점. 무엇에 베팅할 것인가
 *
 * 트리는 하드코딩하지 않고 각 안의 궤적에서 공통 접두를 묶어 만든다.
 * 궤적이 바뀌면 그림도 따라 바뀐다.
 */

import { useLang } from '../i18n'

const W = 900
const ROW = 62
const PAD_T = 34
const COL = [96, 330, 556]
const LEAF_X = 660

const sig = (s) => `${s.use}:${s.mode}`

/** 궤적들의 공통 접두를 묶어 트리를 만든다. */
function buildTree(options) {
  const leaves = []
  const nodes = []
  const edges = []
  let row = 0

  const last = options[0].track.length - 1

  const walk = (group, depth, parent) => {
    // 마지막 단계는 묶지 않는다 — 궤적이 같아도 안은 따로 남아야 한다
    const buckets = new Map()
    for (const o of group) {
      const k = depth === last ? o.key : sig(o.track[depth])
      if (!buckets.has(k)) buckets.set(k, [])
      buckets.get(k).push(o)
    }

    const made = []
    for (const [, members] of buckets) {
      const step = members[0].track[depth]
      const node = { depth, step, x: COL[depth], y: 0, id: nodes.length }
      nodes.push(node)
      if (parent) edges.push([parent, node])

      if (depth === last) {
        node.y = PAD_T + row * ROW
        leaves.push({ node, option: members[0] })
        row += 1
      } else {
        const kids = walk(members, depth + 1, node)
        node.y = kids.reduce((s, k) => s + k.y, 0) / kids.length
      }
      made.push(node)
    }
    return made
  }

  walk(options, 0, null)
  return { nodes, edges, leaves, height: PAD_T + row * ROW + 24 }
}

/** 꺾은선 — 세로로 갈라졌다가 다시 가로로 붙는다 */
const elbow = (a, b) => {
  const mx = a.x + (b.x - a.x) * 0.42
  return `M${a.x},${a.y} H${mx} V${b.y} H${b.x}`
}

export default function ForkTree({ options }) {
  const { t, tx } = useLang()
  const { nodes, edges, leaves, height } = buildTree(options)

  return (
    <figure className="fork">
      <svg viewBox={`0 0 ${W} ${height}`} role="img"
        aria-label={t("opt.forkTitle")}>
        {/* 자료가 끊기는 지점 */}
        <line x1={(COL[1] + COL[2]) / 2} y1="8" x2={(COL[1] + COL[2]) / 2} y2={height - 16}
          className="fk-cut" />
        <text x={(COL[1] + COL[2]) / 2 - 8} y="16" textAnchor="end" className="fk-note">{t('opt.dataSide')}</text>
        <text x={(COL[1] + COL[2]) / 2 + 8} y="16" className="fk-note">{t('opt.betSide')}</text>

        {edges.map(([a, b], i) => (
          <path key={i} d={elbow(a, b)} className="fk-edge" />
        ))}

        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="5"
              className={`fk-node ${n.step.mode}`} />
            <text x={n.x} y={n.y - 13} textAnchor="middle" className="fk-use">
              {tx(n.step.label)}
            </text>
            <text x={n.x} y={n.y + 23} textAnchor="middle" className="fk-mode">
              {t(n.step.mode === 'own' ? 'opt.own' : 'opt.link')}
            </text>
          </g>
        ))}

        {leaves.map(({ node, option }) => (
          <g key={option.key}>
            <line x1={node.x} y1={node.y} x2={LEAF_X - 10} y2={node.y} className="fk-edge" />
            <text x={LEAF_X} y={node.y + 5} className="fk-key">{option.key}</text>
            <text x={LEAF_X + 24} y={node.y + 5} className="fk-label">{tx(option.label)}</text>
            <text x={W - 12} y={node.y + 5} textAnchor="end"
              className={`fk-verdict ${option.ok ? 'ok' : ''}`}>
              {option.ok ? t('opt.verdictOk') : `−${option.shortfall.toLocaleString()} m²`}
            </text>
          </g>
        ))}

        {/* 연도 */}
        {options[0].track.map((s, i) => (
          <text key={s.year} x={COL[i]} y={height - 4} textAnchor="middle" className="fk-year">
            {s.year}
          </text>
        ))}
      </svg>

      <figcaption className="fk-legend">
        <span><i className="fk-own" />{t('opt.own')}</span>
        <span><i className="fk-link" />{t('opt.link')}</span>
        <span className="fk-sep">{t('opt.forkLegend', { n: leaves.length })}</span>
      </figcaption>
    </figure>
  )
}
