/**
 * 05 생애주기 필름 — 스크롤이 곧 시간인 영상.
 *
 * 곡선(ValueCurve)을 누르면 열린다. 재생 버튼이 없다. 스크롤 한 칸이 한 프레임이라
 * 보는 사람이 시간을 직접 쥔다 — 빨리 보고 싶으면 빨리 굴리고, 창틀을 들여다보고
 * 싶으면 거기서 멈춘다. 발표장에서 「여기」라고 말하며 멈출 수 있어야 한다.
 *
 * 구조는 하나뿐이다. 세로로 긴 레일 안에 화면 하나가 sticky 로 붙어 있고,
 * 레일을 굴린 만큼이 video.currentTime 이 된다. 프레임 중앙을 찍어 경계에서
 * 그림이 떨리지 않게 한다.
 *
 * 영상은 키프레임을 4프레임마다 박아 두었다(public/lifefilm.mp4). 그래야 어느
 * 지점을 찍어도 디코더가 바로 그 그림을 낸다 — 일반 인코딩이면 앞 키프레임까지
 * 되감느라 스크럽이 끈적해진다.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { CHAPTERS, FILM } from '../data/lifefilm'
import { useLang } from '../i18n'

const LAST_FRAME = FILM.frames - 1
const N = CHAPTERS.length

/** 장 하나에 주는 스크롤 길이(dvh). 길수록 프레임 사이가 벌어져 부드럽게 넘어간다 */
const RAIL_PER_CH = 150

/**
 * 목표 시각을 쫓아가는 비율. 1이면 스크롤에 딱 붙고(=점프), 낮을수록 미끄러진다.
 * 휠 한 틱이 열 프레임을 건너뛰어도 그 사이를 훑고 지나가게 하는 값.
 */
const EASE = 0.22

/**
 * 장마다 스크롤을 얼마나 나눠 줄 것인가.
 *
 * 똑같이 한 화면씩 주면 짧은 장과 긴 장의 「프레임당 스크롤」이 세 배까지 벌어진다 —
 * 같은 속도로 굴려도 어떤 장은 뚝뚝 뛰고 어떤 장은 굼뜨다.
 * 그렇다고 길이에 그대로 비례시키면 짧은 장이 순식간에 지나가 자막을 읽을 틈이 없다.
 * 둘을 반씩 섞는다 — 자막 읽을 시간은 지키면서 프레임 밀도는 고르게.
 */
const MIX = 0.5
const SPANS = CHAPTERS.map((c) => c.b - c.a)
const TOTAL = SPANS.reduce((a, b) => a + b, 0)
const WEIGHTS = SPANS.map((s) => MIX / N + (1 - MIX) * (s / TOTAL))

/** 각 장이 시작하는 스크롤 위치 — [0, w0, w0+w1, …, 1] */
const EDGES = WEIGHTS.reduce((acc, w) => [...acc, acc[acc.length - 1] + w], [0])

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

/** 스크롤 위치(0~1) → 장 번호와 그 장 안에서의 시각(초) */
const at = (p) => {
  let i = N - 1
  for (let k = 0; k < N; k += 1) {
    if (p < EDGES[k + 1]) { i = k; break }
  }
  const c = CHAPTERS[i]
  const u = clamp((p - EDGES[i]) / WEIGHTS[i], 0, 1)
  return { i, time: c.a + (c.b - c.a) * u }
}

const toFrame = (time) => clamp(Math.round(time * FILM.fps - 0.5), 0, LAST_FRAME)

