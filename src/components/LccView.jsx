/**
 * 05 · 생애주기 — 언제 공사하면 이용이 어떻게 되는가.
 *
 * 곡선은 하나의 이야기를 한다. 손대지 않으면 계속 빠지고, 공사하면 되돌아오고,
 * 다시 빠진다. 그 톱니를 몇 번 어떤 크기로 그릴 것인가가 대안이다.
 *
 * 두 계수는 이 건물에서 실측했다 — 감쇠는 코로나 전 5년 추세, 반등은 2024년 공사
 * 뒤의 +5%p. 미래 구간은 그 둘을 반복한 예측이지 사실이 아니다.
 *
 * 곡선 위에 커서를 대면 그해가 왜 그 값인지, 무슨 근거로 반등하는지가 뜬다.
 * 근거를 감춘 예측은 그림일 뿐이다.
 */

import { useState } from 'react'

import { useLang } from '../i18n'
import { DONE, END, HISTORY, START, WORK, money, projectAll } from '../lib/lcc'
import AppFrame from './AppFrame'

const runs = projectAll()

const W = 940
const H = 380
const P = { t: 24, r: 96, b: 34, l: 40 }
const X0 = HISTORY[0].y
const Y0 = 45
const Y1 = 112

const px = (y) => P.l + ((y - X0) / (END - X0)) * (W - P.l - P.r)
const py = (v) => P.t + (1 - (v - Y0) / (Y1 - Y0)) * (H - P.t - P.b)

