/**
 * 05 비용 — 「무엇을 어떤 구조로 계산하는가」와 「지금 얼마나 채워졌는가」.
 *
 * 금액 총액을 발표하지 않는다. 단가 두 종이 없기 때문이다. 대신 백병훈·조중연(2014)
 * 비용분류체계를 그대로 세워, 각 항목이 확보인지 참조값인지 미확보인지를 정직하게 보인다.
 * 「이 구조로 계산됩니다. 단가가 오면 채워집니다」 — 그게 이 화면이 말하는 전부다.
 *
 * 계산은 lib/lcc/engine 이 한다(순수함수). 이 컴포넌트는 값을 읽어 그리기만 한다.
 */

import { useEffect, useMemo, useState } from 'react'

import { COST_MODEL } from '../lib/lcc/costModel'
import { computeLcc } from '../lib/lcc/engine'
import { STATUS } from '../lib/lcc/sources'
import { useLang } from '../i18n'

export default function CostFrame() {
  const { t, tx } = useLang()
  const [costs, setCosts] = useState(null)

  useEffect(() => {
    let alive = true
    fetch('/data/costs-junggye.json')
      .then((r) => r.json())
      .then((d) => { if (alive) setCosts(d) })
      .catch(() => { if (alive) setCosts({}) })
    return () => { alive = false }
  }, [])

  const lcc = useMemo(() => computeLcc(costs || {}), [costs])
  const byKey = useMemo(
    () => Object.fromEntries(lcc.lines.map((l) => [l.key, l])),
    [lcc],
  )

  if (!costs) return null
  const { coverage } = lcc

  return (
    <section className="cf">
      <header className="cf-h">
        <h3 className="tm-sec">{t('cf.title')}</h3>
        <span>{t('cf.sub')}</span>
      </header>

      {/* 완성도 — 색이 아니라 명도로 확보/참조/미확보를 가른다 */}
      <div className="cf-ready">
        <div className="cf-bar" aria-hidden="true">
          <i className="ok" style={{ flex: coverage.confirmed }} />
          <i className="warn" style={{ flex: coverage.estimate }} />
          <i className="gap" style={{ flex: coverage.missing }} />
        </div>
        <div className="cf-keys">
          <span className="ok">{t('cf.confirmed', { n: coverage.confirmed })}</span>
          <span className="warn">{t('cf.estimate', { n: coverage.estimate })}</span>
          <span className="gap">{t('cf.missing', { n: coverage.missing })}</span>
          <b>{t('cf.ready', { n: coverage.ready })}</b>
        </div>
      </div>

      {/* 비용분류체계 — 논문 Fig.1 */}
      <div className="cf-tree">
        {COST_MODEL.map((branch) => (
          <div key={branch.key} className="cf-br">
            <h4>{tx(branch.label)}</h4>
            {branch.groups.map((g) => (
              <div key={g.key} className="cf-g">
                <span className="cf-gl">{tx(g.label)}</span>
                <ul>
                  {g.items.map((it) => {
                    const st = byKey[it.key]?.status ?? 'missing'
                    return (
                      <li key={it.key} className={STATUS[st].tone}>
                        <span className="nm">{tx(it.label)}</span>
                        <span className="tag">{tx(STATUS[st].label)}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="cf-note">{t('cf.note')}</p>
    </section>
  )
}
