/**
 * 용도지역별 건폐율·용적률 — 「서울특별시 도시계획 조례」 원문에서 옮긴 값.
 *
 * 출처  법제처 국가법령정보센터 자치법규 MST 2149501 (2026.07.13 시행)
 *       제44조(건폐율) · 제48조(용적률)
 *
 * 용도지역 자체는 V-World 토지이용계획(LT_C_UQ111)에서 좌표로 조회한다.
 * 즉 이 표는 「조회된 용도지역 → 법정 한도」를 잇는 자리다.
 */

const K = (ko, it, en) => ({ ko, it, en })

/** 조례가 정한 한도. 서울도심은 상업지역에서만 값이 갈린다. */
export const ZONES = {
  제1종전용주거지역: { bcr: 50, far: 100 },
  제2종전용주거지역: { bcr: 40, far: 120 },
  제1종일반주거지역: { bcr: 60, far: 150 },
  제2종일반주거지역: { bcr: 60, far: 200 },
  제3종일반주거지역: { bcr: 50, far: 250 },
  준주거지역: { bcr: 60, far: 400 },
  중심상업지역: { bcr: 60, far: 1000, downtown: 800 },
  일반상업지역: { bcr: 60, far: 800, downtown: 600 },
  근린상업지역: { bcr: 60, far: 600, downtown: 500 },
  유통상업지역: { bcr: 60, far: 600, downtown: 500 },
  전용공업지역: { bcr: 60, far: 200 },
  일반공업지역: { bcr: 60, far: 200 },
  준공업지역: { bcr: 60, far: 400 },
  보전녹지지역: { bcr: 20, far: 50 },
  생산녹지지역: { bcr: 20, far: 50 },
  자연녹지지역: { bcr: 20, far: 50 },
}

/**
 * 완화 규정 — 기본 한도만 보여 주면 「지을 수 없는 땅」으로 읽힌다.
 * 녹지지역의 도시계획시설은 조례가 따로 길을 열어 두었다.
 */
export const RELIEF = {
  자연녹지지역: [
    {
      art: '제49조②1가',
      far: 100,
      when: K(
        '기반시설 중 도시관리계획으로 설치하는 시설',
        'Infrastrutture realizzate tramite piano urbanistico attuativo',
      ),
      how: K(
        '지구단위계획으로 고시하거나 시도시계획위원회 심의를 거치면 용적률 100%까지',
        'Fino al 100% previo piano attuativo o parere della commissione urbanistica',
      ),
    },
    {
      art: '제45조①7',
      bcr: 20,
      when: K('도시계획시설 중 공원', 'Parchi fra le opere di piano'),
      how: K('공원의 건폐율은 20% 이하 (유원지는 30%)',
        'Copertura max 20% per i parchi (30% per i parchi ricreativi)'),
    },
  ],
}

export const SOURCE = {
  law: K('서울특별시 도시계획 조례', 'Regolamento urbanistico di Seoul'),
  arts: K('제44조 · 제48조', 'artt. 44 e 48'),
  date: '2026.07.13',
  url: 'https://www.law.go.kr/DRF/lawService.do?OC=test&target=ordin&MST=2149501&type=HTML',
  zoneApi: 'V-World LT_C_UQ111',
}

/** 조회된 용도지역명이 조례 표기와 조금씩 다르다 — 앞뒤 군더더기를 떼고 맞춘다 */
export function lookup(name) {
  if (!name) return null
  const key = String(name).replace(/\s/g, '')
  if (ZONES[key]) return { zone: key, ...ZONES[key], relief: RELIEF[key] ?? null }
  const hit = Object.keys(ZONES).find((z) => key.includes(z) || z.includes(key))
  return hit ? { zone: hit, ...ZONES[hit], relief: RELIEF[hit] ?? null } : null
}

/** 최대 연면적 = 필지면적 × 용적률. 완화가 있으면 그 값도 함께 돌려준다. */
export function capacity(areaM2, z) {
  if (!areaM2 || !z) return null
  const base = Math.round((areaM2 * z.far) / 100)
  const up = z.relief?.find((r) => r.far)
  return {
    base,
    footprint: Math.round((areaM2 * z.bcr) / 100),
    eased: up ? Math.round((areaM2 * up.far) / 100) : null,
    easedFar: up?.far ?? null,
  }
}