const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${px(p.y)},${py(p.v)}`).join(' ')

/** 커서에 뜨는 근거 상자 */
function Tip({ p, hist }) {
  const { t, tx } = useLang()
  const r = p.reason
  const bx = px(p.y) > W * 0.58 ? px(p.y) - 268 : px(p.y) + 14
  const key = hist ? 'real' : r.kind === 'work' ? 'lift' : r.kind === 'floor' ? 'floor' : 'decay'

  return (
    <foreignObject
      x={bx}
      y={Math.max(4, Math.min(py(p.v) - 24, H - 196))}
      width="254"
      height="192"
    >
      <div className={`tip ${r.kind}`} xmlns="http://www.w3.org/1999/xhtml">
        <div className="t-h">
          <b className="num">{p.y}</b>
          <span className="num">{p.v}</span>
        </div>
        <div className="t-k">{t(`lc.tip.${key}`, { n: r.lift ?? 0 })}</div>
        {r.why && <p className="t-w">{tx(r.why)}</p>}
        {r.kind === 'work' && (
          <>
            <div className="t-c">
              <span>{t('lc.tip.cost')}</span>
              <b className="num">{money(r.cost)}{t('lc.eok')}</b>
            </div>
            <ul className="t-s">
              {r.layers.map((l) => (
                <li key={l}>
                  <b>{tx(WORK[l].label)}</b>
                  {tx(WORK[l].src)}
                </li>
              ))}
            </ul>
            {r.guess && <div className="t-g">{t('lc.tip.guess')}</div>}
          </>
        )}
      </div>
    </foreignObject>
  )
}

export default function LccView({ site, onStep, onReset }) {
  const { t, tx } = useLang()
  const [on, setOn] = useState('plan')
  const [at, setAt] = useState(null)
  const cur = runs.find((r) => r.key === on) ?? runs[1]
  const none = runs.find((r) => r.key === 'none')

  /** 마우스 x → 가장 가까운 연도 */
  const move = (e) => {
    const box = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * W
    const y = Math.round(X0 + ((x - P.l) / (W - P.l - P.r)) * (END - X0))
    setAt(Math.max(X0, Math.min(END, y)))
  }

  const hist = at != null && at < START ? HISTORY.find((h) => h.y === at) : null
  const pt = at != null && at >= START ? cur.pts.find((p) => p.y === at) : null
  const show = hist ? { y: hist.y, v: hist.v, reason: { kind: 'real', why: null } } : pt

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 05</div>
        <h2>{t('lc.title')}</h2>
        <p>{t('lc.sub')}</p>
      </div>

      <section>
        <h3 className="lab">{t('lc.coefTitle')}</h3>
        <div className="lc-coef">
          <div>
            <span className="k">{t('lc.decay')}</span>
            <b className="num">−1.15%</b>
            <em>{t('lc.decaySrc')}</em>
          </div>
          <div>
            <span className="k">{t('lc.lift')}</span>
            <b className="num">+5%p</b>
            <em>{t('lc.liftSrc')}</em>
          </div>
        </div>
        <p className="note">{t('lc.coefNote')}</p>
      </section>

      <section>
        <h3 className="lab">{t('lc.costTitle')}</h3>
        <div className="lc-src">
          {Object.entries(WORK).map(([k, w]) => (
            <div key={k} className={w.guess ? 'guess' : ''}>
              <span className="n">{tx(w.label)}</span>
              <span className="v num">{money(w.cost)}{t('lc.eok')}</span>
              <em>{tx(w.src)}</em>
            </div>
          ))}
        </div>
        <p className="note">{t('lc.costNote')}</p>
      </section>

      <section>
        <h3 className="lab">{t('lc.cmpTitle')}</h3>
        <div className="lc-cmp">
          {runs.map((r) => (
            <button
              key={r.key}
              type="button"
              className={r.key === on ? 'on' : ''}
              onClick={() => setOn(r.key)}
            >
              <span className="n">{tx(r.label)}</span>
              <span className="v num">
                {r.total ? `${money(r.total)}${t('lc.eok')}` : '—'}
              </span>
              <span className="m num">{r.mean}</span>
            </button>
          ))}
        </div>
        <div className="lc-hd">
          <span>{t('lc.cost')}</span>
          <span>{t('lc.mean')}</span>
        </div>
      </section>

      <section>
        <h3 className="lab">{t('lc.gapTitle')}</h3>
        <p className="note">{t('lc.gapBody')}</p>
      </section>
    </>
  )

  return (
    <AppFrame stage="lcc" site={site} onStep={onStep} onReset={onReset} side={side} scroll>
      <div className="lc">
        <div className="sh-h">
          <h3>{t('lc.chartTitle')}</h3>
          <span>{t('lc.chartSub')}</span>
        </div>

        <svg
          className="lc-c"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t('lc.chartTitle')}
          onPointerMove={move}
          onPointerLeave={() => setAt(null)}
        >
          {/* 격자 */}
          {[60, 80, 100].map((v) => (
            <g key={v}>
              <line className="g" x1={P.l} y1={py(v)} x2={W - P.r} y2={py(v)} />
              <text className="tick" x={P.l - 6} y={py(v) + 3} textAnchor="end">{v}</text>
            </g>
          ))}
          {[2020, 2030, 2040, 2050, 2060].map((y) => (
            <text key={y} className="tick num" x={px(y)} y={H - 12} textAnchor="middle">{y}</text>
          ))}

          {/* 실측 / 예측 경계 */}
          <line className="split" x1={px(START)} y1={P.t} x2={px(START)} y2={H - P.b} />
          <text className="band" x={px(START) - 8} y={P.t + 11} textAnchor="end">{t('lc.real')}</text>
          <text className="band" x={px(START) + 8} y={P.t + 11}>{t('lc.pred')}</text>

          {/* 실측 곡선 */}
          <path className="hist" d={line(HISTORY)} />
          {HISTORY.map((p) => (
            <circle key={p.y} className="hp" cx={px(p.y)} cy={py(p.v)} r="2.4" />
          ))}

          {/* 이미 한 공사 */}
          <g className="done">
            <line x1={px(DONE.year)} y1={py(63)} x2={px(DONE.year)} y2={H - P.b} />
            <text x={px(DONE.year)} y={py(63) - 8} textAnchor="middle">
              {DONE.year} · {money(DONE.cost)}{t('lc.eok')}
            </text>
          </g>

          {/* 시나리오 */}
          {runs.map((r) => (
            <path
              key={r.key}
              className={`sc ${r.key === on ? 'on' : ''} ${r.key === 'none' ? 'none' : ''}`}
              d={line(r.pts)}
            />
          ))}

          {/* 선택한 안의 공사 시점 */}
          {cur.works.map((w) => {
            const p = cur.pts.find((x) => x.y === w.year)
            return (
              <g key={w.year} className="mk">
                <line x1={px(w.year)} y1={py(p.v)} x2={px(w.year)} y2={H - P.b} />
                <circle cx={px(w.year)} cy={py(p.v)} r="4" />
              </g>
            )
          })}

          {/* 끝점 라벨 */}
          {runs.map((r) => (
            <text
              key={r.key}
              className={`end ${r.key === on ? 'on' : ''}`}
              x={W - P.r + 8}
              y={py(r.end) + 3}
            >
              {tx(r.label)}
            </text>
          ))}

          {show && (
            <g className="cur">
              <line x1={px(show.y)} y1={P.t} x2={px(show.y)} y2={H - P.b} />
              <circle cx={px(show.y)} cy={py(show.v)} r="5" />
            </g>
          )}
          {show && <Tip p={show} hist={!!hist} />}
        </svg>

        <div className="lc-hint">{t('lc.hint')}</div>

        <div className="lc-read">
          <p>{tx(cur.note)}</p>
        </div>

        <section className="lc-tbl">
          <div className="sh-h">
            <h3>{t('lc.tblTitle')}</h3>
            <span>{t('lc.tblSub')}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>{t('lc.sc')}</th>
                <th>{t('lc.works')}</th>
                <th>{t('lc.cost')}</th>
                <th>{t('lc.mean')}</th>
                <th>{t('lc.endv')}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.key} className={r.key === on ? 'on' : ''}>
                  <td>{tx(r.label)}</td>
                  <td className="num">{r.works.length}</td>
                  <td className="num">{r.total ? money(r.total) : '—'}</td>
                  <td className="num">{r.mean}</td>
                  <td className="num">{r.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note">{t('lc.tblNote', { n: none.mean })}</p>
        </section>

        <section className="lc-end">
          <h2>{t('lc.endH')}</h2>
          <p>{t('lc.endB')}</p>
        </section>
      </div>
    </AppFrame>
  )
}
