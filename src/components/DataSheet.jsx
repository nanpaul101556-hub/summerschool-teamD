/**
 * 근거 시트 — 카드를 누르면 그 수치가 어디서 나왔는지 펼친다.
 *
 * 상위계획에서 조항을 누르면 원문 페이지가 뜨듯, 정량 근거에서도
 * 원자료 몇 줄과 계산 과정이 보여야 한다. 「앞 정류장」이 어디인지는
 * 말로 설명하는 것보다 지도에 찍는 편이 빠르다.
 */

import { useEffect } from 'react'

import { PLACES, REPO, sheetOf } from '../data/sheets'
import { useLang } from '../i18n'
import StopMap from './StopMap'

/**
 * 자릿수를 맞출 칸만 오른쪽으로 — 부서명·분야명까지 밀리면 표가 읽히지 않는다.
 * 첫 칸은 숫자처럼 생겼어도(202104 · 11367) 행을 여는 열쇠이므로 왼쪽에 둔다.
 */
const isNum = (v, i) => i > 0 && /^-?[\d,]+(\.\d+)?$/.test(String(v).trim())

export default function DataSheet({ id, onClose }) {
  const { t, tx } = useLang()
  const s = sheetOf(id)

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  if (!s) return null

  return (
    <div className="dsh" role="dialog" aria-modal="true" aria-label={tx(s.title)}>
      <header>
        <div>
          <span className="l">{t('ev.sheet')}</span>
          <b>{tx(s.title)}</b>
          {s.sample && (
            <>
              <span className="samp">{t('ev.sample')}</span>
              <span className="samp-h">{t('ev.sampleHint')}</span>
            </>
          )}
        </div>
        <button type="button" onClick={onClose} aria-label={t('plan.close')}>×</button>
      </header>

      <div className="dsh-b">
        <div className="dsh-l">
          {s.map && (
            <section className="dsh-map">
              <StopMap />
              <ul className="mm-l">
                {PLACES.filter((p) => p.note).map((p) => (
                  <li key={p.id} className={p.lead ? 'lead' : ''}>
                    <b>{tx(p.label)}</b>
                    <span className="sub">{p.sub} · {p.addr}</span>
                    <span className="n">{tx(p.note)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="lab">{t('ev.what')}</h3>
            <p className="dsh-p">{tx(s.where)}</p>
          </section>

          {s.rows && (
            <section>
              <h3 className="lab">{t('ev.raw')}</h3>
              {/*
                원자료는 표계산기처럼 보인다 — 열 문자와 행 번호를 붙이고 격자를 긋는다.
                「우리가 정리한 표」가 아니라 「파일을 그대로 연 것」으로 읽혀야
                근거로 받아들여지기 때문이다. 1행이 머리글, 자료는 2행부터다.
              */}
              <div className="xl">
                <table className="xl-t">
                  <thead>
                    <tr className="xl-ab">
                      <th className="xl-c" />
                      {s.cols.map((c, i) => (
                        <th key={`ab-${c}`}>{String.fromCharCode(65 + i)}</th>
                      ))}
                    </tr>
                    <tr className="xl-hd">
                      <th className="xl-c">1</th>
                      {s.cols.map((c, i) => (
                        <th key={c} className={isNum(s.rows[0][i], i) ? 'num' : ''}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.rows.map((r, ri) => (
                      <tr key={r.join('|')}>
                        <th className="xl-c">{ri + 2}</th>
                        {r.map((c, i) => (
                          <td key={`${r[0]}-${i}`} className={isNum(c, i) ? 'num' : ''}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {s.sample && <div className="samp-warn">{t('ev.sampleWarn')}</div>}
              {s.rowNote && <p className="note">{tx(s.rowNote)}</p>}
            </section>
          )}
        </div>

        <div className="dsh-r">
          <section>
            <h3 className="lab">{t('ev.calc')}</h3>
            <ol className="dsh-c">
              {s.calc.map((c) => <li key={tx(c)}>{tx(c)}</li>)}
            </ol>
          </section>

          <section>
            <h3 className="lab">{t('ev.origin')}</h3>
            <div className="dsh-s">
              <div>
                <span className="k">{t('ev.rawSrc')}</span>
                <span className="v">{tx(s.src.raw)}</span>
              </div>
              {s.src.file && (
                <div>
                  <span className="k">{t('ev.fileSrc')}</span>
                  <span className="v mono">{s.src.file}</span>
                </div>
              )}
              {s.src.script && (
                <div>
                  <span className="k">{t('ev.scriptSrc')}</span>
                  <span className="v mono">{s.src.script}</span>
                </div>
              )}
            </div>
            <a className="dsh-repo" href={REPO} target="_blank" rel="noreferrer">
              {t('ev.repo')}
            </a>
          </section>

          {s.limit && (
            <section>
              <h3 className="lab">{t('ev.limit')}</h3>
              <p className="note">{tx(s.limit)}</p>
            </section>
          )}

          {s.missing && <div className="dsh-miss">{t('ev.missNote')}</div>}
        </div>
      </div>
    </div>
  )
}
