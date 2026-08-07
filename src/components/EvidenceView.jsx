/**
 * 03 · 근거 계보 — 이 결론들이 어디서 나왔는가.
 *
 * 대안을 보기 전에 근거를 먼저 본다. 순서를 바꾸면 결론이 먼저 오고
 * 자료는 나중에 갖다 붙인 것처럼 보인다.
 *
 * 신호를 못 잡은 분석도 지우지 않는다. 버스와 집값에서 실패한 것이
 * 따릉이로 옮긴 이유이므로, 그 사슬이 방법을 설명한다.
 */

import { useState } from 'react'

import { COUNTS, EDGES, KINDS, node } from '../data/provenance'
import { useLang } from '../i18n'
import AppFrame from './AppFrame'
import NodeGraph from './NodeGraph'

/** 선택한 노드의 직계 상류·하류 (한 칸만) */
function neighbours(id) {
  const up = []
  const down = []
  for (const e of EDGES) {
    if (e.b === id) up.push({ n: node(e.a), rel: e.rel })
    if (e.a === id) down.push({ n: node(e.b), rel: e.rel })
  }
  return { up, down }
}

function Chain({ items, onPick }) {
  const { tx } = useLang()
  return (
    <div className="pv-chain">
      {items.map(({ n, rel }) => (
        <button key={n.id + (rel ?? '')} type="button" onClick={() => onPick(n.id)}>
          <span className={KINDS[n.kind].mono ? 'mono' : ''}>{tx(n.label)}</span>
          {rel && <em className={rel}>{rel}</em>}
        </button>
      ))}
    </div>
  )
}

export default function EvidenceView({ site, onStep, onReset, onNext }) {
  const { t, tx } = useLang()
  const [picked, setPicked] = useState(null)
  const cur = picked ? node(picked) : null

  const side = cur ? (
    <>
      <div className="side-h">
        <div className="n">{t(KINDS[cur.kind].key)}</div>
        <h2 className={KINDS[cur.kind].mono ? 'mono' : ''}>{tx(cur.label)}</h2>
        {cur.meta && <p className="num">{tx(cur.meta)}</p>}
      </div>

      {cur.ok === false && (
        <section className="pv-null">
          <h3 className="lab">{t('prov.nullTitle')}</h3>
          <p>{t('prov.nullNote')}</p>
        </section>
      )}

      <section>
        <p className="pv-d">{tx(cur.detail)}</p>
      </section>

      {cur.limit && (
        <section>
          <h3 className="lab">{t('prov.limit')}</h3>
          <p className="note">{tx(cur.limit)}</p>
        </section>
      )}

      {(() => {
        const { up, down } = neighbours(cur.id)
        return (
          <>
            {up.length > 0 && (
              <section>
                <h3 className="lab">{t('prov.from')}</h3>
                <Chain items={up} onPick={setPicked} />
              </section>
            )}
            {down.length > 0 && (
              <section>
                <h3 className="lab">{t('prov.to')}</h3>
                <Chain items={down} onPick={setPicked} />
              </section>
            )}
          </>
        )
      })()}

      <section>
        <h3 className="lab">{t('prov.src')}</h3>
        <div className="pv-src mono">{cur.src}</div>
      </section>
    </>
  ) : (
    <>
      <div className="side-h">
        <div className="n">Step 03</div>
        <h2>{t('evidence.title')}</h2>
        <p>{t('evidence.sub')}</p>
      </div>

      <section>
        <div className="pv-nums">
          <div>
            <b className="num">{COUNTS.source}</b>
            <span>{t('prov.c.source')}</span>
          </div>
          <div>
            <b className="num">{COUNTS.dataset}</b>
            <span>{t('prov.c.dataset')}</span>
          </div>
          <div>
            <b className="num">{COUNTS.finding}</b>
            <span>{t('prov.c.finding')}</span>
          </div>
          <div className="off">
            <b className="num">{COUNTS.null}</b>
            <span>{t('prov.nullCount')}</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="lab">{t('evidence.howTitle')}</h3>
        <ol className="pv-how">
          <li>{t('evidence.how1')}</li>
          <li>{t('evidence.how2')}</li>
          <li>{t('evidence.how3')}</li>
        </ol>
      </section>

      <section>
        <h3 className="lab">{t('evidence.nullTitle')}</h3>
        <p className="note">{t('evidence.nullBody')}</p>
      </section>
    </>
  )

  return (
    <AppFrame
      stage="evidence"
      site={site}
      onStep={onStep}
      onReset={onReset}
      side={side}
      next={{ label: t('step.options'), onClick: onNext }}
    >
      <NodeGraph picked={picked} onPick={setPicked} />
    </AppFrame>
  )
}
