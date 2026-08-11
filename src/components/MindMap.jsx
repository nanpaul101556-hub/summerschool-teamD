/**
 * 상위계획 마인드맵 — 무엇이 무엇에서 나왔는가.
 *
 * 세 계획이 각각 조항을 내고, 그 조항이 「무엇에서 무엇으로」를 낳는다.
 * 스크롤로 훑으면 순서만 보이고 연결은 안 보인다. 한 화면에 펼쳐야
 * 어느 조항이 어느 방향을 떠받치는지가 눈에 들어온다.
 *
 * 방향에서 끊으면 「좋은 말이네」로 끝난다. 그래서 칸을 하나 더 붙인다 —
 * 그 방향을 세 낱말로 줄이고, 그것이 우리에게 시키는 일을 한 줄로 받는다.
 */

import { useEffect } from 'react'

import { dutyOf, LEVELS } from '../data/upperPlans'
import { useLang } from '../i18n'

const W = 1400
const ROW = 44          // 잎 하나의 높이
const GAP = 26          // 계획 사이 여백
const PAD = 28

const X = { site: 36, plan: 196, quote: 400, shift: 700, duty: 1080 }

/** 계획마다 조항 수와 방향 수 중 큰 쪽이 그 가지의 높이를 정한다 */
function layout() {
  let y = PAD
  const out = LEVELS.map((lv) => {
    const rows = Math.max(lv.trends.length, lv.shifts.length)
    const h = rows * ROW
    const box = { lv, top: y, h, mid: y + h / 2 }
    y += h + GAP
    return box
  })
  return { boxes: out, height: y + PAD }
}

const { boxes, height: H } = layout()

/** 좌우로 흐르는 베지어 */
const wire = (x1, y1, x2, y2) => {
  const d = Math.max(24, (x2 - x1) * 0.5)
  return `M${x1},${y1} C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`
}

export default function MindMap({ site, onClose }) {
  const { t, tx } = useLang()

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const midY = H / 2

  return (
    <div className="mm" role="dialog" aria-modal="true" aria-label={t('plan.mapTitle')}>
      <header className="mm-h">
        <div>
          <b>{t('plan.mapTitle')}</b>
          <span>{t('plan.mapSub')}</span>
        </div>
        <button type="button" onClick={onClose} aria-label={t('plan.close')}>×</button>
      </header>

      <div className="mm-b">
        <svg viewBox={`0 0 ${W} ${H}`} className="mm-svg">
          {/* 대상지 → 계획 */}
          {boxes.map((b) => (
            <path
              key={`w-${b.lv.id}`}
              className="mw"
              d={wire(X.site + 128, midY, X.plan, b.mid)}
            />
          ))}

          {/* 계획 → 조항, 조항 → 방향 */}
          {boxes.map((b) => (
            <g key={`g-${b.lv.id}`}>
              {b.lv.trends.map((tr, i) => (
                <path
                  key={tr.id}
                  className={`mw ${tr.lead ? 'lead' : ''}`}
                  d={wire(X.plan + 180, b.mid, X.quote, b.top + ROW * i + ROW / 2)}
                />
              ))}
              {b.lv.shifts.map((sh, i) => (
                <path
                  key={tx(sh.to)}
                  className="mw thin"
                  d={wire(X.quote + 270, b.top + ROW * Math.min(i, b.lv.trends.length - 1) + ROW / 2,
                    X.shift, b.top + ROW * i + ROW / 2)}
                />
              ))}
              <path className="mw thin" d={wire(X.shift + 330, b.mid, X.duty, b.mid)} />
            </g>
          ))}

          {/* 대상지 */}
          <foreignObject x={X.site} y={midY - 34} width="150" height="68">
            <div className="mm-site" xmlns="http://www.w3.org/1999/xhtml">
              <span>{t('plan.from')}</span>
              <b>{tx(site?.nameTx ?? site?.name ?? { ko: '대상지', en: 'Site', it: 'Sito' })}</b>
            </div>
          </foreignObject>

          {/* 계획 · 조항 · 방향 */}
          {boxes.map((b) => (
            <g key={`n-${b.lv.id}`}>
              <foreignObject x={X.plan} y={b.mid - 30} width="190" height="60">
                <div className="mm-plan" xmlns="http://www.w3.org/1999/xhtml">
                  <span className="sc">{tx(b.lv.scope)}</span>
                  <b>{tx(b.lv.doc)}</b>
                </div>
              </foreignObject>

              {b.lv.trends.map((tr, i) => (
                <foreignObject
                  key={tr.id}
                  x={X.quote}
                  y={b.top + ROW * i + 3}
                  width="270"
                  height={ROW - 6}
                >
                  <div className={`mm-q ${tr.lead ? 'lead' : ''}`} xmlns="http://www.w3.org/1999/xhtml">
                    <b>{tx(tr.label)}</b>
                    <em className="num">p.{tr.p}</em>
                  </div>
                </foreignObject>
              ))}

              {b.lv.shifts.map((sh, i) => (
                <foreignObject
                  key={tx(sh.to)}
                  x={X.shift}
                  y={b.top + ROW * i + 3}
                  width="330"
                  height={ROW - 6}
                >
                  <div className="mm-s" xmlns="http://www.w3.org/1999/xhtml">
                    <span className="a">{tx(sh.from)}</span>
                    <i>→</i>
                    <span className="b">{tx(sh.to)}</span>
                  </div>
                </foreignObject>
              ))}

              <foreignObject x={X.duty} y={b.mid - 54} width="300" height="108">
                <div className="mm-d" xmlns="http://www.w3.org/1999/xhtml">
                  <span className="w">
                    {dutyOf(b.lv.id).words.map((wd) => (
                      <i key={tx(wd)}>{tx(wd)}</i>
                    ))}
                  </span>
                  <b>{tx(dutyOf(b.lv.id).act)}</b>
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>

      <footer className="mm-f">
        <span className="l">{t('plan.mapCol1')}</span>
        <span className="l">{t('plan.mapCol2')}</span>
        <span className="l">{t('plan.mapCol3')}</span>
        <span className="l">{t('plan.mapCol4')}</span>
        <span className="l">{t('plan.mapCol5')}</span>
      </footer>
    </div>
  )
}
