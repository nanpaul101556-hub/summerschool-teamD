/**
 * 05 · 시간 변화 — 무엇이 남고 무엇이 바뀌는가.
 * 세 장을 나란히 놓는 것 자체가 논지다. 프레임은 같고 채움만 다르다.
 */

import { useEffect, useState } from 'react'

import { FUTURES, KEPT } from '../data/futures'
import { SITE } from '../data/site'
import { buildOptions } from '../lib/options'
import AppFrame from './AppFrame'

export default function FutureView({ site, picked, onStep, onReset }) {
  const [open, setOpen] = useState(null)

  // 04 에서 고른 대안의 사양을 그대로 쓴다 — 화면끼리 어긋나지 않게
  const options = buildOptions(SITE.plannedArea)
  const option = options.find((o) => o.key === picked) ?? options[options.length - 1]
  const spec = option.spec

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const side = (
    <>
      <div className="side-h">
        <div className="n">Step 05</div>
        <h2>세 시점 내내 그대로</h2>
        <p>대안 {option.key} 기준 · 이 네 값은 나중에 바꿀 수 없습니다</p>
      </div>

      <section>
        <div className="kv">
          {KEPT.map((k) => (
            <div key={k.k}>
              <span className="k">{k.k}</span>
              <span className="v num">
                {k.unit === 'm' ? spec[k.from].toFixed(1) : spec[k.from]}
                <em> {k.unit}</em>
              </span>
            </div>
          ))}
        </div>
        <p className="note">
          그래서 처음부터 가장 무거운 용도에 맞춰 잡아 둡니다. 그 「여유」의 대가로
          50년 뒤 무엇이 오든 받아낼 수 있습니다.
        </p>
      </section>

      <section>
        <h3 className="lab">시점별 용도</h3>
        <div className="rows">
          {FUTURES.map((f) => (
            <div key={f.key}>
              <span className="n">
                {f.after} · {f.year}
                <br />
                <span className="sub">{f.use}</span>
              </span>
              <span className="m">{f.certainty === 'unknown' ? '예측 안 함' : '근거 있음'}</span>
            </div>
          ))}
        </div>
        <p className="note">
          인구추계는 공표 자료라 단언하고, 먼 미래는 예측하지 않습니다.
        </p>
      </section>
    </>
  )

  return (
    <AppFrame stage="future" site={site} onStep={onStep} onReset={onReset} side={side}>
      <div className="futures">
        {FUTURES.map((f) => (
          <article key={f.key} className="fu">
            <button
              type="button"
              className="fu-img"
              onClick={() => setOpen(f)}
              aria-label={`${f.after} 크게 보기`}
            >
              <img src={f.img} alt={`${f.after} · ${f.use}`} loading="lazy" />
              <span className="fu-yr num">{f.after}</span>
            </button>

            <div className="fu-body">
              <div className="fu-use">
                {f.use}
                {f.certainty === 'unknown' && <span className="tag">예측 안 함</span>}
              </div>
              <div className="fu-yn num">{f.year}</div>
              <p className="fu-basis">{f.basis}</p>
              <div className="fu-in">
                <span className="fu-k">바뀌는 것</span>
                {f.infill}
              </div>
            </div>
          </article>
        ))}
      </div>

      {open && (
        <div
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.after} · ${open.use}`}
          onClick={() => setOpen(null)}
        >
          <img src={open.img} alt={`${open.after} · ${open.use}`} />
          <div className="lb-cap">
            <b>{open.after} · {open.year}</b> {open.use}
          </div>
          <button type="button" className="lb-x" aria-label="닫기">닫기</button>
        </div>
      )}
    </AppFrame>
  )
}
