/**
 * V-World(국토교통부) 조회.
 *
 * 주소 → 좌표(지오코더), 좌표 → 필지 경계(연속지적도).
 * 두 API 모두 CORS 헤더를 주지 않아 dev 서버 프록시(/vworld)를 경유한다.
 */

const KEY = import.meta.env.VITE_VWORLD_KEY
const API = '/vworld/req'

export const hasKey = Boolean(KEY)

async function get(path, params, timeout = 12000) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeout)
  try {
    const qs = new URLSearchParams({ ...params, key: KEY }).toString()
    const res = await fetch(`${API}/${path}?${qs}`, { signal: ctl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('응답 시간 초과')
    if (err instanceof TypeError) throw new Error('V-World 에 연결할 수 없습니다')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/** 도로명으로 먼저 찾고, 없으면 지번으로 다시 찾는다. */
export async function geocode(address) {
  for (const type of ['road', 'parcel']) {
    const d = await get('address', {
      service: 'address',
      request: 'getcoord',
      version: '2.0',
      crs: 'epsg:4326',
      format: 'json',
      refine: 'true',
      simple: 'false',
      type,
      address,
    })
    const r = d?.response
    if (r?.status === 'OK' && r.result?.point) {
      return {
        lat: Number(r.result.point.y),
        lng: Number(r.result.point.x),
        refined: r.refined?.text ?? address,
        matchedBy: type,
      }
    }
  }
  return null
}

/** 좌표가 속한 필지의 경계와 지적 정보. */
export async function parcelAt(lng, lat) {
  const d = await get('data', {
    service: 'data',
    request: 'GetFeature',
    data: 'LP_PA_CBND_BUBUN',
    format: 'json',
    size: '1',
    crs: 'EPSG:4326',
    geomFilter: `POINT(${lng} ${lat})`,
  })
  const f = d?.response?.result?.featureCollection?.features?.[0]
  if (!f) return null

  const p = f.properties ?? {}
  return {
    pnu: p.pnu,
    jibun: p.jibun,
    addr: p.addr,
    /** 개별공시지가 원/m² — 고시 시점을 같이 표기할 것 */
    jiga: p.jiga ? Number(p.jiga) : null,
    gosi: p.gosi_year ? `${p.gosi_year}.${p.gosi_month}` : null,
    geometry: f.geometry,
    areaM2: polygonArea(f.geometry),
  }
}

/**
 * 필지 면적(m²).
 *
 * 지적 API 가 면적을 주지 않으므로 경계에서 산출한다. 필지 크기에서는
 * 위경도를 중심 위도 기준 평면으로 펴서 신끈공식을 쓰는 것으로 충분하다.
 * 공부상 면적과 소수점 단위 차이가 날 수 있어 화면에는 「경계 산출」로 표기한다.
 */
function polygonArea(geometry) {
  if (!geometry) return null
  const polys =
    geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates]

  const R = 6378137
  const rad = Math.PI / 180
  let total = 0

  for (const poly of polys) {
    poly.forEach((ring, i) => {
      const lat0 = ring.reduce((s, [, y]) => s + y, 0) / ring.length
      const kx = R * rad * Math.cos(lat0 * rad)
      const ky = R * rad

      let a = 0
      for (let j = 0, k = ring.length - 1; j < ring.length; k = j++) {
        const [x1, y1] = ring[k]
        const [x2, y2] = ring[j]
        a += x1 * kx * (y2 * ky) - x2 * kx * (y1 * ky)
      }
      // 첫 링은 외곽, 나머지는 구멍이므로 뺀다
      total += (i === 0 ? 1 : -1) * Math.abs(a / 2)
    })
  }
  return Math.round(total)
}