export default function LifeFilm({ onClose }) {
  const { t, tx } = useLang()

  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const videoRef = useRef(null)

  /** 렌더를 부르지 않는 값들 — 스크롤마다 setState 하면 초당 60번 그린다 */
  const frameRef = useRef(-1)
  const pendingRef = useRef(null)
  const rafRef = useRef(0)

  /** 스크롤이 정한 목표 시각과, 지금 실제로 보여 주고 있는 시각 */
  const targetRef = useRef(0)
  const curRef = useRef(0)
  const easeRef = useRef(0)

  /** 프레임 숫자는 초당 수십 번 바뀐다 — state 로 두면 그때마다 자막까지 다시 그린다 */
  const counterRef = useRef(null)

  const [chapter, setChapter] = useState(0)
  const [ready, setReady] = useState(false)
  const [moved, setMoved] = useState(false)

  /**
   * 찍고 싶은 시각을 예약한다.
   * 이전 탐색이 끝나기 전에 또 찍으면 브라우저가 밀린 요청을 쌓아 뒤늦게 따라온다.
   * 진행 중이면 마지막 하나만 남겨 두었다가 seeked 에서 이어 찍는다.
   */
  const seek = useCallback((time) => {
    const v = videoRef.current
    if (!v) return
    if (v.seeking) {
      pendingRef.current = time
      return
    }
    pendingRef.current = null
    v.currentTime = time
  }, [])

  /** 지금 시각에 해당하는 프레임을 띄운다. 같은 프레임이면 건드리지 않는다 */
  const show = useCallback((time) => {
    const frame = toFrame(time)
    if (frame === frameRef.current) return
    frameRef.current = frame

    /** 프레임 중앙 — 경계를 찍으면 앞뒤 프레임이 번갈아 나온다 */
    seek((frame + 0.5) / FILM.fps)
    if (counterRef.current) {
      counterRef.current.textContent = t('lf.frame', { n: frame + 1, total: FILM.frames })
    }
  }, [seek, t])

  /**
   * 목표 시각을 향해 한 프레임씩 다가간다.
   * 스크롤을 크게 굴려도 그 구간을 훑고 지나가므로 장면이 튀지 않는다.
   * 한 프레임 안쪽으로 좁혀지면 붙이고 루프를 끝낸다 — 계속 돌 이유가 없다.
   */
  const tick = useCallback(() => {
    easeRef.current = 0
    const gap = targetRef.current - curRef.current

    if (Math.abs(gap) < 1 / FILM.fps) {
      curRef.current = targetRef.current
    } else {
      curRef.current += gap * EASE
      easeRef.current = requestAnimationFrame(tick)
    }
    show(curRef.current)
  }, [show])

  const apply = useCallback(() => {
    rafRef.current = 0
    const el = scrollRef.current
    const root = rootRef.current
    if (!el || !root) return

    const max = el.scrollHeight - el.clientHeight
    const p = max > 0 ? clamp(el.scrollTop / max, 0, 1) : 0
    root.style.setProperty('--p', p.toFixed(4))

    const { i, time } = at(p)
    setChapter(i)
    targetRef.current = time
    if (!easeRef.current) easeRef.current = requestAnimationFrame(tick)
  }, [tick])

  /**
   * 스크롤은 React 합성 이벤트가 아니라 DOM 에 직접 건다.
   * 초당 수십 번 오는 이벤트라 passive 로 걸어 스크롤을 막지 않게 하고,
   * 실제 그리기는 다음 프레임에 한 번만 한다.
   */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return undefined
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(apply)
      setMoved(true)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [apply])

  /** 장의 머리는 그 장에 배분된 몫이 시작되는 자리다 */
  const goto = useCallback((i) => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    el.scrollTo({ top: Math.ceil(EDGES[i] * max) + (i ? 1 : 0), behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    scrollRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (easeRef.current) cancelAnimationFrame(easeRef.current)
    }
  }, [onClose])

  const onSeeked = useCallback(() => {
    if (pendingRef.current != null) seek(pendingRef.current)
  }, [seek])

  const onLoaded = useCallback(() => {
    setReady(true)
    frameRef.current = -1
    apply()
  }, [apply])

  const ch = CHAPTERS[chapter]

  /**
   * body 에 직접 붙인다. 05 화면의 스테이지 안에 두면 그 컨테이너의 스크롤·오버플로에
   * 갇혀 fixed 가 화면 전체를 덮지 못한다.
   */
  return createPortal(
    <div className="lf" ref={rootRef} role="dialog" aria-modal="true" aria-label={t('lf.title')}>
      <div className="lf-scroll" ref={scrollRef} tabIndex={-1}>
        <div className="lf-rail" style={{ height: `${N * RAIL_PER_CH + 100}dvh` }}>
          <div className="lf-stage">
            <video
              ref={videoRef}
              className="lf-v"
              src={FILM.src}
              poster={FILM.poster}
              preload="auto"
              muted
              playsInline
              disablePictureInPicture
              onLoadedData={onLoaded}
              onSeeked={onSeeked}
              aria-hidden="true"
            />
            <div className="lf-veil" aria-hidden="true" />

            {/* ── 머리 ─────────────────────────────────── */}
            <header className="lf-top">
              <div className="lf-id">
                <b>{t('lf.title')}</b>
                <span>{t('lf.sub')}</span>
              </div>
              <button type="button" className="lf-x" onClick={onClose}>
                {t('lf.close')}
                <i aria-hidden="true">esc</i>
              </button>
            </header>

            {/* ── 자막 — 장이 바뀔 때만 다시 그린다 ─────── */}
            <div className="lf-cap" key={ch.id}>
              <span className="lf-k">{tx(ch.kicker)}</span>
              <h3>{tx(ch.title)}</h3>
              <p>{tx(ch.body)}</p>
              <dl className="lf-rows">
                {ch.rows.map((r) => (
                  <div key={tx(r.k)}>
                    <dt>{tx(r.k)}</dt>
                    <dd className={r.v == null ? 'gap num' : 'num'}>
                      {r.v == null ? t('lf.noRate') : tx(r.v)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="lf-foot">{tx(ch.foot)}</p>
            </div>

            {/* ── 발 — 장 이동 · 프레임 · 진행 ──────────── */}
            <footer className="lf-bot">
              <nav className="lf-chs" aria-label={t('lf.title')}>
                {CHAPTERS.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    className={i === chapter ? 'on' : ''}
                    onClick={() => goto(i)}
                    aria-current={i === chapter ? 'true' : undefined}
                  >
                    <em className="num">{String(i + 1).padStart(2, '0')}</em>
                    <span>{tx(c.kicker)}</span>
                  </button>
                ))}
              </nav>

              <div className="lf-meter">
                <span className="num" ref={counterRef}>
                  {t('lf.frame', { n: 1, total: FILM.frames })}
                </span>
                <div className="lf-bar"><i /></div>
              </div>
            </footer>

            {!moved && <div className="lf-hint">{t('lf.hint')}</div>}
            {!ready && <div className="lf-load">{t('lf.loading')}</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
