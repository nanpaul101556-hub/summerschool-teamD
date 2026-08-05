/**
 * 대상지 목록.
 * 자료가 확보된 곳만 넣는다 — 여기 없는 대상지는 판정할 수 없다.
 */

import { SITE } from './site'

export const CATALOG = [
  {
    id: 'junggye',
    name: SITE.name,
    address: SITE.address,
    keywords: ['중계문화공원', '중계근린공원', '중계', '노원구', '노원', '동일로1229', 'junggye'],
  },
]

const norm = (s) => s.toLowerCase().replace(/\s+/g, '')

/** 부분 일치 검색. 입력이 키워드의 일부이거나 그 반대여도 잡는다. */
export function findSite(query) {
  const q = norm(query ?? '')
  if (!q) return null
  return (
    CATALOG.find((s) =>
      s.keywords.some((k) => {
        const nk = norm(k)
        return nk.includes(q) || q.includes(nk)
      }),
    ) ?? null
  )
}
