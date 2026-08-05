/**
 * 대상지 확정.
 *
 * 주소는 V-World 로 아무 곳이나 찾을 수 있지만, 정리된 자료(인구·상위계획·
 * 제도 판정)를 가진 곳은 아직 한 곳뿐이다. 그 구분을 화면에 그대로 드러낸다.
 */

import { geocode, parcelAt } from '../lib/vworld'
import { SITE } from './site'

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
  const hit = await geocode(query)
  if (!hit) throw new Error('주소를 찾지 못했습니다')

  // 필지 조회는 실패해도 대상지 자체는 성립한다 — 경계만 없을 뿐이다
  let parcel = null
  try {
    parcel = await parcelAt(hit.lng, hit.lat)
  } catch {
    parcel = null
  }

  const curated = parcel?.pnu === CURATED_PNU

  return {
    name: curated ? SITE.name : (parcel?.addr ?? hit.refined),
    address: hit.refined,
    coords: [hit.lat, hit.lng],
    parcel,
    curated,
  }
}
