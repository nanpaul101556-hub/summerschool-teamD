/** 재사용 UI 조각. 화면 전체가 같은 규칙으로 조판되도록 여기에 모은다. */

import { SOURCES } from '../../data/sources'

export function Panel({ children, className = '', style }) {
  return <div className={`panel ${className}`} style={style}>{children}</div>
}

export function Section({ no, title, children }) {
  return (
    <section className="sec">
      <h2>{no && <i>{no}</i>}{title}</h2>
      {children}
    </section>
  )
}

/**
 * 출처 태그. grade 1(추정)이면 경고색으로 구분한다.
 * 정보 비대칭 해소가 목적이므로 출처 표기는 장식이 아니라 기능이다.
 */
export function SourceTag({ id }) {
  const s = SOURCES[id]
  if (!s) return null
  return (
    <span className={`src ${s.grade === 1 ? 'g1' : ''}`} title={s.label}>
      {s.grade === 1 ? '⚠ 추정' : <><b>출처</b> {s.year ?? ''}</>}
    </span>
  )
}

export function Stat({ label, value, unit, note, tone = '', src }) {
  const missing = value == null || value === '미확보'
  return (
    <div className={`stat ${missing ? 'missing' : tone}`}>
      <div className="k">{label}</div>
      <div className="v">
        {missing ? '미확보' : value}
        {!missing && unit && <em>{unit}</em>}
      </div>
      {note && <div className="n">{note}{src && <SourceTag id={src} />}</div>}
    </div>
  )
}

export function Badge({ tone = 'keep', children }) {
  return <span className={`badge ${tone}`}>{children}</span>
}

export function YearSlider({ year, onChange, min = 2024, max = 2050 }) {
  return (
    <div className="slider">
      <div className="top">
        <span>기준 연도</span>
        <span className="yr">{year}</span>
      </div>
      <input type="range" min={min} max={max} step="1" value={year}
        aria-label="기준 연도" onChange={(e) => onChange(Number(e.target.value))} />
      <div className="ticks"><span>{min}</span><span>2035</span><span>{max}</span></div>
    </div>
  )
}

export function Chips({ items, selected, onToggle }) {
  return (
    <div className="chips">
      {items.map((it) => (
        <button key={it.key} type="button"
          className={selected.includes(it.key) ? 'on' : ''}
          aria-pressed={selected.includes(it.key)}
          onClick={() => onToggle(it.key)}>
          {it.label}
        </button>
      ))}
    </div>
  )
}

export function MissingNotice({ items }) {
  if (!items.length) return null
  return (
    <div className="warnbox">
      미확보 데이터 — {items.join(' · ')}
    </div>
  )
}
