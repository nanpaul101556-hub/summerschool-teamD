/**
 * 무엇으로 「만족한다」를 재는가 — 03 의 머리.
 *
 * 다섯 갈래가 왜 다섯인지를 화면이 한 번도 말하지 않고 있었다.
 * 카드마다 같은 틀이 반복되는데 그 틀을 설명한 적이 없으니,
 * 보는 사람이 다섯 번 반복해서 스스로 알아내야 했다.
 *
 * 여기서 한 번에 말한다 — 세 층위로 묶고, 갈래를 누르면
 * 무엇을 재고 왜 그것이 만족의 신호인지, 무엇을 못 말하는지가 펼쳐진다.
 */

import { useState } from 'react'

import { CARDS } from '../data/evidence'
import { FRAME, LAYERS, WHY } from '../data/method'
import { useLang } from '../i18n'

const GRADE = { have: 'verified', missing: 'collecting', flat: 'hypothesis' }
const cardOf = (id) => CARDS.find((c) => c.id === id)

export default function MethodMap() {
  const { t, tx } = useLang()
  const [open, setOpen] = useState(null)

  const shown = open && WHY[open]
  const card = open && cardOf(open)

  return (
    <section className="mm2">
      <header>
        <h3>{t('mm.title')}</h3>
        <p>{t('mm.sub')}</p>
      </header>

      {/* ── 세 층위 · 한 줄 다섯 칸 ─────────────── */}
      <div className="mm2-l">
        {LAYERS.map((lv) => (
          <div key={lv.id} className={`mm2-hd ${lv.id}`}>
            <b>{tx(lv.label)}</b>
            <span>{tx(lv.lead)}</span>
          </div>
        ))}

        {LAYERS.flatMap((lv) => lv.axes).map((id) => {
          const c = cardOf(id)
          if (!c) return null
          const g = GRADE[c.status] || 'hypothesis'
          return (
            <button
              key={id}
              type="button"
              className={`mm2-ax ${g}${open === id ? ' on' : ''}`}
              onClick={() => setOpen(open === id ? null : id)}
            >
              <em className="num">{c.no}</em>
              <b>{tx(WHY[id].name)}</b>
              <span className="q">{tx(WHY[id].short)}</span>
              <span className={`g ${g}`}>{t(`tj.g.${g}`)}</span>
            </button>
          )
        })}
      </div>

      {/* ── 고른 갈래의 사슬 ─────────────────────── */}
      {shown ? (
        <div className="mm2-d">
          <div className="mm2-d-h">
            <em className="num">{card.no}</em>
            <b>{tx(card.title)}</b>
          </div>
          <dl>
            <dt>{t('mm.measures')}</dt>
            <dd>{tx(shown.measures)}</dd>
            <dt>{t('mm.why')}</dt>
            <dd className="lead">{tx(shown.why)}</dd>
          </dl>
        </div>
      ) : (
        <p className="mm2-hint">{t('mm.hint')}</p>
      )}

      {/* ── 같은 자를 댄다 ───────────────────────── */}
      <div className="mm2-f">
        <h4>{tx(FRAME.head)}</h4>
        <ol>
          {FRAME.steps.map((s) => <li key={tx(s)}>{tx(s)}</li>)}
        </ol>
        <p>{tx(FRAME.close)}</p>
      </div>
    </section>
  )
}
