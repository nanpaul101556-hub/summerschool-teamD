/**
 * 앱 셸 — 상단 스텝바 · 좌측 스테이지 · 우측 패널.
 *
 * 화면을 꽉 채운다. 단계 이동은 상단 스텝바가 맡으므로 각 화면은
 * 내용만 신경 쓰면 된다.
 */

import { useLang } from '../i18n'
import Arrow from './Arrow'

export const STEPS = [
  { key: 'site', no: '01' },
  { key: 'region', no: '02' },
  { key: 'options', no: '03' },
  { key: 'rhino', no: '04' },
  { key: 'future', no: '05' },
]

export default function AppFrame({
  stage,
  site,
  onStep,
  onReset,
  side,
  children,
  scroll = false,
  next,
}) {
  const { t, lang, setLang, langs } = useLang()
  const i = STEPS.findIndex((s) => s.key === stage)

  return (
    <div className="app">
      <header className="topbar">
        <div className="tb-brand">
          <b>{t('app.brand')}</b>
          <span>{t('app.team')}</span>
        </div>

        <nav className="steps" aria-label="steps">
          {STEPS.map((s, k) => (
            <button
              key={s.key}
              type="button"
              className={`stp ${s.key === stage ? 'on' : ''}`}
              onClick={() => onStep(s.key)}
              aria-current={s.key === stage ? 'step' : undefined}
              // 앞 단계를 건너뛰면 근거 없이 결론으로 가게 된다
              disabled={k > i + 1}
            >
              <span className="stp-n num">{s.no}</span>
              <span className="stp-l">{t(`step.${s.key}`)}</span>
            </button>
          ))}
        </nav>

        <div className="tb-lang">
          {langs.map((l) => (
            <button
              key={l.key}
              type="button"
              className={lang === l.key ? 'on' : ''}
              onClick={() => setLang(l.key)}
              aria-pressed={lang === l.key}
              title={l.label}
            >
              {l.short}
            </button>
          ))}
        </div>

        {site && (
          <div className="tb-site">
            <span className="nm">{site.name}</span>
            <button type="button" onClick={onReset}>
              {t('app.changeSite')}
            </button>
          </div>
        )}
      </header>

      <div className="body">
        <div className={`stage ${scroll ? 'scroll' : ''}`}>{children}</div>

        <aside className="side">
          {side}
          {next && (
            <button
              type="button"
              className="go-next"
              onClick={next.onClick}
              disabled={next.disabled}
            >
              <span>{next.label}</span>
              <Arrow />
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}
