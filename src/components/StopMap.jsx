/**
 * 정류장 지도 — 「앞 정류장」이 실제로 어디인지.
 *
 * 점과 선으로 그린 모식도는 거리는 맞아도 「어디」를 답하지 못한다.
 * 위성 배경 위에 찍어야 도로와 건물이 함께 보이고, 그제야 정류장이
 * 대상지 정문 앞 동일로변이라는 것이 눈에 들어온다.
 *
 * 배경지도는 SiteMap 과 같은 V-World WMTS 를 쓴다.
 */

import L from 'leaflet'
import { useEffect, useRef } from 'react'

import { ORIGIN, PLACES } from '../data/sheets'
import { useLang } from '../i18n'

const KEY = import.meta.env.VITE_VWORLD_KEY

/** V-World WMTS 는 {z}/{y}/{x} 순서다 — x,y 를 뒤집으면 엉뚱한 곳이 나온다. */
const wmts = (layer, ext = 'png') =>
  `https://api.vworld.kr/req/wmts/1.0.0/${KEY}/${layer}/{z}/{y}/{x}.${ext}`

/** 배경이 어두우므로 선과 글자는 밝게, 대상지만 흰 채움으로 도드라지게 한다 */
const pin = (p, tx) => {
  const site = p.kind === 'site'
  const stop = p.kind === 'stop'
  const cls = [site ? 'site' : '', stop ? 'stop' : '', p.lead ? 'lead' : ''].join(' ')
  return L.divIcon({
    className: 'stop-pin-wrap',
    html: `<span class="stop-pin ${cls}">
             <i></i>
             <b>${tx(p.label)}</b>
             ${p.m ? `<em>${p.m} m</em>` : ''}
           </span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export default function StopMap() {
  const { t, tx } = useLang()
  const box = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!KEY || map.current || !box.current) return undefined

    const origin = [ORIGIN.lat, ORIGIN.lng]
    const m = L.map(box.current, {
      center: origin,
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    })
    L.control.zoom({ position: 'bottomright' }).addTo(m)

    L.tileLayer(wmts('Satellite', 'jpeg'), { maxNativeZoom: 19, maxZoom: 21 }).addTo(m)
    L.tileLayer(wmts('Hybrid'), { maxNativeZoom: 19, maxZoom: 21, opacity: 0.85 }).addTo(m)

    // 대상지에서 각 지점으로 선을 긋는다 — 앞 정류장만 실선
    for (const p of PLACES) {
      L.polyline([origin, [p.lat, p.lng]], {
        color: '#fff',
        weight: p.lead ? 2.2 : 1.2,
        opacity: p.lead ? 0.95 : 0.55,
        dashArray: p.lead ? null : '4 5',
      }).addTo(m)
    }

    for (const p of [{ ...ORIGIN, kind: 'site' }, ...PLACES]) {
      L.marker([p.lat, p.lng], { icon: pin(p, tx), interactive: false }).addTo(m)
    }

    // 모든 지점이 들어오도록 맞춘다
    const pts = [origin, ...PLACES.map((p) => [p.lat, p.lng])]
    m.fitBounds(L.latLngBounds(pts).pad(0.35))

    map.current = m
    return () => {
      m.remove()
      map.current = null
    }
  }, [tx])

  if (!KEY) {
    return <div className="stop-map none">{t('map.noKey')}</div>
  }

  return (
    <div className="stop-map">
      <div ref={box} className="stop-map-box" />
      <div className="stop-map-cap">{t('ev.mapCap')}</div>
    </div>
  )
}
