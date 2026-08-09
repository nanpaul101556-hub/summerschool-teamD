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
  // 정리된 대상지(중계문화공원)는 SITE 에 자료가 다 있으므로 V-World 없이 진입한다.
  // 발표·데모에서 API 키가 없어도 이 대상지는 항상 열린다.
  if (query.trim() === SAMPLE.query) {
    return {
      name: SITE.name,
      address: SITE.address,
      coords: SITE.coords,
      parcel: null,
      zone: null,
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
    coords: [hit.lat, hit.lng],
    parcel,
    /** 조회된 용도지역과 조례가 정한 건폐율·용적률 */
    zone: zone?.name ? { ...zone, ...lookup(zone.name) } : null,
    curated,
  }
}
