/**
 * 03 머리 — 「어디서 재는가」. 지도와 목록이 좌우로 갈라선다.
 *
 * 왼쪽 DriftFigure 가 시간을 보여 준다면 이것은 공간을 보여 준다.
 * 다섯 갈래가 추상어로 들리는 이유는 잰 자리가 안 보이기 때문이다.
 *
 * 처음에는 정류장 다섯을 다 담으려고 2.3 km 를 한 화면에 넣었다. 그러니 대상지가
 * 점이 되고 「앞 정류장」이 왜 앞인지가 안 보였다. 지도의 일은 위치를 납득시키는
 * 것이지 비교가 아니다. 비교는 옆 목록이 이미 하고 있다.
 *
 * 그래서 대상지 둘레 250 m 만 남긴다. 건물 윤곽과 공원이 보이고, 정류장이
 * 정문 앞 동일로변이라는 것이 눈에 들어온다. 대조군 셋은 1.7~2.3 km 북쪽이라
 * 이 화면 밖이고, 그 사실을 범례에 적는다.
 *
 * 정류장 옆 숫자는 회복률 (2019.07 = 100, 실측). 파랑은 노원구 평균보다
 * 덜 돌아온 곳이다 — 여기 둘 다 그렇고, 둘 다 문화시설로 가는 통행이다.
 * 값을 만들지 않는다. recovery_result.md 의 표 그대로다.
 */

import L from 'leaflet'
import { useEffect, useRef } from 'react'

import { ORIGIN, PLACES } from '../data/sheets'
import { CONTROL, STOP_MAX, STOP_META, STOPS } from '../data/stops'
import { useLang } from '../i18n'

const KEY = import.meta.env.VITE_VWORLD_KEY

/** 미술관 건물은 배경지도가 이미 이름을 달아 준다 — 겹쳐 쓰면 글자가 두 번 보인다 */
const PINS = PLACES.filter((p) => p.kind === 'stop')

const wmts = (layer, ext = 'png') =>
  `https://api.vworld.kr/req/wmts/1.0.0/${KEY}/${layer}/{z}/{y}/{x}.${ext}`

/** 평균보다 덜 돌아온 곳을 강조한다 — 그것이 이 지도가 말하려는 것이다 */
const isLow = (s) => s.idx < CONTROL.idx

const dot = (html) =>
  L.divIcon({ className: 'sm-w', html, iconSize: [0, 0], iconAnchor: [0, 0] })

/** 정류장 두 곳은 STOPS 에 회복률이 있다 — 지도와 목록을 잇는 고리다 */
const idxOf = (id) => STOPS.find((s) => s.ars === id)

export default function SignalMap() {
  const { t, tx, lang } = useLang()
  const box = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!KEY || map.current || !box.current) return undefined

    const m = L.map(box.current, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      keyboard: false,
    })

    L.tileLayer(wmts('Satellite', 'jpeg'), { maxNativeZoom: 19, maxZoom: 20 }).addTo(m)
    L.tileLayer(wmts('Hybrid'), { maxNativeZoom: 19, maxZoom: 20, opacity: 0.75 }).addTo(m)

    const origin = [ORIGIN.lat, ORIGIN.lng]

    // 대상지에서 앞 정류장까지 — 46 m 를 선으로 보여야 「앞」이 납득된다
    for (const p of PINS) {
      L.polyline([origin, [p.lat, p.lng]], {
        color: '#fff',
        weight: p.lead ? 2 : 1,
        opacity: p.lead ? 0.9 : 0.4,
        dashArray: p.lead ? null : '3 5',
      }).addTo(m)
    }

    for (const p of PINS) {
      const s = idxOf(p.id)
      const low = s && isLow(s)
      L.marker([p.lat, p.lng], {
        icon: dot(`<span class="sm-p ${p.kind} ${low ? 'low' : ''}">
                     <i></i>
                     <b>${tx(p.label)}</b>
                     <em>${p.m} m${s ? ` · ${s.idx.toFixed(1)}` : ''}</em>
                   </span>`),
        interactive: false,
      }).addTo(m)
    }

    // 대상지는 이름을 위로 올린다 — 아래·오른쪽은 정류장 이름표가 쓴다
    L.marker(origin, {
      icon: dot(`<span class="sm-site"><b>${tx(ORIGIN.label)}</b><i></i></span>`),
      interactive: false,
    }).addTo(m)

    // 칸 크기가 aspect-ratio 로 정해지므로 레이아웃이 끝난 뒤 다시 맞춘다 —
    // 그러지 않으면 초기 측정값으로 잡혀 이름표가 화면 밖으로 나간다.
    // 대상지와 두 정류장만 담으면 182 m 라 너무 바짝 붙는다.
    // 반쯤 넓혀야 공원과 동일로가 함께 들어오고 「공원 안 건물」이라는 것이 읽힌다.
    const bounds = L.latLngBounds([origin, ...PINS.map((p) => [p.lat, p.lng])]).pad(0.5)
    const fit = () => {
      m.invalidateSize({ animate: false })
      m.fitBounds(bounds, { paddingTopLeft: [40, 34], paddingBottomRight: [40, 40] })
    }
    fit()

    const ro = new ResizeObserver(fit)
    ro.observe(box.current)

    map.current = m
    return () => {
      ro.disconnect()
      m.remove()
      map.current = null
    }
  }, [tx, lang])

  if (!KEY) return null

  return (
    <figure className="sm">
      <div ref={box} className="sm-box" />
      <figcaption className="sm-k">
        <span className="k3">{t('sm.low', { n: CONTROL.idx.toFixed(1) })}</span>
        <em>{t('sm.away')}</em>
      </figcaption>
    </figure>
  )
}

/** 지도 옆에 서는 목록 — 이름과 수치는 여기가 맡는다 */
export function SignalList() {
  const { t, tx } = useLang()
  if (!KEY) return null

  return (
    <section className="sl">
      <header>
        <b>{t('sm.title')}</b>
        <span>{STOP_META.month} · {STOP_META.base}</span>
      </header>

      <ol>
        {STOPS.map((s) => (
          <li key={s.ars} className={isLow(s) ? 'low' : ''}>
            <span className="nm">
              <b>{tx(s.label)}</b>
              <em>{tx(s.sub)}</em>
            </span>
            <span className="bar" aria-hidden="true">
              <i style={{ width: `${(s.raw / STOP_MAX) * 100}%` }} />
            </span>
            <span className="v">{s.raw.toLocaleString('ko-KR')}</span>
            <span className="ix">{s.idx.toFixed(1)}</span>
          </li>
        ))}
        <li className="ctrl">
          <span className="nm">
            <b>{tx(CONTROL.label)}</b>
            <em>{t('sm.ctrl', { n: CONTROL.n })}</em>
          </span>
          <span className="bar" aria-hidden="true" />
          <span className="v">—</span>
          <span className="ix">{CONTROL.idx.toFixed(1)}</span>
        </li>
      </ol>

      <p className="sl-f">
        <span>{t('sm.num')}</span>
        <em>{tx(STOP_META.src)}</em>
      </p>
    </section>
  )
}
