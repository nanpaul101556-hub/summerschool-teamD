/**
 * 03 머리 오른쪽 — 「어디서 재는가」.
 *
 * 왼쪽 그림이 시간을 보여 준다면 이것은 공간을 보여 준다.
 * 다섯 갈래가 추상어로 들리는 이유는 잰 자리가 안 보이기 때문이다.
 * 대상지와 정류장을 위성 위에 얹으면 「앞 정류장」이 말 그대로 앞이라는 것이,
 * 그리고 그 통행이 얼마나 큰지가 한눈에 들어온다.
 *
 * 지도에는 이름을 쓰지 않는다. 대상지와 미술관 앞은 182 m 라 이 축척에서
 * 글자가 서로를 덮는다. 지도는 위치와 크기만 맡고, 이름과 수치는 옆 목록이 맡는다.
 * 둘을 잇는 것은 원 안의 회복률 숫자다.
 *
 * 원 크기 = 그 달 승하차 (실측)   원 안 숫자 = 회복률, 2019.07 = 100 (실측)
 * 파란 원 = 노원구 평균보다 덜 돌아온 곳 — 둘 다 문화시설로 가는 통행이다
 *
 * 값을 만들지 않는다. 두 수치 모두 recovery_result.md 의 표 그대로다.
 */

import L from 'leaflet'
import { useEffect, useRef } from 'react'

import { ORIGIN } from '../data/sheets'
import { CONTROL, rOf, STOP_MAX, STOP_META, STOPS } from '../data/stops'
import { useLang } from '../i18n'

const KEY = import.meta.env.VITE_VWORLD_KEY

const wmts = (layer, ext = 'png') =>
  `https://api.vworld.kr/req/wmts/1.0.0/${KEY}/${layer}/{z}/{y}/{x}.${ext}`

/** 평균보다 덜 돌아온 곳을 강조한다 — 그것이 이 지도가 말하려는 것이다 */
const isLow = (s) => s.idx < CONTROL.idx

const dot = (html, cls) =>
  L.divIcon({ className: cls, html, iconSize: [0, 0], iconAnchor: [0, 0] })

export default function SignalMap() {
  const { t, tx, lang } = useLang()
  const box = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!KEY || map.current || !box.current) return undefined

    const m = L.map(box.current, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0, // 정수 배율로 튀면 화면이 대상지 둘레를 한참 벗어난다
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      keyboard: false,
    })

    L.tileLayer(wmts('Satellite', 'jpeg'), { maxNativeZoom: 19, maxZoom: 21 }).addTo(m)
    L.tileLayer(wmts('Hybrid'), { maxNativeZoom: 19, maxZoom: 21, opacity: 0.55 }).addTo(m)

    const origin = [ORIGIN.lat, ORIGIN.lng]

    for (const s of STOPS) {
      const low = isLow(s)
      L.circleMarker([s.lat, s.lng], {
        radius: rOf(s.raw),
        color: low ? '#2997FF' : '#fff',
        weight: 1.4,
        opacity: low ? 1 : 0.75,
        fillColor: low ? '#0066CC' : '#fff',
        fillOpacity: low ? 0.42 : 0.15,
        interactive: false,
      }).addTo(m)

      L.marker([s.lat, s.lng], {
        icon: dot(`<span class="sm-n ${low ? 'low' : ''}">${s.idx.toFixed(1)}</span>`, 'sm-w'),
        interactive: false,
      }).addTo(m)
    }

    // 대상지 — 앞 정류장과 46 m 라 이 축척에서는 몇 픽셀 차이다.
    // 정류장 숫자는 원 한가운데 있으므로 대상지 이름은 원 아래로 내린다 —
    // 위쪽 182 m 는 미술관 앞 원이 이미 차지하고 있다.
    const lead = STOPS.find((s) => s.lead)
    L.marker(origin, {
      icon: dot(
        `<span class="sm-site" style="padding-top:${Math.round(rOf(lead.raw)) + 3}px">
           <i></i><b>${t('sm.site')}</b>
         </span>`, 'sm-w',
      ),
      interactive: false,
    }).addTo(m)

    // 대상지가 남쪽 끝이고 이름표가 그 아래에 붙으므로 아래만 더 비운다.
    // aspect-ratio 로 칸 크기가 정해지므로 레이아웃이 끝난 뒤 한 번 더 맞춘다 —
    // 그러지 않으면 초기 측정값으로 잡혀 대상지 이름이 아래로 잘린다.
    const bounds = L.latLngBounds([origin, ...STOPS.map((s) => [s.lat, s.lng])])
    const fit = () => {
      m.invalidateSize({ animate: false })
      m.fitBounds(bounds, { paddingTopLeft: [14, 14], paddingBottomRight: [14, 40] })
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
  }, [t, lang])

  if (!KEY) return null

  return (
    <figure className="sm">
      <figcaption className="sm-h">
        <b>{t('sm.title')}</b>
        <span>{STOP_META.month} · {STOP_META.base}</span>
      </figcaption>

      <div className="sm-b">
        <div ref={box} className="sm-box" />

        <ol className="sm-l">
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
      </div>

      <figcaption className="sm-k">
        <span className="k1">{t('sm.size')}</span>
        <span className="k2">{t('sm.num')}</span>
        <span className="k3">{t('sm.low', { n: CONTROL.idx.toFixed(1) })}</span>
        <em>{tx(STOP_META.src)}</em>
      </figcaption>
    </figure>
  )
}
