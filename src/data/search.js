/**
 * 대상지 확정.
 *
 * 주소는 V-World 로 아무 곳이나 찾을 수 있지만, 정리된 자료(인구·상위계획·
 * 제도 판정)를 가진 곳은 아직 한 곳뿐이다. 그 구분을 화면에 그대로 드러낸다.
 */

import { geocode, parcelAt, zoneAt } from '../lib/vworld'
import { SITE } from './site'
import { lookup } from './zoning'

/** 중계문화공원 필지의 고유번호 — 이 필지에만 정리된 자료가 붙는다. */
const CURATED_PNU = '1135010600105070003'

export const SAMPLE = {
  label: SITE.name,
  query: SITE.address,
}

/**
 * 주소 한 줄에서 대상지를 만든다.
 * @returns {Promise<object>} 대상지
 * @throws {Error} 주소를 못 찾거나 조회에 실패했을 때
 */
export async function resolveSite(query) {
  // 정리된 대상지(중계문화공원)는 좌표를 이미 알고 있으므로 주소검색을 건너뛴다.
  // 다만 필지 경계와 용도지역은 V-World 에서 그대로 가져온다 — 지도에 테두리가 서려면
  // geometry 가 있어야 하기 때문이다. 조회가 실패해도 대상지 자체는 열린다.
  if (query.trim() === SAMPLE.query) {
    const [lat, lng] = SITE.coords
    const [parcel, zone] = await Promise.all([
      parcelAt(lng, lat).catch(() => null),
      zoneAt(lng, lat).catch(() => null),
    ])
    return {
      name: SITE.name,
      address: SITE.address,
      nameTx: SITE.nameTx,
      addrTx: SITE.addrTx,
      coords: SITE.coords,
      parcel,
      zone: zone?.name ? { ...zone, ...lookup(zone.name) } : null,
      curated: true,
    }
  }

  const hit = await geocode(query)
  if (!hit) throw new Error('주소를 찾지 못했습니다')

  // 필지와 용도지역은 실패해도 대상지 자체는 성립한다 — 경계나 한도만 없을 뿐이다
  const [parcel, zone] = await Promise.all([
    parcelAt(hit.lng, hit.lat).catch(() => null),
    zoneAt(hit.lng, hit.lat).catch(() => null),
  ])

  const curated = parcel?.pnu === CURATED_PNU

  return {
    name: curated ? SITE.name : (parcel?.addr ?? hit.refined),
    address: hit.refined,
    nameTx: curated ? SITE.nameTx : null,
    addrTx: curated ? SITE.addrTx : null,
    coords: [hit.lat, hit.lng],
    parcel,
    /** 조회된 용도지역과 조례가 정한 건폐율·용적률 */
    zone: zone?.name ? { ...zone, ...lookup(zone.name) } : null,
    curated,
  }
}
