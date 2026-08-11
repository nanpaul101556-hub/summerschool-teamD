/**
 * V-World(국토교통부) 조회.
 *
 * 주소 → 좌표(지오코더), 좌표 → 필지 경계(연속지적도).
 * 두 API 모두 CORS 헤더를 주지 않아 프록시(/api/vworld)를 경유한다 —
 * 개발에서는 vite 서버가, 배포에서는 api/vworld.js 가 같은 일을 한다.
 */

/**
 * 지목(地目) — V-World 의 jibun 은 「507-3공」처럼 번호 끝에 지목 한 글자를 붙여 준다.
 * 그 한 글자만 화면 언어로 옮기고 번호는 그대로 둔다.
 */
const JIMOK = {
  전: ['Seminativo', 'Dry field'], 답: ['Risaia', 'Paddy'],
  과: ['Frutteto', 'Orchard'], 목: ['Pascolo', 'Pasture'],
  임: ['Bosco', 'Forest'], 대: ['Lotto edificabile', 'Building lot'],
  장: ['Stabilimento', 'Factory'], 학: ['Scuola', 'School'],
  차: ['Parcheggio', 'Car park'], 창: ['Magazzino', 'Warehouse'],
  도: ['Strada', 'Road'], 철: ['Ferrovia', 'Railway'],
  천: ['Corso d’acqua', 'River'], 구: ['Canale', 'Ditch'],
  유: ['Bacino', 'Reservoir'], 수: ['Acquedotto', 'Waterworks'],
  공: ['Parco', 'Park'], 체: ['Impianto sportivo', 'Sports ground'],
  원: ['Parco divertimenti', 'Amusement park'], 종: ['Luogo di culto', 'Place of worship'],
  사: ['Sito storico', 'Historic site'], 묘: ['Cimitero', 'Cemetery'],
  잡: ['Altro', 'Miscellaneous'],
}

/** 「507-3공」 → { ko: '507-3공', it: '507-3 · Parco', en: '507-3 · Park' } */
function jibunTx(jibun) {
  if (!jibun) return null
  const tail = jibun.slice(-1)
  const hit = JIMOK[tail]
  if (!hit) return { ko: jibun, it: jibun, en: jibun }
  const no = jibun.slice(0, -1)
  return { ko: jibun, it: `${no} · ${hit[0]}`, en: `${no} · ${hit[1]}` }
}

const KEY = import.meta.env.VITE_VWORLD_KEY
const API = '/api/vworld'

export const hasKey = Boolean(KEY)

async function get(path, params, timeout = 12000) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeout)
  try {
    const qs = new URLSearchParams({ p: `req/${path}`, ...params, key: KEY }).toString()
    const res = await fetch(`${API}?${qs}`, { signal: ctl.signal })
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
    jibunTx: jibunTx(p.jibun),
    addr: p.addr,
    /** 개별공시지가 원/m² — 고시 시점을 같이 표기할 것 */
    jiga: p.jiga ? Number(p.jiga) : null,
    gosi: p.gosi_year ? `${p.gosi_year}.${p.gosi_month}` : null,
    geometry: f.geometry,
    areaM2: polygonArea(f.geometry),
  }
}

/**
 * 좌표가 속한 용도지역.
 *
 * LT_C_UQ111 은 국토계획법상 용도지역 레이어다. 건폐율·용적률은 여기 없고
 * 조례가 정하므로, 받은 지역명을 data/zoning.js 의 표에 대입한다.
 */
export async function zoneAt(lng, lat) {
  const d = await get('data', {
    service: 'data',
    request: 'GetFeature',
    data: 'LT_C_UQ111',
    format: 'json',
    size: '1',
    crs: 'EPSG:4326',
    geomFilter: `POINT(${lng} ${lat})`,
  })
  const f = d?.response?.result?.featureCollection?.features?.[0]
  if (!f) return null
  const p = f.properties ?? {}
  return { name: p.uname ?? null, sido: p.sido_name ?? null, sigg: p.sigg_name ?? null }
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
