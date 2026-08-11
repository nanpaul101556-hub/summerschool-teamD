/**
 * 대상지 지도 — V-World(국토교통부) 배경지도 + 연속지적도 필지 경계.
 *
 * 인증키는 코드에 넣지 않고 .env 의 VITE_VWORLD_KEY 로 받는다.
 * 다만 Vite 의 VITE_* 는 클라이언트 번들에 그대로 들어가므로 브라우저에서
 * 볼 수 있다. V-World 키는 발급 시 등록한 도메인에서만 동작하는 방식이라
 * 이 노출 자체는 정상 사용 범위이고, 도메인 등록이 실질적인 방어선이다.
 */

import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'

import { useLang } from '../i18n'

const KEY = import.meta.env.VITE_VWORLD_KEY

/** V-World WMTS 는 {z}/{y}/{x} 순서다 — x,y 를 뒤집으면 엉뚱한 곳이 나온다. */
const wmts = (layer, ext = 'png') =>
  `https://api.vworld.kr/req/wmts/1.0.0/${KEY}/${layer}/{z}/{y}/{x}.${ext}`

/**
 * native = 타일이 실제로 존재하는 최대 줌 (GetCapabilities 로 실측).
 * 그보다 깊이 들어가면 Leaflet 이 마지막 타일을 확대해 쓰므로 오류가 나지 않는다.
 * dark = 배경이 어두워 경계선을 밝게 그려야 하는 배경도.
 */
const LAYERS = [
  // white 는 옅은 블록과 녹지만 있고 글자가 없다. Hybrid 를 얹어야 지명이 붙는다.
  { key: 'white', tk: 'map.simple', layer: 'white', ext: 'png', native: 18, labels: true },
  { key: 'base', tk: 'map.base', layer: 'Base', ext: 'png', native: 19, muted: true },
  { key: 'sat', tk: 'map.sat', layer: 'Satellite', ext: 'jpeg', native: 19, dark: true, labels: true },
  { key: 'night', tk: 'map.night', layer: 'midnight', ext: 'png', native: 18, dark: true },
]

/** 레이어를 바꿀 때 진행 중이던 요청이 취소되며 tileerror 가 몇 개 뜬다. */
const FAIL_THRESHOLD = 4

export default function SiteMap({ site }) {
  const { t, tx } = useLang()
  const box = useRef(null)
  const map = useRef(null)
  const tiles = useRef(null)
  const labels = useRef(null)
  const shape = useRef(null)

  const [kind, setKind] = useState('white')
  const [failed, setFailed] = useState(false)

  const def = LAYERS.find((l) => l.key === kind) ?? LAYERS[0]

  // 지도 생성 (1회)
  useEffect(() => {
    if (!KEY || map.current || !box.current) return undefined

    const m = L.map(box.current, {
      center: site.coords,
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    })
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    map.current = m

    return () => {
      m.remove()
      map.current = null
      tiles.current = null
      labels.current = null
      shape.current = null
    }
  }, [site.coords])

  // 배경 레이어
  useEffect(() => {
    const m = map.current
    if (!m) return

    if (tiles.current) tiles.current.remove()
    if (labels.current) {
      labels.current.remove()
      labels.current = null
    }

    // 새 레이어로 바꿀 때마다 판정을 다시 시작한다
    setFailed(false)
    let fails = 0

    const layer = L.tileLayer(wmts(def.layer, def.ext), {
      minZoom: 7,
      maxZoom: 19,
      maxNativeZoom: def.native,
      className: def.muted ? 'vw-muted' : '',
    })
    layer.on('tileerror', () => {
      fails += 1
      if (fails >= FAIL_THRESHOLD) setFailed(true)
    })
    layer.on('load', () => {
      fails = 0
      setFailed(false)
    })
    layer.addTo(m)
    tiles.current = layer

    // white·Satellite 는 글자가 없어 오버레이가 필요하다. Base 는 이미 갖고 있다.
    if (def.labels) {
      labels.current = L.tileLayer(wmts('Hybrid', 'png'), {
        minZoom: 7,
        maxZoom: 19,
        maxNativeZoom: 19,
      }).addTo(m)
    }

    if (shape.current) shape.current.bringToFront()
  }, [def])

  // 필지 경계 — 배경 밝기에 따라 선 색을 뒤집는다
  useEffect(() => {
    const m = map.current
    if (!m) return

    if (shape.current) {
      shape.current.remove()
      shape.current = null
    }

    const ink = def.dark ? '#FFFFFF' : '#1A1A1A'
    const halo = def.dark ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.85)'

    if (site.parcel?.geometry) {
      const under = L.geoJSON(site.parcel.geometry, {
        style: { color: halo, weight: 7, opacity: 1, fill: false },
        interactive: false,
      })
      const line = L.geoJSON(site.parcel.geometry, {
        style: { color: ink, weight: 2.5, opacity: 1, fillColor: ink, fillOpacity: 0.08 },
      })

      const tag = L.marker(line.getBounds().getCenter(), {
        interactive: false,
        icon: L.divIcon({
          className: 'sitetag-wrap',
          html: `<span class="sitetag">${tx(site.nameTx ?? site.name)}</span>`,
          iconSize: [0, 0],
        }),
      })

      shape.current = L.layerGroup([under, line, tag]).addTo(m)
      m.fitBounds(line.getBounds(), { padding: [40, 40] })
    } else {
      shape.current = L.circleMarker(site.coords, {
        radius: 8,
        color: ink,
        weight: 2,
        fillColor: def.dark ? '#1A1A1A' : '#FFFFFF',
        fillOpacity: 1,
      }).addTo(m)
      m.setView(site.coords, 17)
    }
  }, [site, def])

  if (!KEY) {
    return (
      <div className="mapslot">
        <div>
          <div className="t">{t('map.noKey')}</div>
          <div className="s">{t('map.noKeyHint')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`mapwrap ${def.dark ? 'on-dark' : ''}`}>
      <div ref={box} className="mapcanvas" />

      <div className="maptoggle">
        {LAYERS.map((l) => (
          <button
            key={l.key}
            type="button"
            className={kind === l.key ? 'on' : ''}
            onClick={() => setKind(l.key)}
          >
            {t(l.tk)}
          </button>
        ))}
      </div>

      {site.parcel && (
        <div className="mapbadge">
          {t('map.parcel', {
            jibun: tx(site.parcel.jibunTx ?? site.parcel.jibun),
            gosi: site.parcel.gosi,
          })}
        </div>
      )}

      {failed && (
        <div className="maperr">{t('map.tileFail')}</div>
      )}
    </div>
  )
}
