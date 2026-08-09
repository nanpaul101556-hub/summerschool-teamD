/**
 * 03 끝 — 결과.
 *
 * 자리는 그대로 두고 내용만 글에서 값으로 바꾼다.
 * 세 칸이 왼쪽에서 오른쪽으로 읽히면 그것으로 결론이 끝난다.
 *
 *   지금 현 용도에 적합하다 → 2028년 적합성을 다시 잰다 → 그다음 이 용도로 대응한다
 *
 * 가운데 칸의 연도만 크게 놓는다. 이 화면에서 사람이 가져갈 것은 그 하나다.
 */

import { INTO, NEXT_YEAR, NOW, OUT_SRC, WHEN } from '../data/outcome'
import { useLang } from '../i18n'

function Col({ cap, v, head, rows, big }) {
  const { tx } = useLang()
  return (
    <section className={`oc-c${big ? ' big' : ''}`}>
      <span className="cap">{cap}</span>
      {v && <strong className="num">{v}</strong>}
      <b>{tx(head)}</b>
      <ul>
        {rows.map((r) => (
          <li key={r.id} className={r.dir || ''}>
            <b className="num">{r.v}</b>
            <span className="k">{tx(r.k)}</span>
            <span className="d">{typeof r.d === 'string' ? r.d : tx(r.d)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Outcome() {
  const { t, tx } = useLang()

  return (
    <div className="oc">
      <div className="oc-g">
        <Col cap={t('oc.now')} head={NOW.head} rows={NOW.rows} />
        <Col cap={t('oc.when', { y: NEXT_YEAR })} v={WHEN.v} head={WHEN.head}
          rows={WHEN.rows} big />
        <Col cap={t('oc.into')} head={INTO.head} rows={INTO.rows} />
      </div>
      <p className="oc-s">{tx(OUT_SRC)}</p>
    </div>
  )
}
