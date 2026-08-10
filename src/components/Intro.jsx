/**
 * 인트로 — 첫 화면 앞에 영상 한 편.
 *
 * 자동재생은 음소거일 때만 브라우저가 허용한다.
 * 그래서 무음으로 시작하고, 소리는 버튼으로 켠다 (발표장에서 필요할 때).
 *
 * 영상이 없거나 못 읽으면 기다리지 않고 바로 넘긴다 —
 * 인트로 때문에 본 화면을 못 보는 일은 없어야 한다.
 */

import { useEffect, useRef, useState } from 'react'

/** 페이드아웃이 끝나고 다음 화면으로 넘어가기까지 */
const FADE_MS = 520

export default function Intro({ onDone }) {
  const videoRef = useRef(null)
  const doneRef = useRef(false)
  const [leaving, setLeaving] = useState(false)
  const [muted, setMuted] = useState(true)

  /** 두 번 불려도 한 번만 넘어간다 (영상 끝 + 건너뛰기가 겹칠 수 있다) */
  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setLeaving(true)
    setTimeout(onDone, FADE_MS)
  }

  /** Esc 로도 건너뛴다 */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /**
   * 자동재생이 막히는 환경이면 굳이 붙잡지 않는다.
   * 단, StrictMode 는 마운트를 한 번 되감는다 — 그때 취소된 play() 까지
   * 「재생 실패」로 세면 인트로가 곧바로 사라진다. 살아 있을 때만 넘긴다.
   */
  useEffect(() => {
    let alive = true
    videoRef.current?.play().catch(() => {
      if (alive) finish()
    })
    return () => {
      alive = false
    }
  }, [])

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted) v.play().catch(() => {})
  }

  return (
    <div className={`intro${leaving ? ' out' : ''}`}>
      <video
        ref={videoRef}
        className="intro-video"
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
      />

      <div className="intro-ui">
        <button type="button" className="intro-btn" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? '소리 켜기' : '소리 끄기'}
        </button>
        <button type="button" className="intro-btn skip" onClick={finish}>
          건너뛰기
        </button>
      </div>
    </div>
  )
}
