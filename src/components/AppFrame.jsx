/**
 * 앱 셸 — 상단 스텝바 · 좌측 스테이지 · 우측 패널.
 *
 * 화면을 꽉 채운다. 단계 이동은 상단 스텝바가 맡으므로 각 화면은
 * 내용만 신경 쓰면 된다.
 */

import { useLang } from '../i18n'
import Arrow from './Arrow'

/**
 * v2 — 근거를 쌓아 판정에 이르는 네 단계.
 *
 *   01 어디인가 → 02 무엇에 의거하는가 → 03 자료는 무엇을 말하는가 → 04 그래서 어떻게 짓는가
 *
 * 모델링 연결과 이미지 생성은 v1 에서 뺐다. 논리가 서기 전에 형태를 보여 주면
 * 형태가 논리를 대신하게 된다. 코드는 남아 있으니 필요할 때 되살릴 수 있다.
 */
export const STEPS = [
  { key: 'site', no: '01' },
  { key: 'plan', no: '02' },
  { key: 'data', no: '03' },
  { key: 'verdict', no: '04' },
  { key: 'lcc', no: '05' },
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
